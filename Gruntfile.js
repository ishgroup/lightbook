/**
 * gruntfile.js
 *
 * Manages all the assets having features like minifying,
 * concating and uglifying
 *
 * @author Chintan Kotadia <chintankotadia13@gmail.com>
 */

module.exports = function(grunt) {
    var paths = {
        'proj': './src/',
        'assets': '<%= paths.proj %>assets/',
        'scss': '<%= paths.proj %>assets/scss/',
        'css': '<%= paths.proj %>assets/css/',
        'js': '<%= paths.proj %>assets/js/',
        'scssFileName': 'styles'
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        paths: paths
    });

    //Loads all the tasks
    grunt.loadTasks('./tasks');

    //Registration of different tasks
    grunt.registerTask('build', [
        'sass',
        'concat',
        'jshint'
    ]);

    grunt.registerTask('default', ['build']);
};
