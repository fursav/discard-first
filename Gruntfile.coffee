"use strict"

module.exports = (grunt) ->

  # Load grunt tasks automatically
  require("load-grunt-tasks") grunt

  # Time how long tasks take. Can help when optimizing build times
  require("time-grunt") grunt

  # Define the configuration for all the tasks
  grunt.initConfig

    # Project settings
    config:

      # Configurable paths
      app: ""
      dist: "dist"

    # Watches files for changes and runs tasks based on the changed files
    watch:

      # bower: {
      #     files: ['bower.json'],
      #     tasks: ['bowerInstall']
      # },
      # js: {
      #     files: ['<%= config.app %>/js/script.js'],
      #     tasks: ['jshint'],
      #     options: {
      #         livereload: true
      #     }
      # },
      # jstest: {
      #     files: ['test/spec/{,*/}*.js'],
      #     tasks: ['test:watch']
      # },
      # gruntfile: {
      #     files: ['Gruntfile.js']
      # },
      # styles: {
      #     files: ['<%= config.app %>/css/{,*/}*.css'],
      #     tasks: ['newer:copy:styles', 'autoprefixer']
      # },
      # styles:
        # files: ["public/css/style.css"]
        # tasks: ["autoprefixer"]

      # options:
      #   livereload: "<%= connect.options.livereload %>"

      stylus:
        files: ['stylus/*.styl']
        tasks: ['stylus', 'autoprefixer']

      coffee:
        files: ['coffee/*.coffee']
        tasks: ['coffee:compile']

      livereload:
        options:
          livereload: "<%= connect.options.livereload %>"
        files: ['css/**/*','js/**/*']

      #   files: [
      #     "<%= config.app %>/{,*/}*.html"
      #     ".tmp/styles/{,*/}*.css"
      #     "<%= config.app %>/images/{,*/}*"
      #   ]


    # The actual grunt server settings
    connect:
      options:
        port: 9000
        livereload: 35729

        # Change this to '0.0.0.0' to access the server from outside
        hostname: "localhost"

      livereload:
        options:
          open: true
          base: [
            # ".tmp"
            "<%= config.app %>"
          ]

      test:
        options:
          port: 9001
          base: [
            ".tmp"
            "test"
            "<%= config.app %>"
          ]

      dist:
        options:
          open: true
          base: "<%= config.dist %>"
          livereload: false


    # Empties folders to start fresh
    clean:
      dist:
        files: [
          dot: true
          src: [
            '.tmp'
            '<%= config.dist %>/*'
            '!build/.git*'
          ]
        ]

      server: ".tmp"


    # Make sure code styles are up to par and there are no obvious mistakes
    # jshint: {
    #     options: {
    #         jshintrc: '.jshintrc',
    #         reporter: require('jshint-stylish')
    #     },
    #     all: [
    #         'Gruntfile.js',
    #         '<%= config.app %>/js/script.js'
    #     ]
    # },

    # Mocha testing framework configuration options
    # mocha: {
    #     all: {
    #         options: {
    #             run: true,
    #             urls: ['http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/index.html']
    #         }
    #     }
    # },

    # Add vendor prefixed styles
    autoprefixer:
        options:
            browsers: ['last 1 version']

        build:
          expand: true
          cwd: 'build'
          src: [ '**/*.css' ]
          dest: 'build'

        dist:
            files: [
                expand: true,
                cwd: 'css/'
                src: '{,*/}*.css'
                dest: 'css/'
            ]
        server:
          expand: true
          cwd: 'css'
          src: [ 'style.css' ]
          dest: 'css'


    # cssmin: {
    #   build: {
    #     files: {
    #       'build/css/style.css': [ 'build/**/*.css' ]
    #     }
    #   }
    # },

    # uglify: {
    #   build: {
    #     options: {
    #       mangle: false
    #     },
    #     files: {
    #       'build/js/script.js': [ 'build/**/*.js' ]
    #     }
    #   }
    # },

    # Renames files for browser caching purposes
    rev: {
        dist: {
            files: {
                src: [
                    '<%= config.dist %>/scripts/{,*/}*.js',
                    '<%= config.dist %>/styles/{,*/}*.css',
                    '<%= config.dist %>/img/{,*/}*.*',
                    '<%= config.dist %>/fonts/{,*/}*.*',
                    '<%= config.dist %>/*.{ico,png}'
                ]
            }
        }
    },

    # Reads HTML for usemin blocks to enable smart builds that automatically
    # concat, minify and revision files. Creates configurations in memory so
    # additional tasks can operate on them
    useminPrepare:
        options:
            dest: '<%= config.dist %>'
            # root: '.tmp'

        html: 'index.html'


    # Performs rewrites based on rev and the useminPrepare configuration
    usemin:
        options:
            assetsDirs: ['<%= config.dist %>', '<%= config.dist %>/images']

        html: ['<%= config.dist %>/index.html']
        css: ['<%= config.dist %>/css/{,*/}*.css']

    htmlmin:
        dist:
            options:
                collapseBooleanAttributes: true
                collapseWhitespace: true
                removeAttributeQuotes: true
                removeCommentsFromCDATA: true
                removeEmptyAttributes: true
                removeOptionalTags: true
                removeRedundantAttributes: true
                useShortDoctype: true

            files: [
                expand: true
                cwd: '<%= config.dist %>'
                src: '{,*/}*.html'
                dest: '<%= config.dist %>'
            ]

    # By default, your `index.html`'s <!-- Usemin block --> will take care of
    # minification. These next options are pre-configured if you do not wish
    # to use the Usemin blocks.
    # cssmin: {
    #     dist: {
    #         files: {
    #             '<%= config.dist %>/styles/main.css': [
    #                 '.tmp/styles/{,*/}*.css',
    #                 '<%= config.app %>/styles/{,*/}*.css'
    #             ]
    #         }
    #     }
    # },
    # uglify: {
    #     dist: {
    #         files: {
    #             '<%= config.dist %>/scripts/scripts.js': [
    #                 '<%= config.dist %>/scripts/scripts.js'
    #             ]
    #         }
    #     }
    # },
    # concat: {
    #     dist: {}
    # },

    # Copies remaining files to places other tasks can use
    copy:
      build:
        cwd: ""
        src: [
          "index.html"
          "**/js/**"
          "**/css/**"
          "**/fonts/**"
          "!**/*.styl"
          "!**/*.coffee"
          "!**/*.jade"
          "!node_modules/**"
          "!Gruntfile.js"
        ]
        dest: "build"
        expand: true

      dist:
        files: [
          expand: true
          dot: true
          cwd: "<%= config.app %>"
          dest: "<%= config.dist %>"
          src: [
            "*.{ico,png,txt}"
            ".htaccess"
            "img/{,*/}*.webp"
            "{,*/}*.html"
            "fonts/{,*/}*.*"
            "json/{,*/}*.*"
          ]
        ]

      temp:
        files: [
          expand: true
          dot: true
          cwd: ".tmp/concat"
          dest: "<%= config.dist %>"
          src: [
            "js/{,*/}*.*"
            # "js/{,*/}*.*"
            # "css/{,*/}*.*"
          ]
        ]

      styles:
        expand: true
        dot: true
        cwd: "css"
        # cwd: "<%= config.app %>/css"
        dest: ".tmp/css/"
        src: "{,*/}*.css"

      scripts:
        expand: true
        dot: true
        cwd: "js"
        # cwd: "<%= config.app %>/css"
        dest: ".tmp/js/"
        src: "{,*/}*.js"


    # Run some tasks in parallel to speed up build process
    concurrent:
        server: [
            'copy:styles'
        ]
        test: [
            'copy:styles'
        ]
        dist: [
            'copy:styles'
            # 'imagemin'
            # 'svgmin'
        ]

    stylus:
      build:
        options:
          compress: false
          use: [
            require('jeet')
            require('rupture')
            ]
          import: [
            'normalize'
            'vars'
            'base'
            ]

        files: [
          expand: true
          cwd: "stylus"
          src: "style.styl"
          dest: "css"
          ext: ".css"
        ]

    coffee:
      compile:
        expand: true
        flatten: true
        cwd: 'coffee'
        src: ['script.coffee']
        dest: 'js'
        ext: '.js'

      compileWithMaps:
        # options:
        #   sourceMap: true

        expand: true
        sourceMap: true
        cwd: "coffee"
        src: "*.coffee"
        dest: "public/js"
        ext: ".js"

  grunt.registerTask "cbw", [
    "stylus"
    "autoprefixer"
    "coffee"
    "watch"
  ]


