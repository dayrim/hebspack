const gulp = require('gulp');
const minimist = require("minimist");
const appRoot = require('app-root-path');
const assetsJson = require('../custom-gulp-plugins/assets-json');
const extractMedia = require('../custom-gulp-plugins/extract-media');
const concatDuplicates = require('../custom-gulp-plugins/concat-duplicates');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const tap = require('gulp-tap');
const gulpIf = require('gulp-if');
const autoprefixer = require("gulp-autoprefixer");
const print = require('gulp-print').default;
const minimatch = require("minimatch")
const log = require('fancy-log');
const colors = require('ansi-colors');
const path = require("path")
const watch = require('gulp-watch');
const del = require('del');
const glob = require("glob") 
const batch = require("gulp-batch")
const configLoader = require('../common/config-loader');
const fileSystem = require('fs')
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
    }, (skinDir, event) => {





        /* Prepares file path patterns to be watched */

        let filePaths = [];

        options[env].style.extensions.forEach(extension => {
            filePaths.push(`${skinDir.path}/**/${paths.src.sourceFolder}/**/${paths.src.styleFolder}/**/*${extension}`)
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

                /* Prepares paths */

                let sourceStylesRegex = new RegExp(`.*(?<=\/${paths.src.styleFolder}\/)`, 'g')
                let sourceDirRegex = new RegExp(`\/${paths.src.sourceFolder}\/`, 'g');
                let propertyDirRegex = new RegExp(`.*(?<=\/${paths.src.sourceFolder}\/).*?(?=\/)`, 'g');
                let relativeToSkinRegex = new RegExp(`(?=\/${paths.src.skinsFolder})(.*)(?<=\/)`, 'g');

                let propertyDir = inputFile.path.match(propertyDirRegex)[0]
                let sourceStyles = inputFile.path.match(sourceStylesRegex)[0]
                let relativeToSkin = propertyDir.match(relativeToSkinRegex)[0]

                if (!(propertyDir.slice(-1) == `/`)) {
                    propertyDir = `${propertyDir}/`
                }
                let propertyDirDist = propertyDir.replace(sourceDirRegex, `/${paths.dist.outputFolder}/`)

                /* Prepares file paths to be processed */

                let srcFiles = [];
                options[env].style.extensions.forEach(extension => {
                    srcFiles.push(`${sourceStyles}/**/*${extension}`)
                });

                srcFiles.push(`!**/node_modules/**/*`)
                srcFiles.push(`!**/${paths.dist.outputFolder}/**/*`)
                gulp.src(srcFiles)

                    /* Saves event info */

                    .pipe(tap(function(file, t) {
                        if ((file.path) == inputFile.path) {
                            file.event = inputFile.event
                        }

                    }))

                    /* Initiate source maps */
                    .pipe(gulpIf(run[env].style.sourcemaps, sourcemaps.init()))

                    /* Compile sass */
                    .pipe(sass())
                    .on('error', function(error) {
                        console.log(colors.red(error));
                        this.emit('end')
                    })

                    /* Replaces paths inside inline css */
                    .pipe(tap(function(file) {
                        if (minimatch(file.path, `**/${paths.src.sourceFolder}/**/${paths.src.styleFolder}/initial/styles.css`)) {
                            if (file.isBuffer()) {
                                let fileContent = String(file.contents)

                                let fontsUrl = new RegExp(`(?<=url\\(\\"|\\')(.*?)(?<=\/${paths.src.fontsFolder}\/)`, 'g');
                                let imagesUrl = new RegExp(`(?<=url\\(\\"|\\')(.*?)(?<=\/${paths.src.imagesFolder}\/)`, 'g');

                                fileContent = fileContent.replace(fontsUrl, `${relativeToSkin}${paths.src.fontsFolder}/`)
                                fileContent = fileContent.replace(imagesUrl, `${relativeToSkin}${paths.src.imagesFolder}/`)

                                file.contents = Buffer.from(fileContent);
                            }
                        }
                    }))

                    /* Extracts media styles in seperate files*/
                    .pipe(gulpIf(run[env].style.extractMedia, extractMedia({
                        ignoreFiles: ["promotiles.css", "initial/styles.css"],
                        pathIgnored: function(fullPath, ignoredFile) {
                            let regex = new RegExp(`(?<=${paths.src.styleFolder}\/)(.*)`, 'g');
                            const relativePath = fullPath.match(regex)[0];
                            if (ignoredFile == relativePath) {
                                return true
                            } else {
                                return false
                            }
                        }
                    })))

                    /* Concats files with same names */
                    .pipe(concatDuplicates(run[env].style.sourcemaps))

                    /* Runs Optimization and Autoprefixing */
                    .pipe(gulpIf(run[env].style.cleanCSS, cleanCSS(options[env].style.cleanCSS)))
                    .pipe(gulpIf(run[env].style.autoprefixer, autoprefixer(options[env].style.autoprefixer)))

                    /* Write sourcemaps */
                    .pipe(gulpIf(run[env].style.sourcemaps, sourcemaps.write('./')))

                    /* Determine output location */
                    .pipe(gulp.dest(function(file) {
                        let regex = new RegExp(`.*(?=\/${paths.src.sourceFolder})`, 'g');
                        let projectDirectory = file.base.match(regex)[0];

                        regex = new RegExp(`(?<=${paths.src.sourceFolder}\/)(.*)`, 'g');
                        let relativePath = file.base.match(regex)[0];
                        return `${projectDirectory}/${paths.dist.outputFolder}/${relativePath}`
                    }))

                    /* Update manifest */
                    .pipe(print(filePath =>
                        `Finished '(${colors.cyan(args.skindir)}) stream for file:  ${colors.unstyle(path.dirname(filePath))}/${colors.blue(path.basename(filePath))}'`))

                    .pipe(assetsJson({
                        manifestFile: `assets.manifest.json`,
                        resetManifest: false,
                        makeFileObject: function(fullPath, mediaAttribute) {

                            if (minimatch(fullPath, `**/${paths.dist.outputFolder}/**/${paths.src.styleFolder}/styles.css`)) {
                                let regex = new RegExp(`(?=${paths.dist.outputFolder}\/)(.*)`, 'g');
                                const relativePath = fullPath.match(regex)[0]
                                return {
                                    path: relativePath,
                                    inline: false,
                                    position: "body",

                                    attributes: [{
                                            ["name"]: "async",
                                            ["value"]: ""
                                        }, {
                                            ["name"]: "defer",
                                            ["value"]: ""
                                        },
                                        {
                                            ["name"]: "rel",
                                            ["value"]: "stylesheet"
                                        },
                                        {
                                            ["name"]: "type",
                                            ["value"]: "text/css"
                                        }
                                    ]
                                }
                            } else if (minimatch(fullPath, `**/${paths.dist.outputFolder}/**/${paths.src.styleFolder}/initial/styles.css`)) {
                                let regex = new RegExp(`(?=${paths.dist.outputFolder}\/)(.*)`, 'g');
                                const relativePath = fullPath.match(regex)[0]
                                return {
                                    path: relativePath,
                                    inline: true,
                                    position: "head",

                                    attributes: []
                                }
                            } else if (minimatch(fullPath, `**/${paths.dist.outputFolder}/**/${paths.src.styleFolder}/initial/*media*.css`)) {
                                let regex = new RegExp(`(?=${paths.dist.outputFolder}\/)(.*)`, 'g');
                                const relativePath = fullPath.match(regex)[0]
                                return {
                                    path: relativePath,
                                    inline: true,
                                    position: "head",
                                    attributes: [{
                                        ["name"]: "media",
                                        ["value"]: mediaAttribute
                                    }]
                                }
                            } else if (minimatch(fullPath, `**/${paths.dist.outputFolder}/**/${paths.src.styleFolder}/*media*.css`)) {
                                let regex = new RegExp(`(?=${paths.dist.outputFolder}\/)(.*)`, 'g');
                                const relativePath = fullPath.match(regex)[0]
                                return {
                                    path: relativePath,
                                    inline: false,
                                    position: "body",
                                    attributes: [{
                                            ["name"]: "media",
                                            ["value"]: mediaAttribute
                                        },
                                        {
                                            ["name"]: "rel",
                                            ["value"]: "stylesheet"
                                        },
                                        {
                                            ["name"]: "type",
                                            ["value"]: "text/css"
                                        }
                                    ]
                                }
                            } else return null
                        },
                        manifestPath: propertyDirDist


                    })).on('end', function() {

                        log(`Finished '(${colors.cyan(args.skindir)}) style bundle in: ${colors.cyan(path.relative(args.skinpath, propertyDirDist))}'`);
                        notifier.notify({
                            title: 'Hebspack',
                            message: `Styles bundled in: ${path.relative(args.skinpath, propertyDirDist)}`,
                            icon: path.join(path.join(__dirname, "../"), 'favicon.png'), // Absolute path (doesn't work on balloons)
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