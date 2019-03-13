const gulp = require('gulp');
const minimist = require("minimist");
const colors = require('ansi-colors');
const requireDir = require('require-dir');
const configLoader = require('./common/config-loader');
const log = require('fancy-log');
const fileSystem = require('fs');


const args = minimist(process.argv.slice(2));

let importedTasks;
let customTasks;
let defaultTasks = requireDir('./gulp-tasks');

if (fileSystem.existsSync(`${args.skinpath}/gulp-tasks`)) {
     customTasks = requireDir(`${args.skinpath}/gulp-tasks`);
}

configLoader.loadSkin(`${args.skinpath}`)

if(customTasks !== defaultTasks){
    importedTasks = {...customTasks, ...defaultTasks}
}
else{
    importedTasks = defaultTasks;
}


function initTasks(done) {
    
    const tasks = run[args.env].tasks.init.map((taskName) => {
  

      if(!importedTasks[taskName]){
        log(colors.red("Unexisting task"))
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
    const tasks = run[args.env].tasks.watch.map((taskName) => {
  
      if(!importedTasks[taskName]){
        log(colors.red("Unexisting task"))
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

function reloadBrowsers(done){
    if (args.browsersync) {
        process.send("BROWSER_RELOAD");
        }
    done()
}

reloadBrowsers.displayName = `(${colors.cyan(args.skindir)}) ${colors.magenta(`reload-browsers`)} task`
initTasks.displayName = `(${colors.cyan(args.skindir)}) ${colors.magenta(`init-build`)} task`
watchTasks.displayName = `(${colors.cyan(args.skindir)}) ${colors.magenta(`watch`)} task`


let skinTasks 

if(args.init && args.watch){
    skinTasks= gulp.series(initTasks,reloadBrowsers,watchTasks);
}
else if(args.init && !args.watch){
    skinTasks= gulp.series(initTasks,reloadBrowsers);
}
else if(!args.init && args.watch){
    skinTasks= gulp.series(watchTasks);
}



gulp.task('skinTasks', skinTasks);