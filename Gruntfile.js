/*
 * 
 */

module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		project: {
			sass_dir: ['build/sass'],

			http_path: ['/'],
			http_asset_path: ['<%= project.http_path %>'],
			http_css_path: ['<%= project.http_asset_path %>/css'],
			http_js_path: ['<%= project.http_asset_path %>/js'],
			http_img_path: ['<%= project.http_asset_path %>/img'],
			http_gen_img_path: ['<%= project.http_img_path %>'],
			http_fonts_path: ['<%= project.http_asset_path %>/fonts'],

			web_dir: ['public'],
			lib_dir: ['public/lib'],
			lib_css_dir: ['<%= project.lib_dir %>/<%= project.http_css_path %>'],
			css_dir: ['<%= project.web_dir %>/<%= project.http_css_path %>'],
			js_dir: ['<%= project.lib_dir %>/<%= project.http_js_path %>'],
			img_dir: ['<%= project.lib_dir %>/<%= project.http_img_path %>'],
			gen_img_dir: ['<%= project.img_dir %>'],
			fonts_dir: ['<%= project.lib_dir %>/<%= project.http_fonts_path %>']
		},
		sass: {
			options: {
				includePaths: ['./bower_components', './build/sass']
			},
			production: {
				options: {
					style: 'compressed',
					sourceMap: false
				},
				files: {
					'<%= project.css_dir %>/main.css': '<%= project.sass_dir %>/main.scss'
				}
			}
		},
		copy: {
			'fontawesome': {
				files: [{
					expand: true,
					filter: 'isFile',
					flatten: true,
					cwd: 'bower_components/components-font-awesome/',
					src: ['./fonts/**'],
					dest: '<%= project.fonts_dir %>/fa/'
				}]
			},
			'bluebird': {
				files: [{
					expand: true,
					filter: 'isFile',
					flatten: true,
					cwd: 'bower_components/bluebird/js/browser/',
					src: ['./bluebird.min.js'],
					dest: '<%= project.js_dir %>/'
				}]
			},
			'bootstrap': {
				files: [{
					expand: true,
					filter: 'isFile',
					flatten: true,
					cwd: 'bower_components/bootstrap-sass-official/assets/javascripts/',
					src: ['./bootstrap.min.js'],
					dest: '<%= project.js_dir %>/'
				}, {
					expand: true,
					filter: 'isFile',
					flatten: true,
					cwd: 'bower_components/bootstrap-sass-official/assets/fonts/bootstrap/',
					src: ['./**'],
					dest: '<%= project.fonts_dir %>/bootstrap/'
				}]
			},
			'es5-shim': {
				files: [{
					expand: true,
					filter: 'isFile',
					flatten: true,
					cwd: 'bower_components/es5-shim/',
					src: ['./es5-shim.min.js', './es5-shim.map', './es5-sham.min.js', './es5-sham.map'],
					dest: '<%= project.js_dir %>/'
				}]
			},
			'jquery': {
				files: [{
					expand: true,
					filter: 'isFile',
					flatten: true,
					cwd: 'bower_components/jquery/dist/',
					src: ['./jquery.min.js', './jquery.js', './jquery.min.map'],
					dest: '<%= project.js_dir %>/'
				}]
			},
			'moment': {
				files: [{
					expand: true,
					filter: 'isFile',
					flatten: true,
					cwd: 'bower_components/moment/min/',
					src: ['./moment.min.js'],
					dest: '<%= project.js_dir %>/'
				}]
			},
			'underscore': {
				files: [{
					expand: true,
					filter: 'isFile',
					flatten: true,
					cwd: 'bower_components/underscore/',
					src: ['./underscore-min.js', './underscore.js', './underscore-min.map'],
					dest: '<%= project.js_dir %>/'
				}]
			}
		},
		cssmin: {
			dist: {
				files: {
					'<%= project.css_dir %>/main.min.css': ['<%= project.css_dir %>/main.css']
				}
			}
		},
		watch: {
			css: {
				files: '<%= project.sass_dir %>/{,*/}*.{scss,sass}',
				tasks: ['sass:production']
			}
		}
	});

	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.registerTask('default', ['watch']);
	grunt.registerTask('build', [
		'sass:production',
		'copy:*',
		'cssmin:dist'
	]);
};
