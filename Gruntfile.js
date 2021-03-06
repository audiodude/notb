module.exports = function(grunt) {
  grunt.initConfig({
    ts: {
      default: {
        tsconfig: true
      },
      options: {
        compiler: './node_modules/typescript/bin/tsc'
      }
    },
    sass: {
      dist: {
        files: {
          'public/css/compiled.css': 'scss/style.scss'
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

  grunt.registerTask('default', ['typings:install', 'ts', 'sass']);
};