# grunt.registerTask('serve', function (target) {
#     if (target === 'dist') {
#         return grunt.task.run(['build', 'connect:dist:keepalive']);
#     }

#     grunt.task.run([
#         'clean:server',
#         'concurrent:server',
#         'autoprefixer',
#         'connect:livereload',
#         'watch'
#     ]);
# });

# grunt.registerTask('test', function (target) {
#     if (target !== 'watch') {
#         grunt.task.run([
#             'clean:server',
#             'concurrent:test',
#             'autoprefixer'
#         ]);
#     }

#     grunt.task.run([
#         'connect:test',
#         'mocha'
#     ]);
# });


  grunt.registerTask 'serve', [
    'stylus'
    'coffee:compile'
    #'autoprefixer:server'
    # 'connect:livereload'
    'watch'
  ]

  grunt.registerTask 'build', [
    'clean:dist'
    'useminPrepare'
    'copy:styles'
    'stylus'
    'coffee:compile'
    'autoprefixer:dist'
    # 'copy:scripts'
    'concat'
    'cssmin'
    # 'uglify'
    'copy:temp'
    'copy:dist'
    # 'rev'
    'usemin'
    'htmlmin'
    # 'concurrent:dist'
  ]

  grunt.registerTask 'default', [
    # 'build'
    'serve'
  ]
  return
