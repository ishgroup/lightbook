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
        pkg: grunt.file.readJSON('grunt/config/package.json'),
        paths: paths
    });

    // Load all the tasks from the folder
    grunt.loadTasks('grunt/tasks');

    // Build CSS, JS and minify everything by default
    grunt.registerTask('build', [
        'sass',
        'concat',
        'jshint'
    ]);
    grunt.registerTask('default', ['build']);
};
