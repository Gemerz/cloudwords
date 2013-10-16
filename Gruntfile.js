module.exports = function (grunt) {
 
    grunt.initConfig({
 
        pkg: grunt.file.readJSON('package.json'),
        
        uglify: {
            options: {
             
                banner: '/** \n' +
                        ' * -------------------------------------------------------------\n' +
                        ' * Copyright (c) 2013 Gemerz, All rights reserved. \n' +
                        ' *  \n' +
                        ' * @version: <%= pkg.version%> \n' +
                        ' * @author: <%= pkg.author%> \n' +
                        ' * @description: <%= pkg.description%> \n' +
                        ' * ------------------------------------------------------------- \n' +
                        ' */ \n\n'
            },
            my_target: {
                files: {
                    'js/cloudWords.min.js': ['js/cloudWords.js']
                    }
                 }        
            },
            jshint: {
                    options: {
                        curly: false,
                        eqeqeq: true,
                        immed: true,
                        latedef: true,
                        newcap: true,
                        noarg: true,
                        sub: true,
                        undef: true,
                        eqnull: true,
                        browser: true,
                        expr: true,
                        globals: {
                            head: false,
                            module: false,
                            console: false,
                            alert:true
                        }
                },
         
                files: [ 'Gruntfile.js', 'js/cloudWords.js' ],
            
           },
            watch : {
                    main :{
                        files: [ 'Gruntfile.js', 'js/cloudWords.js' ],
                            tasks: 'default'
                }

            }
        
    });
 
    grunt.loadNpmTasks( 'grunt-contrib-qunit' );
    grunt.loadNpmTasks( 'grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
 
    grunt.registerTask('default', ['jshint','uglify']);
 
};