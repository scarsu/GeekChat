var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/geekChat');//；连接数据库
// //监听open事件
// mongoose.once('open', function (callback) {
//     console.log("数据库成功连接");
// });
mongoose.connection.on("error", function (error) {
    console.log("数据库连接失败：" + error);
});

mongoose.connection.on("open", function () {
    console.log("数据库连接成功");
});

mongoose.connection.on('disconnected', function () {
    console.log('数据库连接断开');
});

var Schema = mongoose.Schema;   //  创建模型
var userScheMa = new Schema({
    username: String,
    password: String,
    addr:String,
    id:String,
    imgExt:String,
    myrooms: Array,
    favrooms:Array
},{collection:"user"});
exports.user = mongoose.model('user', userScheMa); //  与users集合关联

var roomScheMa = new Schema({
    roomname: String,
    startTime: String,
    hotScore:Number,
    intro:String,
    id:String,
    imgExt:String,
    owner:String
},{collection:"room"});
exports.room = mongoose.model('room', roomScheMa); //  与users集合关联