const gulp = require('gulp');
const appRoot = require('app-root-path');
const fileSystem = require('fs');
const minimist = require("minimist");
const colors = require('ansi-colors');
const path = require("path");
const configLoader = require('./common/config-loader');
//const validateConfig = require('./common/validate-config');
const log = require('fancy-log');
const watch = require('gulp-watch');
const { spawn } = require('child_process');
const browserSync = require('browser-sync')
const validateJson = require('jsonschema').validate;

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

    console.log()
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
            killDuplicateProcesses(processList,skindirPath)
            return
        }
        let skindirPath = path.dirname(configFileObject.path)
        let skinNameRegex = new RegExp(`([^\/]*)$`, 'g');
        let skindir = `${skindirPath.match(skinNameRegex)}`.slice(0, -1);


        configLoader.loadSkin(`${skindirPath}`)
        
        let jsonScehma = JSON.parse(fileSystem.readFileSync(`${__dirname}/common/hebspack-config-schema.json`))

        let validationsResult = validateJson({ paths, run ,pluginOptions, generalOptions }, jsonScehma)
        if(!validationsResult.valid){
            console.log()
            log("Errors in hebspack-config.json validation: ")
            
            validationsResult.errors.forEach(error=>{
                log(colors.red(error));
               
            })
            console.log()
            killDuplicateProcesses(processList,skindirPath)
            return
        }

       
            switch (true) {
                case ((generalOptions.environment==="default")):
                    args.env = "default"
                    break;
                case ((generalOptions.environment==="development")):
                    args.env = "development"
                    break;
                case ((generalOptions.environment==="production")):
                    args.env = "production"
                    break;
                default:
                    args.env = "default"
                    break;
            }

        args.taskSeries = []                  
        generalOptions.taskSeries.forEach(series => {
        if(series.run){
            args.taskSeries.push(series.slug)
            args[series.slug]=series.tasks
        }
        })
    
        log(`Executing ${colors.magenta(args.env)} environment mode`)

        args.taskSeries.forEach(series => {
            log(`Initiating ${colors.magenta(series)} task series: ${args[series]}`)
        })

        let taskRunnerPath = path.join(__dirname, 'taskRunner.js')
        let gulpCommands = './node_modules/.bin/gulp skinTasks'


        let iconPath = function(){
            if (fileSystem.existsSync(`${skindirPath}/codekit-icon.png`)) {
                return `${skindirPath}/codekit-icon.png`
            }
            else if (fileSystem.existsSync(`${skindirPath}/hebspack-icon.png`)) {
                return `${skindirPath}/hebspack-icon.png`
            }
            return `${__dirname}/favicon.png`
        }()

        args.gulpfile=taskRunnerPath
        args.skinpath=skindirPath
        args.skindir = skindir
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

        console.log()
        log(`Running executable: ${colors.grey(gulpCommands)}`)
        console.log()

        let subprocess;

        killDuplicateProcesses(processList,skindirPath)
        
        subprocess= spawn(gulpCommands, {stdio: ['inherit', 'inherit', 'inherit', 'ipc'], shell: true});

        log(`Starting '(${colors.cyan(skindir)}) process pid: ${subprocess.pid}'`)
        subprocess.skindir=skindir
        subprocess.on('message', (msg) => {
            if(msg === 'BROWSER_RELOAD'){
                browser.reload();
            }
            });
        processList.push({ subprocess, skindir , skindirPath } )

        subprocess.on('exit', function (code, signal) {
            log(`Finished '(${colors.cyan(subprocess.skindir)}) process pid ${subprocess.pid} with code ${code} and signal ${signal}'`);
        });



    })
    return skinsWatcher

   

}

function killDuplicateProcesses(list,id){
    if(list.length>0){
    let lastProcessIndex = getLastProcessIndex(list,id)

    if(lastProcessIndex >= 0){

        list[lastProcessIndex].subprocess.kill()
        list.splice(lastProcessIndex,1);

        return killDuplicateProcesses(list,id)
    }
    else{
        return
    }
}
}

function getLastProcessIndex(array, searchKey) {

    let lastIndex = -1;

    result = array.reduce((accumulator, currentValue,index)=>{
    if(currentValue['skindirPath'] === searchKey){lastIndex=index}
            return accumulator = accumulator || (currentValue['skindirPath'] === searchKey)
    },false)

    return lastIndex;

}

