const gulp = require('gulp');
const flatmap = require('gulp-flatmap');
const minimist = require("minimist");
const assetsJson = require('../custom-gulp-plugins/assets-json');
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
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
const babel = require('gulp-babel');

module.exports = function() {

/* Set environment variable from cli flag*/

const args = minimist(process.argv.slice(2));


    configLoader.loadSkin(args.skinpath)
    
    return gulp.src(args.skinpath)

        /* Creates a stream for each skin */
        .pipe(flatmap(function(stream, skinDir) {
 

            return gulp.src([`${skinDir.path}/**/${paths.src.sourceFolder}/**/${paths.src.scriptsFolder}`, `!**/node_modules/**/*`, `!**/master/**/*`, `!**/${paths.dist.outputFolder}/**/*`])


                /* Creates a stream for each scripts folder*/
                .pipe(flatmap(function(stream, dir) {

                    /* Determines property directory*/

                    let propertyRegex = new RegExp(`.*(?=\/${paths.src.scriptsFolder})`, 'g');
                    let existingPropertyPath = dir.path.match(propertyRegex);
                    let sourceRegex = new RegExp(`${paths.src.sourceFolder}`, 'g');
                    let propertyDir = existingPropertyPath[0];
                    let propertyDirDist = propertyDir.replace(sourceRegex, paths.dist.outputFolder);

                    return gulp.src([`${dir.path}/**/*.js`,
                            `!${dir.path}/**/*${paths.src.ignoreSuffix}`
                        ],{allowEmpty: true })

                        /* Reset Manifest file */
                        .pipe(assetsJson({
                            manifestFile: `assets.manifest.json`,
                            resetManifest: true,
                            manifestPath: propertyDirDist
                        }))
                        // .pipe(print(filepath => `Stream started for: ${colors.unstyle(path.dirname(filepath))}/${colors.red(path.basename(filepath))}`))

                        /* Initiate source maps */
                        .pipe(gulpIf(run[args.env].style.sourcemaps, sourcemaps.init()))

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
                            pluginOptions[args.env].script.extensions.forEach(extension=>{
                                srcOrder.push(`*${extension}`);
                            })
                          

                            return srcOrder
                        }()))
                        // .pipe(print(filepath => `Stream reoreder for: ${colors.unstyle(path.dirname(filepath))}/${colors.green(path.basename(filepath))}`))

                        /* Concat and uglify */
                        .pipe(concat(paths.dist.outputScript))
                        .pipe(gulpIf(run[args.env].script.babel, babel(pluginOptions[args.env].script.babel)))
                        .pipe(gulpIf(run[args.env].script.uglify, uglify(pluginOptions[args.env].script.uglify)))
                        .on('error', function(error) {
                            console.log(colors.red(error));
                            this.emit('end')
                        })

                        /* Write source maps */
                        .pipe(gulpIf(run[args.env].style.sourcemaps, sourcemaps.write('./')))

                        /* Determines output directory */
                        .pipe(gulp.dest(function(file) {

                            let regex = new RegExp(`.*(?=\/${paths.src.sourceFolder})`, 'g');
                            const projectDirectory = file.base.match(regex)[0];

                            regex = new RegExp(`(?<=${paths.src.sourceFolder}\/)(.*)`, 'g');
                            const relativePath = file.base.match(regex)[0];
                            
                            return `${projectDirectory}/${paths.dist.outputFolder}/${relativePath}`
                        }))

                        /* Update assets manifest */
                        .pipe(assetsJson({
                            manifestFile: `assets.manifest.json`,
                            resetManifest: false,
                            order: 'last',
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

                        })

                }))
        }))
        .on('end', function() {

             /*
            notifier.notify({
                title: 'Hebspack',
                message: `Scripts bundled in ${args.skindir}`,
                icon: args.iconpath,
            });
            */

        })
}