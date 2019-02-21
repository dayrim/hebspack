const gulp = require('gulp');
const flatmap = require('gulp-flatmap');
const minimist = require("minimist");
const assetsJson = require('../custom-gulp-plugins/assets-json');
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const webpack = require('webpack');
const gulpWebpack = require('webpack-stream');
const print = require('gulp-print').default;
const minimatch = require("minimatch")
const colors = require('ansi-colors');
const path = require("path")
const order = require('gulp-order');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const configLoader = require('../common/config-loader');
const log = require('fancy-log');
const notifier = require('node-notifier');


module.exports = function() {

/* Set environment variable from cli flag*/
let env;
const args = minimist(process.argv.slice(2));

switch (args.env) {
    case "default":
        env = "default"
        break;

    case "development":
        env = "development"
        break;

    case "production":
        env = "production"
        break;

    default:
        env = "default"
        break;
}
    configLoader.loadSkin(args.skinpath)
    
    return gulp.src(args.skinpath)

        /* Creates a stream for each skin */
        .pipe(flatmap(function(stream, skinDir) {
            log("We are on");

            return gulp.src([`${skinDir.path}/**/*`, `!**/node_modules/**/*`, `!**/master/**/*`, `!**/${paths.dist.outputFolder}/**/*`])


                /* Creates a stream for each scripts folder*/
                .pipe(flatmap(function(stream, dir) {



                    return gulp.src([`${dir.path}/**/*.js`,
                            `!${dir.path}/**/*${paths.src.ignoreSuffix}*`
                        ],{allowEmpty: true })

                        .pipe(print(filepath => `Stream started for: ${colors.unstyle(path.dirname(filepath))}/${colors.red(path.basename(filepath))}`))

                        .pipe(webpack({}
                    
                          ))

                        .pipe(print(filePath => `Finished '(${colors.cyan(args.skindir)}) stream for file:  ${colors.unstyle(path.dirname(filePath))}/${colors.blue(path.basename(filePath))}'`))


                }))
        }))
        .on('end', function() {

            log(`Finished '(${colors.cyan(args.skindir)}) scripts bundle'`);
            notifier.notify({
                title: 'Hebspack',
                message: `Scripts bundled in ${args.skindir}`,
                icon: args.iconpath,
            });

        })
}