import http from "http";
import SocketIO from "socket.io";
import express from "express";


const app = express();

app.set("view engine","pug");
app.set("views", __dirname + "/views"); //__dirname root 경로의미로 views자동으로 찾아간다. 
app.use("/public", express.static(__dirname+"/public"));
app.get("/", (req,res)=> res.render("home")); //routing처리 home.pug로 설정
app.get("/*",(req,res)=> res.redirect("/"));

const httpServer = http.createServer(app); 
const wsServer = SocketIO(httpServer);

function publicRooms(){
    // const sids = wsServer.sockets.adapter.sids;
    // const rooms = wsServer.sockets.adapter.rooms;

    const{
        sockets:{
            adapter:{sids,rooms},
        },
    }= wsServer;

    const publicRooms = [];
    rooms.forEach((_,key)=>{
        if(sids.get(key) === undefined){
            publicRooms.push(key);
        }
    });
    return publicRooms; //룸에있는 모든 방의 정보(배열)을 리턴한다. 
}

function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection",(socket)=>{
    socket["nickname"] = "익명";

    socket.onAny((event)=>{ //onAny은 소켓에서 발생하는 이벤트를 등록하는 역할.
        console.log(wsServer.sockets.adapter);
        console.log(`Socket Event : ${event}`);
    })

    socket.on("enter_room",(roomName,done)=>{
        done();
        socket.join(roomName);
        socket.to(roomName).emit("welcome",socket.nickname,countRoom(roomName)); //to메서드 사용해 특정 사용자에게 이벤트를 발생시킴 
        wsServer.sockets.emit("room_change",publicRooms());
    });
    
    socket.on("disconnecting",()=>{ // 사용자측에서 연결이 끊어질 때(끊기기 직전) 
        socket.rooms.forEach(room => socket.to(room).emit("bye",socket.nickname,countRoom(room)-1));
    })

    socket.on("disconnect",()=>{ // 사용자측에서 연결이 끊어졌을 때
        wsServer.sockets.emit("room_change",publicRooms());
    })

    socket.on("new_message",(msg,room,done)=>{
        socket.to(room).emit("new_message",`${socket.nickname}:${msg}`);
        done(); //콜백함수 호출
    });

    socket.on("nickname",(nickname)=>(socket["nickname"] = nickname));
});


const handleListen =()=>console.log("listening on http://localhost:3000");
httpServer.listen(3000,handleListen); 

