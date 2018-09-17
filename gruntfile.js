module.exports = function (grunt) {

        //你可以像普通的js文件一样添加自己的代码
        var sassStyle = 'expanded';

        //1.配置任务 tasks--根据插件的文档来定义任务
        grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),
            //压缩
            uglify: {
                uglify: {
                    files: {
                        './www/js/base.js': ['./src/js/base.js'],
                        './www/js/center.js': ['./src/js/center.js'],
                        './www/js/chat.js': ['./src/js/chat.js'],
                        './www/js/chatroom.js': ['./src/js/chatroom.js'],
                        './www/js/index.js': ['./src/js/index.js'],
                        './www/js/jquery.cookie.js': ['./src/js/jquery.cookie.js'],
                        './www/js/main.js': ['./src/js/main.js']
                    }
                }
            },
            cssmin:{
                cssmin:{
                    files:[{
                        expand:true,
                        cwd:"./src/css",
                        src:"*.css",
                        dest:"./www/css",
                        ext:".css"
                    }]
                }
            }
        });

        //2.加载插件\
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.loadNpmTasks('grunt-contrib-cssmin');

        //3.注册任务
        grunt.registerTask('default', ['uglify', 'cssmin']);
    }