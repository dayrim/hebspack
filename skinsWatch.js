const gulp = require('gulp');
const appRoot = require('app-root-path');
const fileSystem = require('fs');
const minimist = require("minimist");
const colors = require('ansi-colors');
const path = require("path");
const configLoader = require('./common/config-loader');
const validateConfig = require('./common/validate-config');
const log = require('fancy-log');
const watch = require('gulp-watch');
const { spawn } = require('child_process');
const browserSync = require('browser-sync')


const args = minimist(process.argv.slice(2));

gulp.task('skinsWatch', skinsWatch);


let browser; 
if(args.browsersync){
    browser = browserSync.create();
    let config = {
        proxy: (()=>{
            if(typeof args.browsersync==='number'){
                return `http://localhost:${args.browsersync}`
            }
            else{
                return `http://localhost:80`
            }
        })(),
        port: 9000,
        reloadOnRestart: true,
        open: false,
        rewriteRules: [
            {
                match: /Content-Security-Policy/,
                fn: function(match) {
                    return "DISABLED-Content-Security-Policy";
                }
            }
        ],
        callbacks: {
            /**
             * This 'ready' callback can be used
             * to access the Browsersync instance
             */
            ready: function(err, br) {
                
            }
        }
    };
    browser.init(config);
}

function skinsWatch() {

    if (!(appRoot.path.slice(-1) == `/`)) {
        appRoot.path = `${appRoot.path}/`
    }

    configLoader.loadHebspack(appRoot.path)


    let skinPaths = [];
    let processList = [];
    let ignoreList = []
    
    let skinsFolder = hebspackconfig.skinspath;

    if (typeof args.skins === 'string'){
        args.skins.split(",").map(skin=>{
            if (fileSystem.existsSync(`${skinsFolder}${skin}`)) {
                configLoader.create(`${skinsFolder}${skin}`, "gulpfile")
                skinPaths.push(`${skinsFolder}${skin}/hebspack-config.json`)
                ignoreList.push(`${skinsFolder}${skin}/node_modules`)
                ignoreList.push(`${skinsFolder}${skin}/node_modules/**`)
    
            } else {
                log(`Skins directory: ${colors.red(`'${skin}' does not exist`)}`)
                return
            }
        })

    }
    else {
        if (fileSystem.existsSync(`${skinsFolder}hebspack-config.json`)) {
            skinPaths.push(`${skinsFolder}hebspack-config.json`)
            ignoreList.push(`${skinsFolder}node_modules`)
            ignoreList.push(`${skinsFolder}node_modules/**`)
            ignoreList.push(`${skinsFolder}master/**`)
        }
        else{
            skinPaths.push(`${skinsFolder}*/hebspack-config.json`)
            ignoreList.push(`${skinsFolder}**/node_modules`)
            ignoreList.push(`${skinsFolder}**/node_modules/**`)
            ignoreList.push(`${skinsFolder}*/master/**`)
        }
    }


    
    log(`Base skins folder: ${ colors.magenta(skinsFolder)}`)

    let skinsWatcher = watch(skinPaths, {
        ignoreInitial: false,
        read: true,
        verbose: false,
        events: ['add', 'change', 'unlink'],
        ignored: ignoreList,
    }, (configFileObject) => {
        if(configFileObject.event ==='unlink'){
            skinsWatcher.unwatch(configFileObject.path)
        }
        let skinDirPath = path.dirname(configFileObject.path)

        configLoader.loadSkin(`${skinDirPath}`)
        let validateMessage = validateConfig(paths, run ,options )
        if(validateMessage){
            log(colors.red(validateMessage))
            return
        }

        switch (true) {
            case ((general) && (general.environment==="default")):
                args.env = "default"
                break;
            case ((general) && (general.environment==="development")):
                args.env = "development"
                break;
            case ((general) && (general.environment==="production")):
                args.env = "production"
                break;
            default:
                args.env = "default"
                break;
        }
        switch (true) {
            case ((general) && (general.watch===true)):
                args.watch = true
                break;
            default:
                args.watch = false
                break;
        }

        switch (true) {
            case ((general) && (general.init===true)):
                args.init = true
                break;
            default:
                args.init = false
                break;
        }


        log(`Executing ${colors.magenta(args.env)} environment set`)

        if(args.init && args.watch){
            log(`Bundling ${colors.magenta(`initial build`)}`)
            log(`Running ${colors.magenta(`watch mode`)}`)
        }
        else if(args.init && !args.watch){
            log(`Bundling ${colors.magenta(`initial build`)}`)
        }
        else if(!args.init && args.watch){
            log(`Running ${colors.magenta(`watch mode`)}`)
        }




        
        let taskRunnerPath = path.join(__dirname, 'taskRunner.js')

        let gulpCommands = './node_modules/.bin/gulp skinTasks'

        let skinNameRegex = new RegExp(`([^\/]*)$`, 'g');
        let skinDir = `${skinDirPath.match(skinNameRegex)}`
        let iconPath = function(){
            
            if (fileSystem.existsSync(`${skinDirPath}/codekit-icon.png`)) {
                return `${skinDirPath}/codekit-icon.png`
            }
            return `${__dirname}/favicon.png`
        }()

        args.skindir = skinDir.slice(0, -1);
        args.gulpfile=taskRunnerPath
        args.skinpath=skinDirPath
        args.iconpath=iconPath

        Object.entries(args).forEach(entry => {
            let key = entry[0];
            let value = entry[1];
            if(key !== '_'){
                switch (value) {
                    case true:
                    gulpCommands = `${gulpCommands} --${key}`
                        break;
                
                    case false:
                    gulpCommands = `${gulpCommands}`
                        break;
                
                    default:
                    gulpCommands = `${gulpCommands} --${key}=${value}`
                        break;
                }
            
            }
     
        });

        log(`Running executable: ${colors.grey(gulpCommands)}`)

        const skinpath = args.skinpath
        const skindir = args.skindir
        let subprocess;
     

        (function killProcess(list,id){
            let lastProcessIndex = getLastProcessIndex(list,id)

            if(lastProcessIndex >= 0){

                log(`Restarting '(${colors.cyan(args.skindir)})`)

                processList[lastProcessIndex].subprocess.kill()
                processList.splice(lastProcessIndex,1);

                return killProcess(list,id)
            }
            else{
                return
            }
        })(processList,skinpath)

        subprocess= spawn(gulpCommands, {stdio: ['inherit', 'inherit', 'inherit', 'ipc'], shell: true});

        log(`Starting '(${colors.cyan(args.skindir)}) process pid: ${subprocess.pid}'`)
        subprocess.skindir=args.skindir
        subprocess.on('message', (msg) => {
            if(msg === 'BROWSER_RELOAD'){
                browser.reload();
            }
            });
        processList.push({ subprocess, skindir , skinpath } )

        subprocess.on('exit', function (code, signal) {
            log(`Finished '(${colors.cyan(subprocess.skindir)}) process pid ${subprocess.pid} with code ${code} and signal ${signal}'`);
        });



    })
    return skinsWatcher

   

}

function getLastProcessIndex(array, searchKey) {

    let lastIndex = -1;

    result = array.reduce((accumulator, currentValue,index)=>{
    if(currentValue['skinpath'] === searchKey){lastIndex=index}
            return accumulator = accumulator || (currentValue['skinpath'] === searchKey)
    },false)

    return lastIndex;

}

