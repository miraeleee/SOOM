const socket = io()

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerHTML = message;
    ul.appendChild(li);
}


function handleNicknameSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#name input");
    const value = input.value;
    socket.emit("nickname",value);
    input.value = "";
}

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message",value,roomName,()=>{
        addMessage(`Me: ${value}`);//콜백함수 정의도 해서 서버에 보냄
    })
    input.value="";
}

function showRoom(){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `이 방의 이름은 ${roomName}`;
    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit",handleMessageSubmit);
    nameForm.addEventListener("submit",handleNicknameSubmit)
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room",input.value, showRoom); //emit은 이벤트를 발생시킨다는 의미.소켓을 통해 서버로 보낸다. /{payload:input.value}은 이벤트를 통해 전달될 데이터(객체형태)
    roomName = input.value;
    input.value="";
}

form.addEventListener("submit",handleRoomSubmit);

socket.on("welcome",(userNickname,newCount)=>{
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}(${newCount})`;
    addMessage(`${userNickname}이(가) 입장했습니다.`);
});

socket.on("bye",(userNickname,newCount)=>{
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}(${newCount})`;
    addMessage(`${userNickname}이(가) 퇴장했습니다.`);
});

socket.on("new_message",(msg)=>{
    addMessage(msg);
})

socket.on("room_change",(rooms)=>{
    //console.log(rooms);
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML="";
    if(rooms.length === 0){
        return;
    }
    rooms.forEach((room) => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
})
