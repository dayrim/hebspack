const path = require('path')
const addScript = require('./custom-gulp-plugins/add-script');
const configLoader = require('./common/config-loader');

addScript({key: "hebspack" , value: "hebspack" , force: true})
configLoader.loadHebspack(__dirname)
