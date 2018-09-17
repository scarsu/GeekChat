var roomHot20={};
$(document).ready(function(){
    // 获取top20热度聊天室
    $.getJSON('/roomHot20.json',function(data){
        // // 轮播图取前三
        roomHot20=data;
        $("#roomHot20Table").bootstrapTable('destroy'); 
        $('#roomHot20Table').bootstrapTable({
            data: roomHot20,
            columns: [{
                title: '#',
                formatter: function (value, row, index) {
                    return index + 1;
                }
            }, {
                field: 'roomname',
                title: '名称'
            }, {
                field: 'hotScore',
                title: '热度'
            }]
        });
        $('#roomHot20Table').on('click-row.bs.table', function (e, row) {
            window.location.href = "chatroom?id=" + row.id;
        });
        $(".hotTop3").each(function(i,e){
            if(data[i]){
                $(e).children("img").attr("src","/img/room/"+data[i].id+data[i].imgExt);
                $(e).children(".carousel-caption").children("h1").children(".roomName").html(data[i].roomname);
                $(e).children(".carousel-caption").children(".roomIntro").html(data[i].intro);
                $(e).attr("onclick","window.location.href='/chatroom?id="+data[i].id+"'");
            }
        });
        $(".thumbnail").each(function(i,e){
            i=i+3;
            if (data[i]) {
                $(e).children("img").attr("src", "/img/room/" + data[i].id + "." + data[i].imgExt);
                $(e).children(".caption").children("h3").html(data[i].roomname);
                $(e).children(".caption").children("p").html(data[i].intro);
                $(e).click(function () {
                    window.location.href = "chatroom?id=" + data[i].id;
                });
            }
        });
        var _html="";
        var small=(data.length<9)? data.length :9;
        for(var i=0;i<small;i++){
            _html+="<div class='col-sm-6 col-md-4'><div class='thumbnail'" +
                  " onclick='window.location.href=\"chatroom?id="+data[i].id+"\";'>" +
                  "<img src='/img/room/"+data[i].id+data[i].imgExt+"'" +
                  "<div class='caption'>" +
                  "<h4>"+data[i].roomname+"</h4>" +
                  "<p>介绍："+data[i].intro+"</p></div></div></div>"
        }
        $(".roomList9 .row").html(_html);
    });
    $("#favListTable").bootstrapTable('destroy'); 
    $('#favListTable').bootstrapTable({
        url: "/favRoomList.json",
        columns: [{
            title: '#',
            formatter: function (value, row, index) {
                return index + 1;
            }
        }, {
            field: 'roomname',
            title: '名称'
        }, {
            field: 'hotScore',
            title: '热度'
        }]
    });
    $('#favListTable').on('click-row.bs.table', function (e, row) {
        window.location.href = "chatroom?id=" + row.id;
    });
});
