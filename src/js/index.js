$(function(){
    //sign = 1：显示注册模块
    //sign = 0：显示登录模块
    var sign = 1;
    if(getQueryVariable("loginerror")==1){
        hint("登录失败，用户不存在","danger");
        sign=0;
    }else if(getQueryVariable("nameRepeat")==1){
        hint("注册失败,用户名已存在","danger");
        sign=1;
    }else if(getQueryVariable("illegalReq")==1){
        hint("非法请求，请先登录再访问","danger");
        sign=0;
    }else{
        if($.cookie("username")){
            sign=0;
        }else{
            sign=1;
        }
    }
    if(sign){
        $(".loginContent").hide();
        $(".signContent").show();
        $(".switchHint ").text("已有账号？");
        $("#signSwitch").text("登录");
    }else{
        $(".signContent").hide();
        $(".loginContent").show();
        $("#username").val($.cookie("username"));
        $(".switchHint ").text("没有账号？");
        $("#signSwitch").text("注册");
    }
    $("#signSwitch").click(function(){
        if(sign){
            $(".signContent").slideToggle("fast","linear");
            $(".loginContent").slideToggle("fast","linear");
            $(".switchHint ").text("没有账号？");
            $("#signSwitch").text("注册");
            sign = 0;
        }else{
            $(".signContent").slideToggle("fast","linear");
            $(".loginContent").slideToggle("fast","linear");
            $(".switchHint").text("已有账号？");
            $("#signSwitch").text("登录");
            sign = 1;
        }
    });
});
function submitLoginForm(){
    if (validateLogin()) {
        $(".form-login").submit();
    }else{
        return false;
    }
}
function submitSignForm(){
    if (validateSign()) {
        var inputUsername = $("#inputUsername").val();
        $("#addr").val(remote_ip_info.country+remote_ip_info.province+remote_ip_info.city);
        $("#id").val(Date.parse(new Date())+Math.floor(Math.random()*10));
        $.cookie("username",inputUsername,{expires:7,path:"/"});
        $(".form-sign").submit();
    }else{
        return false;
    }
}
function validateLogin(){
    var username = $("#username").val();
    var password = $("#password").val();
    var regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im,
        regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
    if(regEn.test(username) || regCn.test(username)) {
        $("#username").val("");
        $("#username").focus();
        $("#errorHint4").html("账号不能包含特殊字符!");
        return false;
    }else{
        $("#errorHint4").html("");
    }
    if(username.length>12 || username.length<3) {
        $("#username").focus();
        $("#errorHint4").html("账号长度不正确!");
        return false;
    }else{
        $("#errorHint4").html("");
    }
    if(regEn.test(username) || regCn.test(username)) {
        $("#username").val("");
        $("#username").focus();
        $("#errorHint4").html("账号不能包含特殊字符!");
        return false;
    }else{
        $("#errorHint4").html("");
    }
    if(password.length>18 || username<6) {
        $("#password").focus();
        $("#errorHint5").html("密码长度不正确!");
        return false;
    }else{
        $("#errorHint5").html("");
    }
    return true;
}
function validateSign(){
    var inputUsername = $("#inputUsername").val();
    var inputPassword = $("#inputPassword").val();
    var inputPasswordCheck = $("#inputPasswordCheck").val();
    var regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im,
        regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
    if(regEn.test(inputUsername) || regCn.test(inputUsername)) {
        $("#inputUsername").focus();
        $("#errorHint1").html("账号不能包含特殊字符!");
        return false;
    }else{
        $("#errorHint1").html("");
    }
    if(inputUsername.length>12 || inputUsername.length<3) {
        $("#inputUsername").focus();
        $("#errorHint1").html("账号长度应在3-12位!");
        return false;
    }else{
        $("#errorHint1").html("");
    }
    if(inputPassword.length>18 || inputPassword.length<6) {
        $("#inputPassword").focus();
        $("#errorHint2").html("密码长度应在6-18位!");
        return false;
    }else{
        $("#errorHint2").html("");
    }
    if(inputPassword != inputPasswordCheck) {
        $("#inputPasswordCheck").focus();
        $("#errorHint3").html("两次密码输入不同！");
        return false;
    }else{
        $("#errorHint3").html("");
    }
    return true;
}
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