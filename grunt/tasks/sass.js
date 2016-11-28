/**
 * sass.js
 *
 * Generates stylesheets using sass
 *
 * @package grunt
 * @subpackage tasks
 * @author Chintan Kotadia <chintankotadia13@gmail.com>
 */

module.exports = function(grunt) {
	grunt.config('sass', {
		options: {
			includePaths: [
				/*'<%=paths.bower%>bootstrap-sass/assets/stylesheets',
				'<%=paths.bower%>font-awesome/scss',*/
			]
		},
		dist: {
			outputStyle: 'compressed',
			options: {
				outputStyle: 'compressed'/*,
				style: 'compressed',
				compass: true,
				sourcemap: 'none',*/
				//cacheLocation: './cache/'*/
			},
			files: {
				'<%=paths.css%><%=paths.scssFileName%>.css': '<%=paths.scss%><%=paths.scssFileName%>.scss'

			}
		}
	});

	grunt.loadNpmTasks('grunt-sass');
};
