var myRoomList=[];
$(document).ready(function(){
    if(getQueryVariable("nameRepeat")==1){
        hint("修改用户名失败","danger");
    }
    // 头像
    $(".leftMask").hide();
    $(".info .left").mouseenter(function(){
        $(".leftMask").show();
    });
    $(".leftMask").mouseleave(function(){
        $(".leftMask").hide();
    });
    //个人信息
    if($.cookie("username")){
        $(".username").text($.cookie("username"));
    }
    if($.cookie("userScore") && $.cookie("userScore")!=="undefined"){
        $(".score").text($.cookie("userScore"));
    }else{
        $(".score").text("0");
    }
    if($.cookie("userAddr") && $.cookie("userAddr")!=="undefined"){
        $(".addr").text($.cookie("userAddr"));
    }else{
        $(".addr").text("无");
    }
    //修改头像
    $(".leftMask").click(function(){
        $("#uploadImg").click();
    });
    $.get("/myRoomList.json",function(data){
        if(data.res_code==1){
            console.log("读取我的聊天室失败");
        }else{
            myRoomList=data.data;
            $("#myRoomTable").bootstrapTable('destroy');
            $('#myRoomTable').bootstrapTable({
                data:myRoomList,
                columns: [{
                    title: '#',
                    formatter: function (value, row, index) {
                        return index+1;
                    }
                },{
                    field: 'id',
                    title: '聊天室id'
                },{
                    field: 'roomname',
                    title: '聊天室名称'
                },{
                    field: 'hotScore',
                    title: '聊天室热度'
                },{
                    field: 'startTime',
                    title: '聊天室创建时间'
                },{
                    field: 'intro',
                    title: '聊天室介绍'
                },{
                    title: '聊天室头像',
                    formatter: function (value, row, index) {
                        value='<a href="/img/room/'+row.id+row.imgExt+'" >查看</a> '
                        return value;
                    },
                    field: 'imgExt'
                },{
                    title: '进入',
                    formatter: function (value, row, index) {
                        value='<a href="/chatroom?id='+row.id+'" ><span class="glyphicon glyphicon-log-in"></span></a>';
                        return value;
                    },
                    field: 'id'
                },{
                    title: '编辑',
                    formatter: function (value, row, index) {
                        value='<a href="#" class="roomEditBtn" onclick="showRoomEditModal('+row.id+')"><span class="glyphicon glyphicon-edit"></span></a>' ;
                        return value;
                    },
                    field: 'id'
                }, {
                    title: '删除',
                    formatter: function (value, row, index) {
                        value = '<a href="#" class="roomEditBtn" onclick="delRoom(' + row.id + ')"><span class="glyphicon glyphicon-remove"></span></a>';
                        return value;
                    },
                    field: 'id'
                }]
            });
        }
    })
});
// ajax上传头像
function uploadImgFn(){
    var files = !!$("#uploadImg")[0].files ? $("#uploadImg")[0].files : [];
    if (!files.length || !window.FileReader) {
        alert("浏览器不支持HTML5");
        console.log("浏览器不支持HTML5");
        return false;
    };
    // 创建一个FormData对象,用来组装一组用 XMLHttpRequest发送请求的键/值对
    var fd = new FormData();
    // 把 input 标签获取的文件加入 FromData 中
    fd.append('file', files[0]);

    $.ajax({
        url : "/upload/userImg",
        type : 'POST',
        data : fd,
        processData : false,
        contentType : false,
        dataType : "json",
        beforeSend:function(){
            console.log("正在进行，请稍候");
        },
        success : function(data) {
            hint('修改成功','success');
            $.cookie("userId",data.id,{expires:7,path:"/"});
            $.cookie("userImgExt",data.ext,{expires:7,path:"/"});
            updateUserInfo();
        },
        error : function(data) {
            console.log("error");
        }
    });
}
//编辑用户信息表单验证
function validateEdit(){
    var username = $("#username").val();
    var password = $("#password").val();
    var regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im,
        regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
    if(regEn.test(username) || regCn.test(username)) {
        $("#username").focus();
        $("#errorHint1").html("账号不能包含特殊字符!");
        return false;
    }else{
        $("#errorHint1").html("");
    }
    if(username.length>12 || username.length<3) {
        $("#inputUsername").focus();
        $("#errorHint1").html("账号长度应在3-12位!");
        return false;
    }else{
        $("#errorHint1").html("");
    }
    if(password.length>18 || password.length<6) {
        $("#password").focus();
        $("#errorHint2").html("密码长度应在6-18位!");
        return false;
    }else{
        $("#errorHint2").html("");
    }
    return true;
}
// ajax修改用户信息
function editInfoFn(){
    if (validateEdit()) {
        var username = $("#username").val();
        var password = $("#password").val();
        var postInfo = {"username":username,"password":password};
        $.post("infoedit",postInfo,function(data) {
            if(data.res_code=="0"){
                hint('修改成功','success');
                $.cookie("username",username,{expires:7,path:"/"});
                $(".close").click();
                updateUserInfo();
            }else{
                hint('修改失败'+data.error,'danger');
            }
        },"json");
    }
}
function updateUserInfo(){
    if($.cookie("userId") && $.cookie("userImgExt")){
        $("#curUserImg").attr("src","/img/user/"+$.cookie("userId")+$.cookie("userImgExt")+"?"+Math.floor(Math.random()*6));
        $(".curUserImg").attr("src","/img/user/"+$.cookie("userId")+$.cookie("userImgExt")+"?"+Math.floor(Math.random()*6));
    }else{
        $("#curUserImg").attr("src","/img/user/default.png");
        $(".curUserImg").attr("src","/img/user/default.png");
    }
    if($.cookie("username")){
        $(".headerUsername").text($.cookie("username"));
        $(".username").text($.cookie("username"));
    }
}
//ajax删除room
function delRoom(id){
    $.get("/delRoom?id="+id,function(data){
        if(data.res_code==0){
            hint("删除成功","success");
            $("#myRoomTable").bootstrapTable('refresh');
        }else{
            hint("删除失败","danger");
        }
    });
}
//修改room信息
//编辑用户信息表单验证
function validateEditRoom(){
    var roomname = $("#roomnameEdit").val();
    var roomintro = $("#roomintroEdit").val();
    var regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im,
        regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
    if(regEn.test(roomname) || regCn.test(roomname)) {
        $("#roomname").focus();
        $("#errorHint100").html("聊天室名称不能包含特殊字符!");
        return false;
    }else{
        $("#errorHint100").html("");
    }
    if(roomname.length>12 || roomname.length<3) {
        $("#roomname").focus();
        $("#errorHint100").html("聊天室名称长度应在3-12位!");
        return false;
    }else{
        $("#errorHint100").html("");
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
        $("#errorHint200").html("聊天室介绍长度应在70位以内");
        return false;
    }else{
        $("#errorHint200").html("");
    }
    if($("#roomimgEdit")[0].files.length===0){
        $("#errorHint300").html("请上传聊天室头像");
        return false;
    }
    return true;
}
// ajax修改用户信息
function editRoomFn(){
    if (validateEditRoom()) {
        var roomid = $("#roomIdEdit").val();
        var roomname = $("#roomnameEdit").val();
        var roomintro = $("#roomintroEdit").val();
        var roomImgs = !!$("#roomimgEdit")[0].files ? $("#roomimgEdit")[0].files : [];
        // if (!roomImgs.length || !window.FileReader) {
        //     alert("浏览器不支持HTML5");
        //     console.log("浏览器不支持HTML5");
        //     return false;
        // };

        var editRoomFd = new FormData();
        // 把 input 标签获取的文件加入 FromData 中
        editRoomFd.append('file', roomImgs[0]);
        editRoomFd.append('roomname', roomname);
        editRoomFd.append('roomintro', roomintro);
        editRoomFd.append('roomid', roomid);
        $.ajax({
            url : "/editRoom",
            type : 'POST',
            data : editRoomFd,
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
                    hint("修改成功",'success');
                    $('.roomEditModal').modal('hide');
                    $("#myRoomTable").bootstrapTable('refresh');
                }
            },
            error : function(data) {
                console.log("error");
            }
        });
    }
}
//编辑room信息传id
function showRoomEditModal(id){
    $("#roomIdEdit").val(id);
    $('.roomEditModal').modal('show');
}