const gulp = require('gulp');
const minimist = require("minimist");
const colors = require('ansi-colors');
const requireDir = require('require-dir');
const importedTasks = requireDir('./gulp-tasks');
const configLoader = require('./common/config-loader');
const log = require('fancy-log');


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


function initTasks(done) {
    // log(colors.red(      JSON.stringify(args)))
    // log("Arguments "+colors.red(args.skinpath))

    configLoader.load(`${args.skinpath}`)
    
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

    configLoader.load(`${args.skinpath}`)
    
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
    skinTasks= gulp.series(initTasks);
        
    }
    else{
        skinTasks= gulp.series(watchTasks);
    }

  gulp.task('skinTasks', skinTasks);