module.exports = (grunt) ->
  grunt.initConfig

    pkg: grunt.file.readJSON "package.json"

    sass:
      test:
        files:
          "test/test.css": "test/scss/test.scss"

    autoprefixer:
      test:
        files:
          "test/test.css": "test/test.css"

    uglify:
      dist:
        files:
          "unfinishedToggler.min.js": "unfinishedToggler.js"

    connect:
      server:
        options:
          port: 9000
          base: "./"

    watch:
      livereload:
        options:
          livereload: true
        files: [
          "test/*.{html,css,js}"
        ]
      testSass:
        files: ["test/scss/*.scss"]
        tasks: ["style"]

  grunt.loadNpmTasks "grunt-contrib-connect"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-contrib-sass"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks "grunt-autoprefixer"

  grunt.registerTask "style", [
    "sass:test"
    "autoprefixer:test"
  ]
  grunt.registerTask "dev", [
    "connect"
    "watch"
  ]