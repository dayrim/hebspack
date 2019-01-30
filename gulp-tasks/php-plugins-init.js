const gulp = require('gulp');
const minimist = require("minimist");
const colors = require('ansi-colors');
const path = require("path")
const log = require('fancy-log');
const appRoot = require('app-root-path');
const glob = require("glob")
const tap = require("gulp-tap")
const fileSystem = require("fs")



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

    let gulpFlow = gulp.src([path.join(__dirname, '../php-plugins/**/*')])

    let outputPathsArray = [];
    outputPathsArray.push(`${args.skinpath}/plugins`)
   

    outputPathsArray.forEach(outputPath => {
        gulpFlow = gulpFlow.pipe(tap(file => {
            if (!fileSystem.existsSync(`${outputPath}/${path.basename(file.path)}`)) {
                log(`Finished '(${colors.cyan(args.skindir)}) stream for file:  ${outputPath}/${colors.blue(path.basename(file.path))}'`)
                gulpFlow = gulpFlow.pipe(gulp.dest(outputPath));
            }
        }));

    })
    return gulpFlow;


}