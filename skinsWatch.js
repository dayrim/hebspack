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


gulp.task('skinsWatch', skinsWatch);

function skinsWatch() {

    
    if (!(appRoot.path.slice(-1) == `/`)) {
        appRoot.path = `${appRoot.path}/`
    }

    configLoader.loadHebspack(appRoot.path)


    let skinPaths = [];
    let processList = [];
    let ignoreList = []
    
    let skinsFolder = hebspackconfig.skinspath;

    log(`Base skins folder: ${ colors.magenta(skinsFolder)}`)
    if (typeof args.init === 'string') {
            if (fileSystem.existsSync(`${skinsFolder}${args.init}`)) {

                configLoader.create(`${skinsFolder}${args.init}`, "gulpfile")
                skinPaths.push(`${skinsFolder}${args.init}/hebspack-config.json`)
                ignoreList.push(`${skinsFolder}${args.init}/node_modules`)
                ignoreList.push(`${skinsFolder}${args.init}/node_modules/**`)

            } else {
                log(colors.red(`${colors.red(`Skins directory: '${args.init}' does not exist`)}`))
                return
            }
    }
    else if(typeof args.watch === 'string'){
        if (fileSystem.existsSync(`${skinsFolder}${args.watch}`)) {

            skinPaths.push(`${skinsFolder}${args.watch}/hebspack-config.json`)
            ignoreList.push(`${skinsFolder}${args.watch}/node_modules`)
            ignoreList.push(`${skinsFolder}${args.watch}/node_modules/**`)

        } else {
            log(colors.red(`${colors.red(`Skins directory: '${args.watch}' does not exist`)}`))
            return
        }
    }
    else{
     
            if (fileSystem.existsSync(`${skinsFolder}hebspack-config.json`)) {
                skinPaths.push(`${skinsFolder}hebspack-config.json`)
                ignoreList.push(`${skinsFolder}node_modules`)
                ignoreList.push(`${skinsFolder}node_modules/**`)
                ignoreList.push(`${skinsFolder}master/**`)
            }
            else{
                skinPaths.push(`${skinsFolder}*/hebspack-config.json`)
                ignoreList.push(`${skinsFolder}node_modules`)
                ignoreList.push(`${skinsFolder}node_modules/**`)
                ignoreList.push(`${skinsFolder}master/**`)
            }
    }
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


        const skinpath = args.skinpath
        const skindir = args.skindir
        let subprocess;
        let processIndex = processExists(processList, skinpath)
        if(processIndex){
            processList[processIndex].subprocess.kill()
            processList=processList.splice(processIndex,1);
            subprocess= spawn(gulpCommands, {stdio: 'inherit', shell: true});
            log(`Starting '(${colors.cyan(args.skindir)}) process pid: ${subprocess.pid}'`)
            processList.push({ subprocess, skindir , skinpath } )
        }
        else {
            subprocess= spawn(gulpCommands, {stdio: 'inherit', shell: true});
            log(`Starting '(${colors.cyan(args.skindir)}) process pid: ${subprocess.pid}'`)
            processList.push({ subprocess, skindir , skinpath } )
        }




        subprocess.on('exit', function (code, signal) {
            log(`Finished '(${colors.cyan(args.skindir)}) process pid ${subprocess.pid} with code ${code} and signal ${signal}'`);
        });



    })
    return skinsWatcher

   

}

function processExists(array, searchKey) {
    let processIndex;
  result= array.reduce((accumulator, currentValue,index)=>{
      if(currentValue['skinpath'] === searchKey){processIndex=index}
    return accumulator = accumulator || (currentValue['skinpath'] === searchKey)
  },false)
  if(result){return processIndex}
  else{ return false}
}

