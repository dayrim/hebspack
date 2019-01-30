const gulp = require('gulp');
const lodashMerge = require('lodash/merge');
const appRoot = require('app-root-path');
const fileSystem = require('fs');
const minimist = require("minimist");
const flatmap = require('gulp-flatmap');
const gulpSequence = require('gulp-sequence')
const print = require('gulp-print').default;
const colors = require('ansi-colors');
const path = require("path");
const requireDir = require('require-dir');
const tasks = requireDir('./gulp-tasks');
const configLoader = require('./common/config-loader');
const log = require('fancy-log');
const watch = require('gulp-watch');
const minimatch = require ('minimatch')
const glob = require('glob')
const { spawn } = require('child_process');
// var chokidar = require('chokidar');

// chokidar.watch('skin*').on('addDir', (event, path) => {
//   console.log(event, path);
// });

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

function gulpExec(){
    // if(typeof args.init ==='string' && !fileSystem.existsSync(`${appRoot.path}/${args.init}/`))
    // {
    //     log(colors.red('Invalid skin path'))
    //     return
    // }
    
    // configLoader.load(`${__dirname}/common/`)
    
    // gulp.task('config-init', tasks['config-init'])
    
    // gulp.task('image-init', tasks['image-init'])
    // gulp.task('font-init', tasks['font-init'])
    // gulp.task('script-init', tasks['script-init'])
    // gulp.task('style-init', tasks['style-init'])
    // gulp.task('php-plugins-init', tasks['php-plugins-init'])
    
    // gulp.task('style-watch', tasks['style-watch'])
    // gulp.task('script-watch', tasks['script-watch'])
    // gulp.task('image-watch', tasks['image-watch'])
    // gulp.task('font-watch', tasks['font-watch'])
    // gulp.task('php-plugins-watch', tasks['php-plugins-watch'])
    
    // let initTasks = []
    // run[env].tasks.init.forEach(task => {
    //     initTasks.push(task)
    // });
    
    // gulp.task('initial-build', initTasks)
    
    // let watchTasks = []
    // run[env].tasks.watch.forEach(task => {
    //     watchTasks.push(task)
    // });
    
    // gulp.task('watch', watchTasks)
    
    // gulp.task('tasks', function() {
    //     if (args.init) return gulpSequence('initial-build','watch')
    //     else return gulpSequence('watch')
    // }())


    // var watch =  gulp.parallel(tasks['style-watch'], tasks['script-watch'],tasks['image-watch'],tasks['font-watch'],tasks['php-plugins-watch'])
    // var build = gulp.series(clean, gulp.parallel(styles, scripts))




  
        
}

gulpExec()


gulp.task('skinsWatch', skinsWatch);

function skinsWatch() {

    /* Prepares skin path patterns to be watched */

  
    
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

        // restrictSkins = true
        // skinPaths=(`${skinsFolder}skin*`)

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
            skinPaths.push(`${skinsFolder}skin*/hebspack-config.json`)
    }

    skinPaths.push(`!**/node_modules/**/*`)
    skinPaths.push(`!**/master/**/*`)

    // let restrictSkins = false
    


    // if (typeof args.init === 'string') {
    //     if (fileSystem.existsSync(`${appRoot.path}/${args.init}/`)) {
    //         skinPaths.push(`${appRoot.path}**/${args.init}`)
    //     } else {
    //         log(colors.red('Invalid skin path'))
    //         return
    //     }
    // } else {
    //     skinPaths.push(`${skinFolder}skin*`)
    // }


    log("Skin folder " + skinsFolder)
    log("Skin paths " + skinPaths)
    log("Approot paths " + appRoot.path)

    let skinsWatcher = watch(skinPaths, {
        ignoreInitial: false,
        read: true,
        verbose: false,
        events: ['add', 'change', 'unlink']
    }, (configFileObject) => {
        let skinDirPath = path.dirname(configFileObject.path)


        configLoader.load(`${skinDirPath}`)

        // if (typeof args.init === 'string'){
        //     configLoader.create(`${skinDirPath}`, "gulpfile")
        // }
        // let config = configLoader.load(`${skinDirPath}`)

        // if(config){config;}
        // else{
        //     skinsWatcher.unwatch(skinDirPath)
        //     return 
        // }

        let taskRunnerPath = path.join(__dirname, 'taskRunner.js')

        // log(initTasks)
        // initTasks.push(tasks['style-init'])
        // allTasks = gulp.series(initTasks);

        let gulpCommands = './node_modules/.bin/gulp skinTasks'

        let skinNameRegex = new RegExp(`([^\/]*)$`, 'g');
        let skinDir = `${skinDirPath.match(skinNameRegex)}`


        args.skindir = skinDir.slice(0, -1);
        args.gulpfile=taskRunnerPath
        args.skinpath=skinDirPath
 
        // args.skindir=skinDir.path

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
     
            //use key and value here
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




//   module.exports = (args) => {
//     let gulpFile=path.join(__dirname, 'gulpfile.js')
//     let gulpCommand;

//     if (args._.indexOf("init") > -1) {
//       if(args._[args._.indexOf("init")+1]){
//         gulpCommand =`./node_modules/.bin/gulp tasks --gulpfile ${gulpFile} --cwd ${appRoot} --color=always --env=production --init=${args._[args._.indexOf("init")+1]}`;
//       }
//         else{
//           gulpCommand =`./node_modules/.bin/gulp tasks  --gulpfile ${gulpFile} --cwd ${appRoot} --color=always --env=production --init`;
//         }
//     } else {
//       gulpCommand =`./node_modules/.bin/gulp tasks  --gulpfile ${gulpFile} --cwd ${appRoot} --color=always --env=production`;
//     }

//     log(colors.magenta("Running production environment"))
//     shell.exec(gulpCommand)
//   }