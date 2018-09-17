var express = require('express');
var router = express.Router();
var user = require('../db/db').user;
var room = require('../db/db').room;
var fs = require('fs');
var multer  = require('multer');
var session = require('express-session');

var tmpId="tmpId";

// 使用 session 中间件
router.use(session({
    secret :  'secret', // 对session id 相关的cookie 进行签名
    resave : true,
    saveUninitialized: false, // 是否保存未初始化的会话
    cookie : {
        maxAge : 1000 * 60 * 30, // 设置 session 的有效时间，单位毫秒
    },
}));

// 上传用户头像--使用硬盘存储模式设置存放接收到的用户头像的路径以及文件名
var userImgStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 接收到文件后输出的保存路径（若不存在则需要创建）
        cb(null, './www/img/user');
    },
    filename: function (req, file, cb) {
        var ext=file.originalname.substring(file.originalname.lastIndexOf("."),file.originalname.length);//后缀名
        var query = {username: req.cookies.username};
        (function(){
            user.findOne(query, function(err, doc){    //count返回集合中文档的数量，和 find 一样可以接收查询条件。query 表示查询的条件
                if(err){
                    console.error(query.username + ":查询失败 " + new Date());
                }else{
                    // 查找用户是否存在原头像
                    var files=fs.readdirSync("./www/img/user");
                    for(var i=0;i<files.length;i++){
                        if(files[i].indexOf(req.cookies.id)>=0){
                            // 若存在则删除
                            fs.unlink("./www/img/user/"+files[i], function (err) {
                                if (err) return console.log(err);
                            });
                            break;
                        }
                    }
                    cb(null, req.cookies.id+ext);
                }
            });
        })(query);
    }
});
var userImgUpload = multer({ storage: userImgStorage });

// 上传聊天室头像--使用硬盘存储模式设置存放接收到的用户头像的路径以及文件名
var roomImgStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 接收到文件后输出的保存路径（若不存在则需要创建）
        cb(null, './www/img/room');
    },
    filename: function (req, file, cb) {
        var filename = file.originalname;
        var ext=filename.substring(filename.lastIndexOf("."),filename.length);
        cb(null, tmpId+ext);
    }
});
var roomImgUpload = multer({ storage: roomImgStorage });

