const gulp = require('gulp');
const flatmap = require('gulp-flatmap');
const minimist = require("minimist");
const print = require('gulp-print').default;
const colors = require('ansi-colors');
const path = require("path")
const appRoot = require('app-root-path');
const configLoader = require('../common/config-loader');
const glob = require("glob")
const fileSystem = require("fs")
const log = require('fancy-log');
const tap = require('gulp-tap');
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
    configLoader.load(args.skinpath)

    return gulp.src(args.skinpath)

        /* Creates a stream for each skin */
        .pipe(flatmap(function(stream, skinDir) {

            let lastFileObject;
            return gulp.src([`${skinDir.path}/**/${paths.src.sourceFolder}/**/${paths.src.imagesFolder}`, `!**/node_modules/**/*`, `!**/master/**/*`, `!**/${paths.dist.outputFolder}/**/*`])

                /* Creates a stream for each image folder */
                .pipe(flatmap(function(stream, dir) {
                    return gulp.src(`${dir.path}/**/*`)

                        /* Determine output destination */
                        .pipe(gulp.dest(function(file) {
                            lastFileObject=file;
                            let sourceDirRegex = new RegExp(`\/${paths.src.sourceFolder}\/`, 'g');
                            let relativePath = path.dirname(file.path)
                            if (!(relativePath.slice(-1) == `/`)) {
                                relativePath= `${relativePath}/`
                            }

                            let relativePathDist = relativePath.replace(sourceDirRegex, `/${paths.dist.outputFolder}/`)
                            return relativePathDist
                        }))
                        .pipe(print(filePath => `Finished '(${colors.cyan(args.skindir)}) stream for file:  ${colors.unstyle(path.dirname(filePath))}/${colors.blue(path.basename(filePath))}'`))

                }))
                .on('end', function() {
                    if(lastFileObject){
                        let propertyDirOutRegex = new RegExp(`.*(?<=\/${paths.dist.outputFolder}\/).*?(?=\/)`, 'g');
                        let propertyDirDist = lastFileObject.path.match(propertyDirOutRegex)[0]
            
                        log(`Finished '(${colors.cyan(args.skindir)}) image bundle in: ${colors.cyan(path.relative(args.skinpath, propertyDirDist))}'`);
            
                        notifier.notify({
                            title: 'Hebspack',
                            message: `Images bundled in: ${path.relative(args.skinpath, propertyDirDist)}`,
                            icon: path.join(path.join(__dirname, "../"),'favicon.png'), // Absolute path (doesn't work on balloons)
                        });
                    }

        
                })
        }))


}