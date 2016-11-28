/**
 * jshint.js
 *
 * Validates javascript code styling
 *
 * @package grunt
 * @subpackage tasks
 * @author Chintan Kotadia <chintankotadia13@gmail.com>
 */

module.exports = function(grunt) {
	grunt.config('jshint', {
		options: {
			jshintrc: true,
			//reporter: require('jshint-stylish')
		},
		assets: [
			'<%=paths.js%>**/*.js'
		]
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
};