router.get('/', function(req, res) {
    if(req.query.logout=1){
        console.log("用户 %s 已注销 at %s",req.cookies.username,new Date());
        req.session.username = null;
        res.render('index', { title: 'index' });
    }else{
        console.log('来自客户端游客的请求：%s %s %s', req.method, req.url, req.path);
        res.render('index', { title: 'index' });
    }
});
//注册登录
router.post('/main', function(req, res) {
    // 注册
    if(req.body.formType == "sign"){
        // console.log(req.body.addr);
        console.log('来自客户端游客的注册请求：%s %s %s', req.method, req.url, req.path);
        var query={username:req.body.username};
        user.count(query, function (err, doc) {
            if(doc>=1){
                console.log(query.username + ": 注册失败,用户名重复 " + new Date());
                res.redirect('/?nameRepeat=1');
            }else{
                var userTmp = new user({
                    username:req.body.username,
                    password:req.body.password,
                    score:0,
                    addr:req.body.addr,
                    id:req.body.id,
                    imgExt:"",
                    rooms:[],
                    favrooms:[],
                    myrooms:[]
                });
                userTmp.save(function(err, docs){
                    if(err) console.log(err);
                    console.log("用户"+req.body.username+"注册"+'保存成功：' + docs);
                    res.cookie("username",userTmp.username,{expires: new Date(Date.now() + 604800000),path:"/"});
                    res.cookie("userId",userTmp.id,{expires: new Date(Date.now() + 604800000),path:"/"});
                    res.cookie("userAddr",userTmp.addr,{expires: new Date(Date.now() + 604800000),path:"/"});
                    res.cookie("userImgExt",userTmp.imgExt,{expires: new Date(Date.now() + 604800000),path:"/"});
                    res.cookie("userScore",userTmp.score,{expires: new Date(Date.now() + 604800000),path:"/"});
                    req.session.username = req.body.username; // 登录成功，设置 session
                    res.render('main', { title:'main' });
                });
            }
        });
    }else if(req.body.formType == "login"){
        console.log('来自客户端的登录请求：%s %s %s', req.method, req.url, req.path);
        var query = {username: req.body.username, password: req.body.password};
        // console.log(query);
        (function(){
            user.findOne(query, function(err, doc){
                if(doc){
                    console.log(req.body.username + ": 登陆成功 " + new Date());
                    res.cookie("username",doc.username,{expires: new Date(Date.now() + 604800000),path:"/"});
                    res.cookie("userId",doc.id,{expires: new Date(Date.now() + 604800000),path:"/"});
                    res.cookie("userAddr",doc.addr,{expires: new Date(Date.now() + 604800000),path:"/"});
                    res.cookie("userImgExt",doc.imgExt,{expires: new Date(Date.now() + 604800000),path:"/"});
                    res.cookie("userScore",doc.score,{expires: new Date(Date.now() + 604800000),path:"/"});
                    req.session.username = req.body.username; // 登录成功，设置 session
                    res.render('main', { title:'main' });
                }else{
                    console.log(query.username + ": 登陆失败,用户不存在 " + new Date());
                    // console.error(err);
                    res.redirect('/?loginerror=1');
                }
            });
        })(query);
    }
});
//非法路由验证；
router.use(function(req, res, next) {
    //非法路由
    if(req.session.username){
        console.log('来自已登录客户端的请求：%s %s %s', req.method, req.url, req.path);
        next();
    }else{
        console.log('来自客户端的非法请求：%s %s %s', req.method, req.url, req.path);
        res.redirect('/?illegalReq=1');
    }
});
router.get('/main',function(req,res){
    res.render('main', { title:'main' });
});
router.get('/center',function(req,res){
    res.render('center', { title:'center' });
});
router.get('/chat',function(req,res){
    res.render('chat', { title:'chat' });
});
router.get('/allroom',function(req,res){
    res.render('allroom', { title:'allroom' });
});
router.get('/about',function(req,res){
    res.render('about', { title:'about' });
});
router.get('/msg',function(req,res){
    res.redirect('/center#msg');
});
router.get('/getRoomInfo',function(req,res){
    var query={id:req.query.id};
    room.findOne(query,function(err,doc){
        if(doc){
            res.json({res_code: '0',error:"",roomInfo:doc});
        }else{
            res.json({res_code: '1',error:"该聊天室不存在"});
        }
    });
});
router.get('/checkFav',function(req,res){
    var userId=req.query.userid;
    var roomId=req.query.roomid;
    user.findOne({id:userId},function(err,doc){
        if(doc){
            if(doc.favrooms.indexOf(roomId)>=0){
                res.json({res_code: '0',error:"",favFlag:true});
            }else{
                res.json({res_code: '0',error:"",favFlag:false});
            }
        }else{
            res.json({res_code: '1',error:"该用户不存在"});
        }
    });
});
router.get('/removeFav',function(req,res){
    var userId=req.query.userid;
    var roomId=req.query.roomid;
    user.findOne({id:userId},function(err,doc){
        if(doc){
            var favrooms=doc.favrooms;
            var index=favrooms.indexOf(roomId);
            if(index>-1){
                favrooms.splice(index,1);
                user.updateOne({id:userId},{favrooms:favrooms},function(){
                    res.json({res_code: '0',error:"取消收藏成功"});
                });
            }else{
                res.json({res_code: '0',error:"用户未收藏该聊天室"});
            }
        }else{
            res.json({res_code: '1',error:"该用户不存在"});
        }
    });
});
router.get('/addFav',function(req,res){
    var userId=req.query.userid;
    var roomId=req.query.roomid;
    user.findOne({id:userId},function(err,doc){
        if(doc){
            var favrooms=doc.favrooms;
            var index=favrooms.indexOf(roomId);
            if(index>-1){
                res.json({res_code: '0',error:"用户已经收藏该聊天室"});
            }else{
                favrooms.push(roomId);
                user.updateOne({id:userId},{favrooms:favrooms},function(){
                    res.json({res_code: '0',error:"添加收藏成功"});
                });
            }
        }else{
            res.json({res_code: '1',error:"该用户不存在"});
        }
    });
});
router.get('/mychatroom',function(req,res){
    res.redirect('/center#mychatroom');
});
router.get('/chatroom',function(req,res){
    res.cookie("curRoomId",req.query.id,{expires: new Date(Date.now() + 604800000),path:"/"});
    res.render('chatroom', { title:'chatroom' });
});
router.post('/infoedit',function(req,res){
    var conditions = {"username":req.cookies.username};
    var updates = {username:req.body.username,password:req.body.password};
    var query = {username:req.body.username};
    user.count(query,function(err,doc){
        if(doc>=1 && req.cookies.username!==req.body.username){
            console.log(req.body.username+"更新用户名信息失败"+ new Date());
            res.json({res_code: '1',error:"用户名已存在"});
        }else{
            user.update(conditions, updates, function (error) {
                if (error) {
                    console.error(error);
                    console.log(req.body.username+"更新用户名失败"+ new Date());
                    res.json({res_code: '1',error:"写入数据库失败"});
                }else{
                    console.log(req.body.username+"更新用户名成功"+ new Date());
                    res.cookie(username,req.body.username);
                    res.json({res_code: '0',username:req.body.username});
                }
            });
        }
    });
});
router.post('/upload/userImg',userImgUpload.single('file'),function(req,res){
    var filename = req.file.filename;
    // console.log('文件类型：%s', file.mimetype);
    // console.log('原始文件名：%s', file.originalname);
    // console.log('文件大小：%s', file.size);
    // console.log('文件保存路径：%s', file.path);
    // console.log(file);
    // 接收文件成功后返回数据给前端
    var id=filename.substring(0,filename.lastIndexOf("."));
    var ext=filename.substring(filename.lastIndexOf("."),filename.length);
    var conditions = {"id":id};
    var updates = {imgExt:ext};
    user.update(conditions, updates, function (error) {
        if (error) {
            console.error(error);
            console.log(req.body.username+"更新用户头像失败"+ new Date());
            res.json({res_code: '1',error:"写入数据库失败"});
        }else{
            console.log(req.body.username+"更新用户头像成功"+ new Date());
            res.json({res_code: '0',id:id,ext:ext});
        }
    });
});
router.post('/newRoom',roomImgUpload.single('file'),function(req,res){
    // console.log(req.body,roomname);
    // console.log(req.file);
    var filename = req.file.filename;
    var id = req.body.id;
    var ext=filename.substring(filename.lastIndexOf("."),filename.length);
    var query={roomname:req.body.roomname};
    room.count(query, function (err, doc) {
        if(doc>=1){
            console.log(query.roomname + ": 新建失败,聊天室名称已存在 " + new Date());
            res.json({res_code: '1',error:": 新建失败,聊天室名称已存在 "});
        }else{
            var roomTmp=new room({
                roomname: req.body.roomname,
                startTime: req.body.startTime,
                hotScore:req.body.hotScore,
                intro:req.body.roomintro,
                id:req.body.id,
                imgExt:ext,
                users:[],
                onlineUsers:[],
                owner:req.body.owner
            });
            roomTmp.save(function(err, docs){
                if(err) console.log(err);
                console.log("聊天室"+req.body.roomname+"新建成功" + docs);
                //将头像名tmpId+ext改为Id+ext
                var roomImgs=fs.readdirSync("./www/img/room");
                for(var i=0;i<roomImgs.length;i++){
                    if(roomImgs[i].indexOf(tmpId)>=0){
                        // 存在则重命名
                        var oldPath="./www/img/room/"+roomImgs[i];
                        var newPath="./www/img/room/"+id+ext;
                        fs.rename(oldPath, newPath, function (err) {
                            if (err) {
                                console.log("存储roomImg名称失败");
                                res.json({res_code: '0',error:": 新建成功,图片存储失败",roomcookie:roomTmp});
                            }else{
                                res.cookie("curRoomId",id,{expires: new Date(Date.now() + 604800000),path:"/"});
                                res.json({res_code: '0',error:": 新建成功",roomcookie:roomTmp});
                            }
                        });
                    }
                }
                //将聊天室id存入user.myrooms[]
                user.findOne({id:req.body.owner},function(err,doc){
                    doc.myrooms.push(id);
                    user.update({id:req.body.owner},{myrooms:doc.myrooms},function(){
                        console.log("新建的聊天室[id:"+id+"]已经关联到用户[id:"+req.body.owner+"]的myrooms属性"+new Date());
                    });
                })
            });
        }
    });
});
router.post('/editRoom',roomImgUpload.single('file'),function(req,res){
    // console.log(req.body,roomname);
    // console.log(req.file);
    var filename = req.file.filename;
    var id = req.body.roomid;
    var ext=filename.substring(filename.lastIndexOf("."),filename.length);
    var conditions = {id:id};
    var query = {roomname:req.body.roomname};
    var updates = {roomname:req.body.roomname,intro:req.body.roomintro,imgExt:ext};
    room.find(query,function(err,docs){
        if(docs.length>1){
            console.log(req.body.roomname+"修改聊天室信息失败"+ new Date());
            res.json({res_code: '1',error:"聊天室名已存在"});
        }else if(docs.length=1){
            if(docs[0].id !==id){
                console.log(req.body.roomname+"修改聊天室信息失败"+ new Date());
                res.json({res_code: '1',error:"聊天室名已存在"});
            }else{
                room.update(conditions, updates, function (error) {
                    if (error) {
                        console.error(error);
                        console.log(req.body.roomname+"修改聊天室信息失败"+ new Date());
                        res.json({res_code: '1',error:"写入数据库失败"});
                    }else{
                        //将头像名tmpId+ext改为Id+ext
                        var roomImgs=fs.readdirSync("./www/img/room");
                        for(var i=0;i<roomImgs.length;i++){
                            if(roomImgs[i].indexOf(tmpId)>=0){
                                // 存在则重命名
                                var oldPath="./www/img/room/"+roomImgs[i];
                                var newPath="./www/img/room/"+id+ext;
                                fs.rename(oldPath, newPath, function (err) {
                                    if (err) {
                                        console.log("存储roomImg名称失败");
                                        res.json({res_code: '0',error:": 修改成功,图片存储失败"});
                                    }else{
                                        console.log(req.body.username+"修改聊天室信息成功"+ new Date());
                                        res.json({res_code: '0'});
                                    }
                                });
                            }
                        }
                    }
                });
            }
        }else{
            room.update(conditions, updates, function (error) {
                if (error) {
                    console.error(error);
                    console.log(req.body.roomname+"修改聊天室信息失败"+ new Date());
                    res.json({res_code: '1',error:"写入数据库失败"});
                }else{
                    //将头像名tmpId+ext改为Id+ext
                    var roomImgs=fs.readdirSync("./www/img/room");
                    for(var i=0;i<roomImgs.length;i++){
                        if(roomImgs[i].indexOf(tmpId)>=0){
                            // 存在则重命名
                            var oldPath="./www/img/room/"+roomImgs[i];
                            var newPath="./www/img/room/"+id+ext;
                            fs.rename(oldPath, newPath, function (err) {
                                if (err) {
                                    console.log("存储roomImg名称失败");
                                    res.json({res_code: '0',error:": 修改成功,图片存储失败"});
                                }else{
                                    console.log(req.body.username+"修改聊天室信息成功"+ new Date());
                                    res.json({res_code: '0'});
                                }
                            });
                        }
                    }
                }
            });
        }
    });
});
router.get('/roomList.json',function(req,res){
    room.find({},function(err,docs){
        res.json(docs);
    });
});
router.get('/roomHot20.json',function(req,res){
    room.find({}).sort({"hotScore":-1}).limit(20).exec(function(err,docs){
        res.json(docs);
    });
});
router.get('/favRoomList.json',function(req,res){
    user.findOne({username:req.cookies.username},"favrooms",function(err,doc){
        var roomsId=doc.favrooms;
        room.find({"id":{"$in":roomsId}},function(err,docs){
            if(err){
                res.json({res_code:1,error:"数据库读取失败"});
            }else{
                res.json({res_code:0,error:"数据库读取成功",data:docs});
            }
        });
    });
});
router.get('/myRoomList.json',function(req,res){
    user.findOne({username:req.cookies.username},"myrooms",function(err,doc){
        // console.log(doc.myrooms);
        var roomsId=doc.myrooms;
        room.find({id:{"$in":roomsId}},function(err,docs){
            if(err){
                res.json({res_code:1,error:"数据库查询失败"});
            }else{
                // console.log(docs);
                res.json({res_code:0,error:"查询成功",data:docs});
            }
        });
    });
});
router.get('/delRoom',function(req,res){
    room.findOne({ id:req.query.id}, function (err,doc) {
        var owner=doc.owner;
        room.deleteOne({ id:req.query.id}, function (err) {
            if(err){
                res.json({res_code:1});
            }else{
                res.json({res_code:0})
            }
        });
    });
});
//404
router.get('*', function(req, res){
    console.log('来自已登录客户端的404请求：%s %s %s', req.method, req.url, req.path);
    res.render('404.html', {title: 'Not Found'});
});
module.exports = router;