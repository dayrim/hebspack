#!/usr/bin/env node
const program = require('commander'); 
const appRoot = require('app-root-path');
const path = require("path");
const log = require('fancy-log');
const colors = require('ansi-colors');
const shell = require("shelljs");
const { version } = require('./package.json')
const fileSystem = require('fs');

let gulpFile=path.join(__dirname, './skinsWatch.js')
let gulpCommand =`./node_modules/.bin/gulp skinsWatch  --gulpfile ${gulpFile} --cwd ${appRoot} --color=always`;
let skins;
program
  .version(`Hebspack version:  ${colors.magenta(version)}`)
  .usage('[skin] [options]')
  .arguments('[skin]')
  .action(function (skin) {
   skins = skin;
  })
  .option('-s, --serve', 'Start dev server', serveOption)
  .option('-v, --version', 'Hebspack version')
  .option('-b, --browsersync [port]', 'Start browsersync, optionaly specify port number of a proxied server', syncOptions)
  .parse(process.argv);

if (skins) {
  gulpCommand = `${gulpCommand} --skins=${skins}`
}
else{
  let packageJson;
  if (fileSystem.existsSync(`${appRoot.path}/package.json`)) {
    packageJson = JSON.parse(fileSystem.readFileSync(`${appRoot.path}/package.json` )); 
    if(packageJson.hebspackconfig && packageJson.hebspackconfig.skins){
      gulpCommand = `${gulpCommand} --skins=${packageJson.hebspackconfig.skins}`
    }
  }
}

function syncOptions(port){
  port=parseInt(port)
  if(!port){
    throw new Error('Option --browsersync [port] requires port to be a number');
  }
  gulpCommand = `${gulpCommand} --browsersync=${port}`
  return port
}

function serveOption(){
  gulpCommand = `${gulpCommand} --serve`
}

if(program.browsersync === true){
  port = `80`
  gulpCommand = `${gulpCommand} --browsersync=${port}`
}

log(`Hebspack version:  ${colors.magenta(version)}`)
log(`Running executable: ${colors.grey(gulpCommand)}`)

shell.exec(gulpCommand)


