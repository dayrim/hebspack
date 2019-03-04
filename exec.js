#!/usr/bin/env node
const program = require('commander'); 
const appRoot = require('app-root-path');
const path = require("path");
const log = require('fancy-log');
const colors = require('ansi-colors');
const shell = require("shelljs");
const { version } = require('./package.json')

let gulpFile=path.join(__dirname, './skinsWatch.js')
let gulpCommand =`./node_modules/.bin/gulp skinsWatch  --gulpfile ${gulpFile} --cwd ${appRoot} --color=always`;

program
  .version(`Hebspack version:  ${colors.magenta(version)}`)
  .usage('[skin] [options]')
  .arguments('[skin]')
  .action(function (skin) {
     skinDir = skin;
  })
  .option('-i, --init', 'Run initial build', initOption)
  .option('-w, --watch', 'Run watch mode', watchOption)
  .option('-s, --serve', 'Start dev server', serveOption)
  .option('-v, --version', 'Hebspack version')
  .option('-e, --env <environment>', `Environment settings. Can be 'default', 'production' or 'development'`, envOption)
 
program.parse(process.argv);

if (skinDir) {
  gulpCommand = `${gulpCommand} --skindir=${skinDir}`
}
function serveOption(){
  gulpCommand = `${gulpCommand} --serve`
}
function initOption(){
  gulpCommand = `${gulpCommand} --init`
}
function watchOption(){
  gulpCommand = `${gulpCommand} --watch`
}
function envOption(env){
    switch (env) {
      case "default":
          break;
      case "development":
          break;
      case "production":
          break;
      default:
          env = "default"
          break;
  }
  gulpCommand = `${gulpCommand} --env=${env}`
}


if(!program.init && !program.watch){
  gulpCommand = `${gulpCommand} --watch`
}
log(`Hebspack version:  ${colors.magenta(version)}`)
log(`Running executable: ${colors.grey(gulpCommand)}`)
shell.exec(gulpCommand)



/*
const Table = require('cli-table');
const envTable = new Table();

envTable.push(
  { '[env]': ['Description'] },
    { 'default': ['Run bundler with default environment settings'] },
    { 'development': ['Run bundler with development environment settings'] },
    { 'production': ['Run bundler with production environment settings'] },
    { '': ['The bundler is run in default environment settings'] },
);

const initTable = new Table();

initTable.push(
    { '[init]': ['Description'] },
    { 'init': ['Runs initial bundling'] },
    { '': ['By default bundler is run in watch mode'] },
);

const watchTable = new Table();

watchTable.push(
    { '[watch]': ['Description'] },
    { 'watch': ['Runs bundler in watch mode'] },
    { '': ['By default bundler is run in watch mode'] },
);

const skinnameTable = new Table();

skinnameTable.push(
    { '[skin-name]': ['Description'] },
    { 'skin-name': ['Runs bundling for specified skin only'] },
    { '': ['By default bundling runs for every found skin'] },
);

  
  module.exports = (args) => {
    const subCmd = args._[0] === 'help'
      ? args._[1]
      : args._[0]
    console.log(`npm run hebspack [env] [init] [watch] [skin-name]`)
    console.log(envTable.toString())
    console.log(initTable.toString())
    console.log(watchTable.toString())
    console.log(skinnameTable.toString())
  }
*/