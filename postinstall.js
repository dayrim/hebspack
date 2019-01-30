const addScript = require('./custom-gulp-plugins/add-script');

console.log("POST-install script")
addScript({key: "hebspack" , value: "hebspack" , force: true})