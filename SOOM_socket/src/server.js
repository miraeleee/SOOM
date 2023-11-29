import http from "http";
import WebSocket from "ws";
import express from "express";


const app = express();

app.set("view engine","pug");
app.set("views", __dirname + "/views"); //__dirname root 경로의미로 views자동으로 찾아간다. 
app.use("/public", express.static(__dirname+"/public"));
app.get("/", (req,res)=> res.render("home")); //routing처리 home.pug로 설정
app.get("/*",(req,res)=> res.redirect("/"));

const httpServer = http.createServer(app); 
const wsServer = SocketIO(httpServer);
const handleListen = () => console.log("연결중 http://localhost:3000");
app.listen(3000,handleListen);
const server = http.createServer(app);
const wss = new WebSocket.Server({server});//server에 websocket을 생성해서, http서버에 소켓을 같이 전달, 한개의 포트를 같이 사용하기 위함

const sockets= [];

wss.on("connection",(socket)=>{
    sockets.push(socket); //connect될때마다 생성되는 socket를 sockets에 넣어준다. 
    socket["nickname"]= "익명";
    console.log("브라우저가 연결되었습니다.");
    socket.on("close",()=>console.log("서버>서버와 연결이 끊겼습니다."));
    // socket.on("message",(message)=>{
    socket.on("message",(msg)=>{//문자열을 다시 json으로 변환해서 사용자 화면에 띄어줘야함
        const message = JSON.parse(msg);
        //console.log(message.type, message.payload);
        //console.log(`[서버] ${message}`);
        //socket.send(`[서버] ${message}`);
        // sockets.forEach(aSocket=>aSocket.send(`${message}`)); //forEach는 각배열에 차례대로 접근해서 실행하는 반복문이다. 
        switch(message.type){
            case "new_message":
                //sockets.forEach(aSocket => aSocket.send(`${message.payload}`));
                sockets.forEach(aSocket => aSocket.send(`${socket.nickname}:${message.payload}`));
                break;
            case "nickname":
                socket["nickname"] = message.payload;
                break;
        }
    });
}); // on매소드가 connection되면 매개변수에 socket에 있는 메서드를 이용해 실행시킴.

