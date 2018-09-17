var express = require('express'),
    app = express(),
    server = app.listen(3000),
    io = require('socket.io')(server),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookie = require('cookie-parser'),
    room = require('./db/db.js').room;
app.use(cookie());
// 视图engine setup
app.set('views', path.join(__dirname, 'views'));
app.set( 'view engine', 'html' );
app.engine( '.html', require( 'ejs' ).__express );
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var routes = require('./routes/index');
app.use(express.static(path.join(__dirname, 'www')));
app.use('/', routes);
console.log('server started on http://localhost:3000');
//socket部分
var roomList=[];

io.on("connection",function(socket) {
    var url = socket.request.headers.referer;
    var roomId = getQueryVariable(url,"id");
    var score=0;
    var user;

    //用户加入socket连接监听
    socket.on('enter', function(data) {
        // console.log("收到enter");
        score+=2;
        user="["+data.addr+"]"+data.username;
        if(!roomList[roomId]){
            roomList[roomId]=[];
        }
        socket.join(roomId);
        // socket.userNowIndex=userArr.length;

        var samePeople = 0;
        //遍历数组，如果该名字不存在则push
        for(var i = 0; i < roomList[roomId].length; i++){
            if(roomList[roomId][i] == "["+data.addr+"]"+data.username )
                samePeople++;
        }
        if( samePeople == 0 ){
            roomList[roomId].push(user);
        }else{
            // 打开多个窗口用户名加序号
            roomList[roomId].push("["+data.addr+"]"+data.username+"["+samePeople+"]");
        }
        io.to(roomId).emit('system',{
            addruser:user,
            time:data.time,
            type:"enter",
            userArr:roomList[roomId]
        });
        console.log(user+"加入了房间："+roomId);
    });
    //断开连接监听
    socket.on('disconnect', function(){
        score+=2;
        if(roomList[roomId]){
            var index = roomList[roomId].indexOf(user);
            var curUser="";
            console.log(curUser);
            if(index !== -1){
                curUser=roomList[roomId].splice(index, 1);
            }
            socket.leave(roomId);
            io.to(roomId).emit('system',{
                addruser:curUser,
                type:"leave",
                userArr:roomList[roomId],
                time:getTime()
            });
            console.log(user+"离开了房间："+roomId);
        }
        if(roomId){
            room.updateOne({id:roomId},{$inc:{hotScore:score}},function(err){
                if(err){
                    console.log("房间："+roomId+"的hotScore更新失败");
                }else{
                    console.log("房间："+roomId+"的hotScore更新成功");
                }
            });
        }
    });
    //接收新消息监听
    socket.on('postMsg', function(data){
        score+=2;
        if(roomList[roomId].indexOf("["+data.addr+"]"+data.username)===-1){
            return false;
        }
    	socket.to(roomId).emit('newMsg',{
    	    id:data.id,
            imgExt:data.imgExt,
            username:data.username,
            addr:data.addr,
            time:data.time,
            msg:data.msg,
        });
    	console.log("房间:"+roomId+"收到来自用户"+data.username+"的消息");
    });
    //接受新图片监听
    socket.on("postImg",function(data){
        score+=5;
        if(roomList[roomId].indexOf("["+data.addr+"]"+data.username)===-1){
            return false;
        }
        socket.to(roomId).emit('newImg',{
            id:data.id,
            imgExt:data.imgExt,
            username:data.username,
            addr:data.addr,
            time:data.time,
            img:data.img,
        });
    });
});
function getQueryVariable(url,variable){
    var query = url.split("?")[1];
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
    }
    return(false);
}
function getTime(){
    var date=new Date();
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var day = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();
    return year+"-"+month+"-"+day+" "+hour+":"+min+":"+sec;
}