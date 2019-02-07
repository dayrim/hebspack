const gulp = require('gulp');
const minimist = require("minimist");
const colors = require('ansi-colors');
const requireDir = require('require-dir');
const configLoader = require('./common/config-loader');
const log = require('fancy-log');
const fileSystem = require('fs');

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

let importedTasks;
let customTasks;
let defaultTasks = requireDir('./gulp-tasks');

if (fileSystem.existsSync(`${args.skinpath}/gulp-tasks`)) {
     customTasks = requireDir(`${args.skinpath}/gulp-tasks`);
}

configLoader.load(`${args.skinpath}`)

if(customTasks !== defaultTasks){
    importedTasks = {...customTasks, ...defaultTasks}
}
else{
    importedTasks = defaultTasks;
}




function initTasks(done) {
    // log(colors.red(      JSON.stringify(args)))
    // log("Arguments "+colors.red(args.skinpath))

    
    const tasks = run[env].tasks.init.map((taskName) => {
  
      // Right here, we return a function per country
      if(!importedTasks[taskName]){
        log(colros.red("Unexisting task"))
        }
        else{

            importedTasks[taskName].displayName=`(${colors.cyan(args.skindir)}) ${colors.magenta(taskName)} task`
            return importedTasks[taskName]
        }

    });
    return gulp.series(gulp.parallel(...tasks), (seriesDone) => {
      seriesDone();
      done();
    })(); 
  }
  
  function watchTasks(done) {
    // log(colors.red(      JSON.stringify(args)))
    // log("Arguments "+colors.red(args.skinpath))

    
    
    const tasks = run[env].tasks.watch.map((taskName) => {
  
      // Right here, we return a function per country
      if(!importedTasks[taskName]){
        log(colros.red("Unexisting task"))
        }
        else{

            importedTasks[taskName].displayName=`(${colors.cyan(args.skindir)}) ${colors.magenta(taskName)} task`
            return importedTasks[taskName]
        }

    });
    return gulp.series(gulp.parallel(...tasks), (seriesDone) => {
      seriesDone();
      done();
    })(); 
  }

  initTasks.displayName = `(${colors.cyan(args.skindir)}) ${colors.magenta(`init-build`)} task`
  watchTasks.displayName = `(${colors.cyan(args.skindir)}) ${colors.magenta(`watch`)} task`


  let skinTasks 

  if(args.init ){
    if(run[env].tasks.init)
    {    
        skinTasks= gulp.series(initTasks);
        gulp.task('skinTasks', skinTasks);
        }
        
    }
    else{
        if(run[env].tasks.watch){
            skinTasks= gulp.series(watchTasks)
            gulp.task('skinTasks', skinTasks);
        };
    }

