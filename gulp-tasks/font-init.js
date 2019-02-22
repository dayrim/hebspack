const gulp = require('gulp');
const flatmap = require('gulp-flatmap');
const minimist = require("minimist");
const print = require('gulp-print').default;
const colors = require('ansi-colors');
const path = require("path")
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


            let lastFileObject;

            return gulp.src([`${skinDir.path}/**/${paths.src.sourceFolder}/**/${paths.src.fontsFolder}`, `!**/node_modules/**/*`, `!**/master/**/*`, `!**/${paths.dist.outputFolder}/**/*`])

                /* Creates a stream for each font folder */
                .pipe(flatmap(function(stream, dir) {
                    return gulp.src(`${dir.path}/**/*`)

                        /* Determines destination for output */
                        .pipe(gulp.dest(function(file) {
                            lastFileObject=file;
                            let sourceDirRegex = new RegExp(`\/${paths.src.sourceFolder}\/`, 'g');
                            let relativePathDist = file.base.replace(sourceDirRegex, `/${paths.dist.outputFolder}/`)
                            return relativePathDist
                        }))
                        .pipe(print(filePath => `Finished '(${colors.cyan(args.skindir)}) stream for file:  ${colors.unstyle(path.dirname(filePath))}/${colors.blue(path.basename(filePath))}'`))
                        .on('end', function() {

                            log(`Finished '(${colors.cyan(args.skindir)}) fonts bundle in: ${colors.cyan(path.relative(args.skinpath, lastFileObject.base))}'`);
                        })
                }))
       
        })).on('end', function() {

           
            notifier.notify({
                title: 'Hebspack',
                message: `Fonts bundled in ${args.skindir}`,
                icon: args.iconpath,
            });

        })

}