const minimist = require("minimist");
const colors = require('ansi-colors');
const path = require("path")
const watch = require('gulp-watch');
const log = require('fancy-log');
const configLoader = require('../common/config-loader');
const fileSystem = require('fs')
const glob = require('glob');




module.exports = function() {

    /* Set environment variable from cli flag*/

    let env;
    const args = minimist(process.argv.slice(2));
    let pluginFiles = glob.sync(`${path.join(__dirname, '../php-plugins/**/*')}`);
    
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

        filePaths.push(`${skinDir.path}/**/${paths.src.pluginsFolder}`)
        filePaths.push(`!**/node_modules/**/`)
        filePaths.push(`!**/${paths.dist.outputFolder}/**/`)

        filesWatch = watch(filePaths, {
            ignoreInitial: true,
            read: false,
            verbose: false,
            events: ['addDir', 'unlinkDir']
        }, (pluginDir, event) => {
            pluginFiles.forEach(pluginFile => {

                if (!fileSystem.existsSync(`${pluginDir.path}/${path.basename(pluginFile)}`)) {
                    fileSystem.copyFile(pluginFile, `${pluginDir.path}/${path.basename(pluginFile)}`, (err) => {
                        if (err) throw err;
                    });
                    log(`Finished '(${colors.cyan(args.skindir)}) stream for file:  ${pluginDir.path}/${colors.blue(path.basename(pluginFile))}'`)
                }
            })
        })


        if (skinDir.event === 'unlinkDir') {
            skinWatch.unwatch(skinDir.path)
            // filePaths.unwatch(filePaths)
        }

    })


    return skinWatch;


}