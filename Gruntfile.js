module.exports = function(grunt) {
  grunt.initConfig({
    ts: {
      default: {
        tsconfig: true
      }
    },
    sass: {
      dist: {
        files: {
          'css/compiled.css': 'scss/style.scss'
        }
      }
    },
    typings: {
      install: {}
    }
  });
  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-typings');

  grunt.registerTask('heroku:development', ['typings:install', 'ts', 'sass']);
  grunt.registerTask('heroku:production', ['typings:install', 'ts', 'sass']);
};
