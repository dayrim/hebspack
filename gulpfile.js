const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require("gulp-rename");
const merge = require('merge-stream');
const extractMedia = require("gulp-extract-media-queries");
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const order = require('gulp-order');
const stripDebug = require('gulp-strip-debug');
const watch = require('gulp-watch');
const browserSync = require('browser-sync').create();
const size = require('gulp-size');
const notify = require("gulp-notify");
const log = require('fancy-log');
const cache = require('gulp-cached');
const fileSize = require('gulp-filesize');
const util = require('util')
require('events').EventEmitter.prototype._maxListeners = 100;


gulp.task('build', ['scss-watch', 'js-watch','image-watch','font-watch']);

gulp.task('scss-watch', function () {
    // Callback mode, useful if any plugin in the pipeline depends on the `end`/`flush` event

    // const fileSize = size({
    //     title: 'Styles: ',
    //     showTotal: false,
    //     showFiles : true
    //    })
    const size = fileSize();
    return watch( [
        './assets/**/styles/**/*.scss'
            ], { ignoreInitial: false, verbose: true }, function (vinylFile) {
            
                gulp.src([
                    './assets/desktop/styles/promotiles.scss',
                    './assets/desktop/styles/styles.scss',
                    './assets/desktop/styles/initial/styles.scss'
                  ])
                 // .pipe(cache('scss'))
                .pipe(sass()) 
                .pipe(rename(function(path,context){
                    var parts = context.base.split("/");
                    var folderPrefix = parts[parts.length - 2] || ""
              
                  path.basename = folderPrefix + "-"+ path.basename;
                }))
              //  .pipe(extractMedia())

              //   .pipe(sourcemaps.init())
              //   .pipe(cleanCSS({
              //     sourcemaps: true,
              //     level: 2
              //         }))
              //    .pipe(sourcemaps.write())
                 .pipe(gulp.dest('./dist/styles'))
                 .on('end', function(){ log('SCCS File processed: '+vinylFile.basename);   })
  
                
                //  .pipe(fileSize)

    });
});

gulp.task('js-watch', function () {
    const size = fileSize();
    // Callback mode, useful if any plugin in the pipeline depends on the `end`/`flush` event
    // const fileSize = size({
    //     title: 'Scripts: ',
    //     showTotal: false,
    //     showFiles : true
    //    })
    return watch( [
        './assets/**/scripts/**/*.js',
        '!./assets/**/scripts/**/scripts.min.js'
            ], { ignoreInitial: false, verbose: true }, function (vinylFile) {
            
                gulp.src([
                    '**/assets/**/scripts/**/*(!(!(*.js)|scripts.min.js))'
                  ])
               
                  //.pipe(cache('scripts'))
                  .pipe(order([
                    "**/assets/**/scripts/libraries/*jquery.js",
                    "**/assets/**/scripts/libraries/*jquery.ui.js",
                    "**/assets/**/scripts/libraries/*cookie.js",
                    "**/assets/**/scripts/libraries/*json.js",
                    "**/assets/**/scripts/libraries/*what-input.min.js",
                    "**/assets/**/scripts/libraries/*validation.js",
                    "**/assets/**/scripts/libraries/*validation-en.js",
                    "**/assets/**/scripts/libraries/*hebs.bp.js",
                    "**/assets/**/scripts/libraries/*swiper.js",
                    "**/assets/**/scripts/libraries/*galleria.js",
                    "**/assets/**/scripts/*polyfills.js",
                    "**/assets/**/scripts/libraries/*.js",

                    "**/assets/**/scripts/*scripts.js",

                    "**/assets/**/scripts/*common.js",
                    "**/assets/**/scripts/*booking.js",
                    "**/assets/**/scripts/*photos.js",
                    "**/assets/**/scripts/*promotiles.js",
                    "**/assets/**/scripts/*events.js",
                    "**/assets/**/scripts/*reviews.js",
                    "**/assets/**/scripts/*google-maps.js",
                    "**/assets/**/scripts/*maps.js",
                    "**/assets/**/scripts/*poi.js",
                    "**/assets/**/scripts/*galleries.js",
                    "**/assets/**/scripts/*pressroom.js",
                    "**/assets/**/scripts/*rooms.js",
                    "**/assets/**/scripts/*feeds.js",
                    "**/assets/**/scripts/*calendar.js",
                    "**/assets/**/scripts/*.js"
                  ]))
                    .pipe(concat('scripts.min.js'))
                    // .pipe(stripDebug())
                    // .pipe(uglify())
                    .pipe(gulp.dest('./dist/scripts'))
                    .on('end', function(){ log('JS File processed: '+vinylFile.basename);  })
              
       
    });
});

  
gulp.task('image-watch', function () {
    // Callback mode, useful if any plugin in the pipeline depends on the `end`/`flush` event

    return watch( [
        './assets/**/images/**/*'
            ], { ignoreInitial: false, verbose: true }, function (vinylFile) {

                gulp.src([
                    './assets/**/images/**/*'
                  ])
                  //.pipe(cache('images'))
                  .pipe(rename(function(path,context){
                    var directory;
                    var matchPath = path.dirname.match(/(?<=images\/)(.*)/g)
                    if(matchPath)
                    {directory=matchPath[0]}
                    else{directory=''}

                    path.dirname=directory
                }))
                    .pipe(gulp.dest('./dist/images'))
                    .on('end', function(){ 
                        log('Image File processed: '+vinylFile.basename );
                     })
    });
});

gulp.task('font-watch', function () {
    // Callback mode, useful if any plugin in the pipeline depends on the `end`/`flush` event
    return watch( [
        './assets/**/fonts/**/*'
            ], { ignoreInitial: false, verbose: true }, function (vinylFile) {

                gulp.src([
                    './assets/**/fonts/**/*'
                  ])
                  .pipe(rename(function(path,context){
                    var directory;
                    var matchPath = path.dirname.match(/(?<=fonts\/)(.*)/g)
                    if(matchPath)
                    {directory=matchPath[0]}
                    else{directory=''}

                    path.dirname=directory
                }))
                  //.pipe(cache('fonts'))
                    .pipe(gulp.dest('./dist/fonts'))
                    .on('end', function(){ log('Font File processed: '+vinylFile.basename); })
                    
    });
});
