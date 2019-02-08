const gulp = require('gulp');
const minimist = require("minimist");
const print = require('gulp-print').default;
const colors = require('ansi-colors');
const path = require("path")
const watch = require('gulp-watch');
const log = require('fancy-log');
const del = require('del');
const configLoader = require('../common/config-loader');
const tap = require('gulp-tap')
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
configLoader.load(`${args.skinpath}`)


    skinWatch = watch(args.skinpath, {
        ignoreInitial: false,
        read: false,
        depth: 0,
        verbose: false,
        events: ['addDir', 'unlinkDir']
    }, (skinDir) => {

        /* Prepares file path patterns to be watched */

        let filePaths = [];

        options[env].image.extensions.forEach(extension => {
            filePaths.push(`${skinDir.path}/**/${paths.src.sourceFolder}/**/${paths.src.imagesFolder}/**/*${extension}`)
        });

        filePaths.push(`!**/node_modules/**/*`)
        filePaths.push(`!**/${paths.dist.outputFolder}/**/*`)

        filesWatch = watch(filePaths, {

                ignoreInitial: true,
                read: true,
                verbose: false,
                events: ['add', 'change', 'unlink']
            })
            .pipe(tap(function(fileObject) {
                if (fileObject.event === 'unlink') {
                    let sourceDirRegex = new RegExp(`\/${paths.src.sourceFolder}\/`, 'g');
                    del.sync(`${fileObject.path.replace(sourceDirRegex, `/${paths.dist.outputFolder}/`)}`)
                }
            }))
            .pipe(gulp.dest(function(fileObject) {
                fileObject.base = path.dirname(fileObject.path)

                let sourceDirRegex = new RegExp(`\/${paths.src.sourceFolder}\/`, 'g');
                let fileDir = path.dirname(fileObject.path)
                return `${`${fileDir}/`.replace(sourceDirRegex, `/${paths.dist.outputFolder}/`)}`
            }))

            .pipe(print(filePath => `Finished '(${colors.cyan(args.skindir)}) stream for file:  ${colors.unstyle(path.dirname(filePath))}/${colors.blue(path.basename(filePath))}'`))
            .pipe(tap(function(fileObject) {

                let propertyDirOutRegex = new RegExp(`.*(?<=\/${paths.dist.outputFolder}\/).*?(?=\/)`, 'g');
                let propertyDirDist = fileObject.path.match(propertyDirOutRegex)[0]

                log(`Finished '(${colors.cyan(args.skindir)}) image bundle in: ${colors.cyan(path.relative(args.skinpath, propertyDirDist))}'`);
                notifier.notify({
                    title: 'Hebspack',
                    message: `Image bundled in: ${path.relative(args.skinpath, propertyDirDist)}`,
                    icon: args.iconpath,
                });
            }))

        if (skinDir.event === 'unlinkDir') {
            skinWatch.unwatch(skinDir.path)
            // filePaths.unwatch(filePaths)
        }

    })


    return skinWatch;


}