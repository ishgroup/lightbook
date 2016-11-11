/**
 * uglify.js
 *
 * Uglifies javascript files
 *
 * @package grunt
 * @subpackage tasks
 * @author Chintan Kotadia <chintankotadia13@gmail.com>
 */

module.exports = function(grunt) {
	grunt.config('uglify', {
		options: {
			mangle: false
		},
		dist: {
			files: {
				'<%=paths.js%>public.js': '<%=paths.js%>public.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
};
