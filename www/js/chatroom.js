$(document).ready(function(){
    updateChatUserInfo();
    var id = getQueryVariable("id");
    $.get("/getRoomInfo?id="+id,function(data) {
        // console.log(data);
        if(data.res_code=="1"){
                hint(data.error,'danger');
                setTimeout(function(){
                    window.location.href=window.location.origin+"/allroom";
                },1000);
            }else{
                updateRoomInfo(data.roomInfo);
                // 渲染roominfo
            }
    });
});
var favFlag=false;
function updateRoomInfo(room){
    $(".roomInfo img").attr("src","/img/room/"+room.id+room.imgExt);
    $(".roomName").text(room.roomname);
    $(".roomStartTime").text(room.startTime);
    $(".roomIntro").text("介绍："+room.intro);
    $.cookie("curRoomId",room.id);
    checkFav($.cookie("userId"),room.id);
}
function updateChatUserInfo(){
    if($.cookie("userImgExt")){
        $(".myInfoImg").attr("src","/img/user/"+$.cookie("userId")+$.cookie("userImgExt"));
    }else{
        $(".myInfoImg").attr("src","/img/user/default.png");
    }
    $(".myInfoUsername").text($.cookie("username"));
    $(".myInfoAddr").text($.cookie("userAddr"));
}
function checkFav(userId,roomId){
    $.get("/checkFav?userid="+userId+"&roomid="+roomId,function(data,err){
        // console.log(data);
        if(data.res_code==0 ){
            favFlag=data.favFlag;
            chgFavBtn(favFlag);
        }else{
            console.log(data.error+"id:"+favFlag);
            favFlag=false;
        }
    });
}
function chgFavBtn(flag){
    if(flag){
        $(".addFavBtn").addClass("addFavBtnActive");
        $(".addFavBtn").html("<span class='glyphicon glyphicon-ok'></span> 已收藏");
    }else{
        $(".addFavBtn").removeClass("addFavBtnActive");
        $(".addFavBtn").html("<span class='gglyphicon glyphicon-plus'></span> 收藏");
    }
}
function chgFavFn(){
    if(favFlag){
        //取消收藏
        removeFav($.cookie("userId"),$.cookie("curRoomId"));
        chgFavBtn(false);
        favFlag=false;
    }else{
        //添加收藏
        addFav($.cookie("userId"),$.cookie("curRoomId"));
        chgFavBtn(true);
        favFlag=true;
    }
}
function removeFav(userid,roomid){
    $.get("/removeFav?userid="+userid+"&roomid="+roomid,function(data,err){
        if(data.res_code==0 ){
            hint(data.error,"success");
        }else{
            console.log(data.error+"id:"+favFlag);
            hint("取消收藏失败："+data.error,"danger");
        }
    });
}
function addFav(userid,roomid){
    $.get("/addFav?userid="+userid+"&roomid="+roomid,function(data,err){
        if(data.res_code =='0' ){
            hint(data.error,"success");
        }else{
            console.log(data.error+"id:"+favFlag);
            hint("收藏失败："+data.error,"danger");
        }
    });
}
function addMsgLiLeft(username,imgExt,addr,time,cont){

}
function addMsrLiRight(time,cont){

}
function addUserEnterLi(addr,usrnametime){

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
$(function(){
    function Chat(domList){
        this.socket = null;
        this.domList = domList;//通过参数domList对象传入页面相关的dom元素
        this.init();
    }
    Chat.prototype = {
        init : function(){
            var me = this;
            me.socket = io.connect();
            me.socket.on('connect', function(){
                console.log("socket连接成功");
            });
            me.userName = $.cookie('username');
            me.socket.emit('enter', {
                username:$.cookie('username'),
                time:getTime(),
                addr:$.cookie('userAddr')
            });
            me.bind();
        },
        replaceExpress : function(msg){
            // var r = new RegExp('\[\d+\.gif\]', 'g');
            var reg = /\[\d+\.gif\]/g;
            var result, str;
            // console.log(c);
            // var str = msg.replace(r, '<img src="./expression/QQexpression/'+i+'.gif" alt="'+i+'.gif" align="center"/>');
            while( result = reg.exec(msg) ){
                msg = msg.replace(result[0], '<img class="expre" src="/img/QQexpression/'+result[0].substr(1, (result[0].length-2) )+'" alt="qq表情" align="center"/>');
            }
            return msg;
        },
        bind : function(){
            var me = this;
            //绑定enter
            me.domList.chatCont.focus(function(event) {
                $('body').keyup(function(event) {
                    if( event.keyCode == 13 ){
                        me.domList.send.click();
                    }
                });
            });
            //发送消息按键
            me.domList.send.click(function(event) {
                //替换表情
                if( me.domList.chatCont.val().trim() == '' ){
                    return false;
                }
                var msg = me.domList.chatCont.val();
                msg = me.replaceExpress(msg);
                var color = me.domList.colorBox.val();
                var time = getTime();
                var _html = "<li class='msgLiRight'><div class='userInfo'>[<span class='name'>"
                    +$.cookie("username")+"</span>]-[<span class='addr'>"
                    +$.cookie("userAddr")+"</span>] at <span class='sendTime'>["
                    +time+"]</span><img src='/img/user/"
                    +$.cookie("userId")+$.cookie("userImgExt")+"'></div><div class='clearFloat'></div>"
                    +"<p class='msg' style='color:"+color+"'>"+msg+"</p></li>";
                me.domList.chatCont.val('');
                me.domList.msgList.append(_html);
                me.domList.msgList.animate({ scrollTop : me.domList.msgList[0].scrollHeight }, 500);
                //将消息发送给服务器
                me.socket.emit('postMsg', {
                    username:$.cookie("username"),
                    msg:msg,
                    time:time,
                    imgExt:$.cookie("userImgExt"),
                    id:$.cookie("userId"),
                    addr:$.cookie("userAddr")}
                );
                console.log("发送消息");
            });
            // 系统消息/enter/leave/onlineUserArr
            me.socket.on('system', function(data){
                var type=  (data.type === 'enter' )? "加入" : "离开";
                var msg = data.addruser
                    +type+"了会话 at "
                    +data.time;
                var str = '<li class="userEnter">'+msg+'</li>';
                me.domList.msgList.append(str);
                me.domList.onlineNum.html(data.userArr.length);
                //在线人员列表
                var str2 = '';
                for( var i = 0; i< data.userArr.length; i++ ){
                    str2 += '<li>'+data.userArr[i]+'</li>';
                }
                me.domList.onlineList.html(str2);
            });
            // 接受新消息
            me.socket.on('newMsg', function(data){
                data.msg = me.replaceExpress(data.msg);
                var str = "<li class='msgLiLeft'><div class='userInfo'><img src='/img/user/"
                    +data.id+data.imgExt+"'>[<span class='name'>"
                    +data.username+"</span>]-[<span class='addr'>"
                    +data.addr+"</span>] at <span class='sendTime'>["
                    +data.time+"]</span></div><div class='clearFloat'></div>"
                    +"<p class='msg'>"+data.msg+"</p></li>";
                me.domList.msgList.append(str);
                me.domList.msgList.animate({ scrollTop : me.domList.msgList[0].scrollHeight }, 500);
            });
            // 点击显示表情框
            me.domList.addLook.click(function(event) {
                if( me.domList.lookBox.hasClass('hide') ){
                    var expressionNum = 132;
                    var str = '';
                    for(var i = 1; i<= expressionNum; i++){
                        str += '<img src="/img/QQexpression/'+i+'.gif" alt="'+i+'.gif" align="center"/>';
                    }
                    me.domList.lookBox.html(str);
                    me.domList.lookBox.removeClass('hide');
                }else{
                    me.domList.lookBox.addClass('hide');
                }
                event.stopPropagation();
            });
            //点击表情
            me.domList.lookBox.delegate('img', 'click', function(event){
                var str = $(this).attr('alt');
                me.domList.chatCont.val( me.domList.chatCont.val() +'['+str+']' );
                $(this).parent().addClass('hide');
                me.domList.chatCont.focus();
                event.stopPropagation();
            });
            $(document).click(function(event) {
                me.domList.lookBox.addClass('hide');
            });
            // 文字颜色
            me.domList.wordColor.click(function(event) {
                me.domList.colorBox.click();
            });
            //绑定图片按钮点击
            me.domList.addImg.click(function(event){
                me.domList.addImgInput.click();
            });
            //发送表情
            me.domList.addImgInput.change(function(event){
                var file=$(this)[0].files[0];
                var time = getTime();
                var reader=new FileReader;
                reader.readAsDataURL(file);
                reader.onload=function(){
                    var _html = "<li class='msgLiRight'><div class='userInfo'>[<span class='name'>"
                        +$.cookie("username")+"</span>]-[<span class='addr'>"
                        +$.cookie("userAddr")+"</span>] at <span class='sendTime'>["
                        +time+"]</span><img src='/img/user/"
                        +$.cookie("userId")+$.cookie("userImgExt")+"'></div><div class='clearFloat'></div>"
                        +"<img class='imgMsgRight' src='"+this.result+"'/><div class='clearFloat'></div></li>";
                    me.domList.msgList.append(_html);
                    me.domList.msgList.animate({ scrollTop : me.domList.msgList[0].scrollHeight }, 500);
                    me.socket.emit('postImg', {
                        username:$.cookie("username"),
                        img:this.result,
                        time:time,
                        imgExt:$.cookie("userImgExt"),
                        id:$.cookie("userId"),
                        addr:$.cookie("userAddr")}
                    );
                };
            });
            //接受表情
            me.socket.on("newImg",function(data){
                var _html = "<li class='msgLiLeft'><div class='userInfo'><img src='/img/user/"
                    +data.id+data.imgExt+"'>[<span class='name'>"
                    +data.username+"</span>]-[<span class='addr'>"
                    +data.addr+"</span>] at <span class='sendTime'>["
                    +data.time+"]</span></div><div class='clearFloat'></div>"
                    +"<img class='imgMsgLeft' src='"+data.img+"'/><div class='clearFloat'></div></li>";
                me.domList.msgList.append(_html);
                me.domList.msgList.animate({ scrollTop : me.domList.msgList[0].scrollHeight }, 500);
            })
        }
    };
    new Chat({
        send : 		$('.send'),
        chatCont:   $('#chatCont'),
        colorBox :  $('.colorBox'),
        msgList:    $('.msgList'),
        onlineList: $('.onlineList'),
        lookBox :  $('.lookBox'),
        addLook :   $('.addLook'),
        addImg :   $('.addImg'),
        addImgInput :   $('.addImgInput'),
        onlineNum :   $('.onlineNum'),
        wordColor :   $('.chgTextColor')
    });
});