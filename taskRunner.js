const gulp = require('gulp');
const minimist = require("minimist");
const colors = require('ansi-colors');
const requireDir = require('require-dir');
const configLoader = require('./common/config-loader');
const log = require('fancy-log');
const fileSystem = require('fs');
const notifier = require('node-notifier');


const args = minimist(process.argv.slice(2));

let importedTasks = {};
let customTasks = {};
let defaultTasks = requireDir('./gulp-tasks');

if (fileSystem.existsSync(`${args.skinpath}/gulp-tasks`)) {
     customTasks = requireDir(`${args.skinpath}/gulp-tasks`);
}

importedTasks = {...customTasks, ...defaultTasks}
configLoader.loadSkin(`${args.skinpath}`)


let taskSeries=[];
args.taskSeries.split(",").forEach((seriesSlug,index)=>{

    taskSeries[index] = function(done){
  
        const tasks = args[seriesSlug].split(',').map((taskSlug) => {

            if(!importedTasks[taskSlug]){
              }
              else{
      
                  importedTasks[taskSlug].displayName=`(${colors.cyan(args.skindir)}) ${colors.magenta(taskSlug)} task`
          
                  return importedTasks[taskSlug]
              }
      
          });
          let parallelTasks = gulp.parallel(...tasks)
 
          let seriesDoneFunction = (seriesDone) => {
            notifier.notify({
                title: `${args.skindir}`,
                message: `Finished ${seriesSlug} series task`,
                icon: args.iconpath,
            });
            seriesDone();
            done();
          }
          seriesDoneFunction.displayName = `(${colors.cyan(args.skindir)}) ${colors.magenta(seriesSlug)} series task`

          return gulp.series(parallelTasks, seriesDoneFunction)(); 
    } 
    taskSeries[index].displayName = `(${colors.cyan(args.skindir)}) ${colors.magenta(`${seriesSlug}`)} task`
})

/* Inserts reload browser task before watch or at the end of task series */

if (args.browsersync){
    let reloadBrowsers = function (done){
        process.send("BROWSER_RELOAD");
        done()
    }
    reloadBrowsers.displayName = `(${colors.cyan(args.skindir)}) ${colors.magenta(`reload-browsers`)} task`
    
    numberOfSeries = taskSeries.length
    if(numberOfSeries>1)
    {
       (()=>{
        for (i = 0; i < numberOfSeries; i++) {
            if(taskSeries[i].displayName.includes('watch')){
                taskSeries.splice(i--, 0, reloadBrowsers);
                return;
            }
        }
        taskSeries.push(reloadBrowsers)
        })()

    }
}

gulp.task('skinTasks', gulp.series(...taskSeries),);