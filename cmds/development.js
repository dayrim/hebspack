const shell = require("shelljs");
const path = require("path")
const log = require('fancy-log');
const appRoot = require('app-root-path');
const colors = require('ansi-colors');

  module.exports = (args) => {
    let gulpFile=path.join(__dirname, '../skinsWatch.js')
    let gulpCommand;

    if (args._.indexOf("init") > -1) {
      if(args._[args._.indexOf("init")+1]){
        gulpCommand =`./node_modules/.bin/gulp skinsWatch  --gulpfile ${gulpFile} --cwd ${appRoot} --color=always --env=development --init=${args._[args._.indexOf("init")+1]}`;
        log(colors.magenta("Running development environment in initial-build mode"))
      }
      else{
        gulpCommand =`./node_modules/.bin/gulp skinsWatch  --gulpfile ${gulpFile} --cwd ${appRoot} --color=always --env=development --init`;
        log(colors.magenta("Running development environment in initial-build mode"))
      }
    }
    else if (args._.indexOf("watch") > -1){
      if(args._[args._.indexOf("watch")+1]){
        gulpCommand =`./node_modules/.bin/gulp skinsWatch  --gulpfile ${gulpFile} --cwd ${appRoot} --color=always --env=development --watch=${args._[args._.indexOf("watch")+1]}`;
        log(colors.magenta("Running development environment in watch mode"))
      }
      else{
        gulpCommand =`./node_modules/.bin/gulp skinsWatch  --gulpfile ${gulpFile} --cwd ${appRoot} --color=always --env=development --watch`;
        log(colors.magenta("Running development environment in watch mode"))
      }
    }
    else{
      if(args._[args._.indexOf("development")+1]){
        gulpCommand =`./node_modules/.bin/gulp skinsWatch  --gulpfile ${gulpFile} --cwd ${appRoot} --color=always --env=development  --watch=${args._[args._.indexOf("development")+1]}`;
        log(colors.magenta("Running development environment in watch mode"))
      }
      else if (args._[0]) {
        gulpCommand =`./node_modules/.bin/gulp skinsWatch  --gulpfile ${gulpFile} --cwd ${appRoot} --color=always --env=development  --watch=${args._[0]}`;
        log(colors.magenta("Running development environment in watch mode"))
      }
      else {
        gulpCommand =`./node_modules/.bin/gulp skinsWatch  --gulpfile ${gulpFile} --cwd ${appRoot} --color=always --env=development  --watch`;
        log(colors.magenta("Running development environment in watch mode"))
      }
    }
    shell.exec(gulpCommand)
  }