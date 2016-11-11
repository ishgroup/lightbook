/**
 * concat.js
 *
 * Concats all the javascripts into single file for
 * public and backend section
 *
 * @package grunt
 * @subpackage tasks
 * @author Chintan Kotadia <chintankotadia13@gmail.com>
 */

module.exports = function(grunt) {
	grunt.config('concat', {
		options: {
			separator: ';',
		},
		dist: {
			files: {
				'<%=paths.js%>public.js': [
					'<%=paths.bower%>jquery/dist/jquery.js',
					'<%=paths.bower%>bootstrap-sass/assets/javascripts/bootstrap.js',
					'<%=paths.js%>public/library/**/*.js',
					'<%=paths.js%>public/template.js',
					'<%=paths.js%>public/**/*.js'
				]
			},
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
};
