module.exports = (grunt) ->
  grunt.initConfig

    pkg: grunt.file.readJSON "package.json"

    sass:
      examples:
        files: [
          expand: true
          cwd: "examples/style/scss/"
          src: ["*.scss", "!_*.scss"]
          dest: "examples/style/css"
          ext: ".css"
        ]
      test:
        files:
          "test/test.css": "test/scss/test.scss"

    autoprefixer:
      examples:
        files: [
          expand: true
          cwd: "examples/style/css"
          src: ["*.css"]
          dest: "examples/style/css"
        ]
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
          "examples/*.html"
          "examples/style/css/*.css"
          "examples/js/*.js"
          "test/*.{html,css,js}"
        ]
      examplesSass:
        files: ["examples/style/scss/*.scss"]
        tasks: ["styleExamples"]
      testSass:
        files: ["test/scss/*.scss"]
        tasks: ["styleTest"]

  grunt.loadNpmTasks "grunt-contrib-connect"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-contrib-sass"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks "grunt-autoprefixer"
  grunt.loadNpmTasks "grunt-newer"

  grunt.registerTask "styleExamples", [
    "newer:sass:examples"
    "newer:autoprefixer:examples"
  ]
  grunt.registerTask "styleTest", [
    "newer:sass:test"
    "newer:autoprefixer:test"
  ]
  grunt.registerTask "dev", [
    "connect"
    "watch"
  ]