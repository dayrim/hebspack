const gulp = require('gulp');
const flatmap = require('gulp-flatmap');
const minimist = require("minimist");
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
const configLoader = require('../common/config-loader');
const notifier = require('node-notifier');

/* Set environment variable from cli flag*/

module.exports = function() {
    const args = minimist(process.argv.slice(2));
    
    configLoader.loadSkin(args.skinpath)
    return gulp.src(args.skinpath)

        /* Creates a stream for each skin */
        .pipe(flatmap(function(stream, skinDir) {

            return gulp.src([`${skinDir.path}/**/${paths.src.sourceFolder}/**/${paths.src.styleFolder}`, `!**/node_modules/**/*`, `!**/master/**/*`, `!**/${paths.dist.outputFolder}/**/*`])

                /* Creates a stream for each style folder*/
                .pipe(flatmap(function(stream, dir) {
                    /* Determines property directory*/
                    let propertyRegex = new RegExp(`.*(?=\/${paths.src.styleFolder})`, 'g');
                    let existingPropertyPath = dir.path.match(propertyRegex);
                    let sourceRegex = new RegExp(`${paths.src.sourceFolder}`, 'g');
                    let propertyDirectory = existingPropertyPath[0];
                    let propertyDirDist = propertyDirectory.replace(sourceRegex, paths.dist.outputFolder);

                    return gulp.src(function() {
                            let srcStyles = [];
                            paths.src.styleFiles.forEach((fileName) => {
                                srcStyles.push(`${dir.path}/${fileName}`);
                            });
                            return srcStyles
                        }(),{allowEmpty: true })

                        /* Reset Manifest file */
                        .pipe(assetsJson({
                            manifestFile: `assets.manifest.json`,
                            resetManifest: true,
                            manifestPath: propertyDirDist
                        }))

                        /* Initiates source maps */
                        .pipe(gulpIf(run[args.env].style.sourcemaps, sourcemaps.init()))

                        /* Compiles sass */
                        .pipe(sass())
                        .on('error', function(error) {
                            console.log(colors.red(error));
                            this.emit('end')
                        })

                        /* Replaces paths inside inline css */

                        // .pipe(tap(function(file) {
                        //     if (minimatch(file.path, `**/${paths.src.sourceFolder}/**/${paths.src.styleFolder}/initial/styles.css`)) {
                        //         if (file.isBuffer()) {
                        //             let fileContent = String(file.contents)
                        //             let fontsUrl = new RegExp(`(?<=url\\(\\"|\\')(.*?)(?<=\/${paths.src.fontsFolder}\/)`, 'g');
                        //             let imagesUrl = new RegExp(`(?<=url\\(\\"|\\')(.*?)(?<=\/${paths.src.imagesFolder}\/)`, 'g');
                        //             let relativeToSkin = new RegExp(`(?=${paths.src.sourceFolder})(.*)`, 'g');

                        //             // let replaceUrl = propertyDirectory.match(relativeToSkin)[0]
                        //             // fileContent = fileContent.replace(fontsUrl, `${replaceUrl}/${paths.src.fontsFolder}/`)
                        //             // fileContent = fileContent.replace(imagesUrl, `${replaceUrl}/${paths.src.imagesFolder}/`)

                        //             file.contents = Buffer.from(fileContent);
                        //         }
                        //     }
                        // }))

                        /* Extract smedia styles in seperate files*/
                        .pipe(gulpIf(run[args.env].style.extractMedia, extractMedia({
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
                        .pipe(concatDuplicates(run[args.env].style.sourcemaps))

                        /* Runs Optimization and Autoprefixing */
                        .pipe(gulpIf(run[args.env].style.cleanCSS, cleanCSS(options[args.env].style.cleanCSS)))
                        .pipe(gulpIf(run[args.env].style.autoprefixer, autoprefixer(options[args.env].style.autoprefixer)))

                        /* Write sourcemaps */
                        .pipe(gulpIf(run[args.env].style.sourcemaps, sourcemaps.write('./')))

                        /* Determines destination for output */
                        .pipe(gulp.dest(function(file) {

                            let regex = new RegExp(`.*(?=\/${paths.src.sourceFolder})`, 'g');
                            const projectDirectory = file.base.match(regex)[0];

                            regex = new RegExp(`(?<=${paths.src.sourceFolder}\/)(.*)`, 'g');
                            const relativePath = file.base.match(regex)[0];

                            return `${projectDirectory}/${paths.dist.outputFolder}/${relativePath}`
                        }))

                        /* Update manifest */
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
                                                },
                                                {
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
                                            attributes: [
                                                {
                                                    ["name"]: "async",
                                                    ["value"]: ""
                                                },
                                                {
                                                    ["name"]: "defer",
                                                    ["value"]: ""
                                                },
                                                {
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


                            }



                        ))


                        .pipe(print(filePath => `Finished '(${colors.cyan(args.skindir)}) stream for file:  ${colors.unstyle(path.dirname(filePath))}/${colors.blue(path.basename(filePath))}'`))
                        .on('end', function() {

                            log(`Finished '(${colors.cyan(args.skindir)}) style bundle in: ${colors.cyan(path.relative(args.skinpath, propertyDirDist))}'`);

                        })


                }))
        })).on('end', function() {

            notifier.notify({
                title: 'Hebspack',
                message: `Styles bundled in ${args.skindir}`,
                icon: args.iconpath,
            });

        })
};