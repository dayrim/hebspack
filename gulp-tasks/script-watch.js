const gulp = require('gulp');
const minimist = require("minimist");
const assetsJson = require('../custom-gulp-plugins/assets-json');
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const print = require('gulp-print').default;
const minimatch = require("minimatch")
const log = require('fancy-log');
const colors = require('ansi-colors');
const path = require("path")
const watch = require('gulp-watch');
const order = require('gulp-order');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const del = require('del');
const configLoader = require('../common/config-loader');
const batch = require('gulp-batch');
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

        options[env].script.extensions.forEach(extension => {
            filePaths.push(`${skinDir.path}/**/${paths.src.sourceFolder}/**/${paths.src.scriptsFolder}/**/*${extension}`)
        });

        filePaths.push(`!**/node_modules/**/*`)
        filePaths.push(`!**/${paths.dist.outputFolder}/**/*`)


        fileWatch = watch(filePaths, {

            ignoreInitial: true,
            read: true,
            verbose: false,
            events: ['add', 'change', 'unlink']
        }, batch(function selfRepeat(events, done) {
            //log("Its' done: "+path.basename(events))

            let inputFile
            events.on('data', (chunk) => {
                inputFile = chunk

            }).on('end', () => {

                let sourceScriptsRegex = new RegExp(`.*(?<=\/${paths.src.scriptsFolder}\/)`, 'g')
                let sourceScripts = inputFile.path.match(sourceScriptsRegex)[0]

                let sourceDirRegex = new RegExp(`\/${paths.src.sourceFolder}\/`, 'g');
                let propertyDirRegex = new RegExp(`.*(?<=\/${paths.src.sourceFolder}\/).*?(?=\/)`, 'g');
                let propertyDir = inputFile.path.match(propertyDirRegex)[0]
                let propertyDirDist = propertyDir.replace(sourceDirRegex, `/${paths.dist.outputFolder}/`)

                let srcFiles = [];

                options[env].script.extensions.forEach(extension => {
                    srcFiles.push(`${sourceScripts}/**/*${extension}`)
                });

                srcFiles.push(`!**/node_modules/**/*`)
                srcFiles.push(`!**/${paths.dist.outputFolder}/**/*`)

                gulp.src(srcFiles)
                    .pipe(tap(function(fileObject) {
                        if (fileObject.event === 'unlink') {
                            del.sync(`${fileObject.path.replace(sourceDirRegex, `/${paths.dist.outputFolder}/`)}`)
                        }

                    }))

                    .pipe(gulpIf(run[env].script.sourcemaps, sourcemaps.init()))


                    /* Reorders files in stream */
                    .pipe(order(function() {
                        let srcOrder = [];
                        if(paths.src.libFiles){
                            paths.src.libFiles.forEach((fileName) => {
                                srcOrder.push(`**/${fileName}`);
                            });
                        }

                        srcOrder.push(`${paths.src.libFolder}/*.js`);
                        srcOrder.push(`${paths.src.scriptsEntry}`);
                        if(paths.src.scriptsFiles){
                            paths.src.scriptsFiles.forEach((fileName) => {
                                srcOrder.push(`${fileName}`);
                            });
                        }
                        options[env].script.extensions.forEach(extension=>{
                            srcOrder.push(`*${extension}`);
                        })
                        

                        return srcOrder
                    }()))



                    /* Concat and uglify */
                    .pipe(concat(paths.dist.outputScript))
                    .pipe(gulpIf(run[env].script.uglify, uglify(options[env].script.uglify)))
                    .on('error', function(error) {
                        console.log(colors.red(error));
                        this.emit('end')
                    })

                    /* Write source maps */
                    .pipe(gulpIf(run[env].script.sourcemaps, sourcemaps.write('./')))

                    .pipe(gulp.dest(function(fileObject) {

                        fileObject.base = path.dirname(fileObject.path)

                        let sourceDirRegex = new RegExp(`\/${paths.src.sourceFolder}\/`, 'g');
                        let fileDir = path.dirname(fileObject.path)
                        return `${`${fileDir}/`.replace(sourceDirRegex, `/${paths.dist.outputFolder}/`)}`
                    }))

                    /* Update assets manifest */
                    .pipe(assetsJson({
                        manifestFile: `assets.manifest.json`,
                        resetManifest: false,
                        makeFileObject: function(fullPath) {
                            if (minimatch(fullPath, `**/${paths.dist.outputFolder}/**/${paths.src.scriptsFolder}/${paths.dist.outputScript}`)) {
                                let regex = new RegExp(`(?=${paths.dist.outputFolder}\/)(.*)`, 'g');
                                const relativePath = fullPath.match(regex)[0]
                                return {
                                    path: relativePath,
                                    inline: false,
                                    position: "body",
                                    attributes: [{
                                        ["name"]: "type",
                                        ["value"]: "text/javascript"
                                    }]
                                }
                            } else return null
                        },
                        manifestPath: propertyDirDist
                    }))

                    .pipe(print(filePath => `Finished '(${colors.cyan(args.skindir)}) stream for file:  ${colors.unstyle(path.dirname(filePath))}/${colors.blue(path.basename(filePath))}'`))
                    .on('end', function() {

                        log(`Finished '(${colors.cyan(args.skindir)}) scripts bundle in: ${colors.cyan(path.relative(args.skinpath, propertyDirDist))}'`);
                        notifier.notify({
                            title: 'Hebspack',
                            message: `Scripts bundled in: ${path.relative(args.skinpath, propertyDirDist)}`,
                            icon: path.join(path.join(__dirname, "../"),'favicon.png'), // Absolute path (doesn't work on balloons)
                        });

                    })


            });;

            /* Important don't delete !! */
            log(inputFile.path)
            done = selfRepeat
        }))

        if (skinDir.event === 'unlinkDir') {
            skinWatch.unwatch(skinDir.path)
            //filePaths.unwatch(filePaths)
        }

    })


    return skinWatch;


}