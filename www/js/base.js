$(document).ready(function(){
    updateUserInfo();
});
//style:success,info,warning,danger
function hint(message, style, time){
    style = (style === undefined) ? 'info' : style;
    time = (time === undefined) ? 3000 : time;
    $('<div>')
        .appendTo('body')
        .addClass('hint hint-' + style)
        .html(message)
        .show()
        .delay(time)
        .fadeOut();
};
function updateUserInfo(){
    if($.cookie("userId") && $.cookie("userImgExt")){
        $("#curUserImg").attr("src","/img/user/"+$.cookie("userId")+$.cookie("userImgExt")+"?"+Math.floor(Math.random()*6)
            +"?"+Math.floor(Math.random()*6));
    }else{
        $("#curUserImg").attr("src","/img/user/default.png");
    }
    if($.cookie("username")){
        $(".headerUsername").text($.cookie("username"));
    }
}
function getQueryVariable(variable){
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
    }
    return(false);
}
function newRoomFn(){
    if (validateNewRoom()) {
        var roomname = $("#roomname").val();
        var roomintro = $("#roomintro").val();
        var roomImgs = !!$("#roomimg")[0].files ? $("#roomimg")[0].files : [];
        // if (!roomImgs.length || !window.FileReader) {
        //     alert("浏览器不支持HTML5");
        //     console.log("浏览器不支持HTML5");
        //     return false;
        // };

        var newRoomFd = new FormData();
        // 把 input 标签获取的文件加入 FromData 中
        newRoomFd.append('file', roomImgs[0]);
        newRoomFd.append('roomname', roomname);
        newRoomFd.append('roomintro', roomintro);
        newRoomFd.append('hotScore', 0);
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth()+1;
        var day = date.getDate();
        var hour = date.getHours();
        var min = date.getMinutes();
        var sec = date.getSeconds();
        var startTime=year+"-"+month+"-"+day+" "+hour+":"+min+":"+sec;
        newRoomFd.append("startTime", startTime);
        newRoomFd.append('owner', $.cookie("userId"));
        newRoomFd.append('id',Date.parse(new Date())+Math.floor(Math.random()*10));
        $.ajax({
            url : "/newRoom",
            type : 'POST',
            data : newRoomFd,
            processData : false,
            contentType : false,
            dataType : "json",
            beforeSend:function(){
                console.log("正在进行，请稍候");
            },
            success : function(data) {
                if(data.res_code=="1"){
                    hint(data.error,'danger');
                }else{
                    hint("新建成功",'success');
                    window.location.href=window.location.origin+"/chatroom?id="+data.roomcookie.id;
                }
            },
            error : function(data) {
                console.log("error");
            }
        });
    }
}
function validateNewRoom(){
    var roomname = $("#roomname").val();
    var roomintro = $("#roomintro").val();
    var regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im,
        regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
    if(regEn.test(roomname) || regCn.test(roomname)) {
        $("#roomname").focus();
        $("#errorHint001").html("聊天室名称不能包含特殊字符!");
        return false;
    }else{
        $("#errorHint001").html("");
    }
    if(roomname.length>12 || roomname.length<3) {
        $("#roomname").focus();
        $("#errorHint001").html("聊天室名称长度应在3-12位!");
        return false;
    }else{
        $("#errorHint001").html("");
    }
    // if(regEn.test(roomintro) || regCn.test(roomintro)) {
    //     $("#roomintro").focus();
    //     $("#errorHint002").html("聊天室介绍不能包含特殊字符!");
    //     return false;
    // }else{
    //     $("#errorHint002").html("");
    // }
    if(roomintro.length>70) {
        $("#roomintro").focus();
        $("#errorHint002").html("聊天室介绍长度应在70位以内");
        return false;
    }else{
        $("#errorHint002").html("");
    }
    if($("#roomimg")[0].files.length===0){
        $("#errorHint003").html("请上传聊天室头像");
        return false;
    }
    return true;
}