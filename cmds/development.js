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
      }
        else{
          gulpCommand =`./node_modules/.bin/gulp skinsWatch  --gulpfile ${gulpFile} --cwd ${appRoot} --color=always --env=development --init`;
        }
    } else {
      gulpCommand =`./node_modules/.bin/gulp skinsWatch  --gulpfile ${gulpFile} --cwd ${appRoot} --color=always --env=development`;
    }
  
    log(colors.magenta("Running development environment"))
    shell.exec(gulpCommand)
  }