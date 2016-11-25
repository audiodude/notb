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
    }
  });
  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.registerTask('heroku:development', ['ts', 'sass']);
  grunt.registerTask('heroku:production', ['ts', 'sass']);
};
