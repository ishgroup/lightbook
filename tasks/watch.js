/**
 * watch.js
 *
 * Continuously watches all the changes in javascript
 * and stylesheet files in order to generate fresh copy
 * on each change
 *
 * @package grunt
 * @subpackage tasks
 * @author Chintan Kotadia <chintankotadia13@gmail.com>
 */

module.exports = function(grunt) {
	grunt.config('watch', {
		grunt: {
			files: ['gruntfile.js']
		},
		sass: {
			files: [
				//'<%=paths.scss%>**/*.scss',
				//'<%=paths.bower%>bootstrap-sass/assets/stylesheets/**/*.scss',
			],
			tasks: ['sass'],
			options: {
				livereload: true
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
};
