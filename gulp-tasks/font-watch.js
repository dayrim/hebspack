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

    const args = minimist(process.argv.slice(2));

    configLoader.loadSkin(`${args.skinpath}`)
    
    skinWatch = watch(args.skinpath, {
        ignoreInitial: false,
        read: false,
        depth: 0,
        verbose: false,
        events: ['addDir', 'unlinkDir']
    }, (skinDir) => {

      

        /* Prepares file path patterns to be watched */

        let filePaths = [];

        pluginOptions[args.env].font.extensions.forEach(extension => {
            filePaths.push(`${skinDir.path}/**/${paths.src.sourceFolder}/**/${paths.src.fontsFolder}/**/*${extension}`)
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

                log(`Finished '(${colors.cyan(args.skindir)}) fonts bundle in: ${colors.cyan(path.relative(args.skinpath, propertyDirDist))}'`);
                if (args.browsersync) {
                    process.send("BROWSER_RELOAD");
                    }
                notifier.notify({
                    title: `${args.skindir}`,
                    message: `Fonts bundled in: ${path.relative(args.skinpath, propertyDirDist)}`,
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