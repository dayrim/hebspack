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
    

    let skinsRegex = new RegExp(`.*(?<=\/skins\/)`, 'g');
    let skinsExist = appRoot.path.match(skinsRegex)
    let skinPaths = [];
    let skinName;
    let processList = [];

    if (!skinsExist) { 
        log(colors.red(`Hebspack must be run from or within "skins" folder`))
        return
    }
    let skinsFolder = skinsExist[0]

    if (`${appRoot.path}` !== `${skinsFolder}`) {

        if (typeof args.init === 'string') {
            if (fileSystem.existsSync(`${skinsFolder}${args.init}`)) {

                configLoader.create(`${skinsFolder}${args.init}`, "gulpfile")
                skinPaths.push(`${skinsFolder}${args.init}/hebspack-config.json`)

            } else {
                log(colors.red(`${colors.red(`Skins directory: '${args.init}' does not exist`)}`))
                return
            }
        }
        else{
            let skinNameRegex = new RegExp(`([^\/]*)\/$`,'g')
            skinName = `${appRoot.path.match(skinNameRegex)}`
            skinName = skinName.slice(0, -1);
         

            skinPaths.push(`${skinsFolder}${skinName}/hebspack-config.json`)
        }

    }
    else if (`${appRoot.path}` === `${skinsFolder}`){
        if (typeof args.init === 'string') {
            if (fileSystem.existsSync(`${skinsFolder}${args.init}`)) {

                configLoader.create(`${skinsFolder}${args.init}`, "gulpfile")
                skinPaths.push(`${skinsFolder}${args.init}/hebspack-config.json`)

            } else {
                log(colors.red(`${colors.red(`Skins directory: '${args.init}' does not exist`)}`))
                return
            }
        }
        else{
            skinPaths.push(`${skinsFolder}skin*/hebspack-config.json`)
        }
           
    }

    skinPaths.push(`!**/node_modules/**/*`)
    skinPaths.push(`!**/master/**/*`)

    let skinsWatcher = watch(skinPaths, {
        ignoreInitial: false,
        read: true,
        verbose: false,
        events: ['add', 'change', 'unlink']
    }, (configFileObject) => {
        let skinDirPath = path.dirname(configFileObject.path)
        configLoader.load(`${skinDirPath}`)
        let validateMessage = validateConfig(paths, run ,options )
        if(validateMessage){
            log(colors.red(validateMessage))
            return
        }
        
        let taskRunnerPath = path.join(__dirname, 'taskRunner.js')



        let gulpCommands = './node_modules/.bin/gulp skinTasks'

        let skinNameRegex = new RegExp(`([^\/]*)$`, 'g');
        let skinDir = `${skinDirPath.match(skinNameRegex)}`


        args.skindir = skinDir.slice(0, -1);
        args.gulpfile=taskRunnerPath
        args.skinpath=skinDirPath
 
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

