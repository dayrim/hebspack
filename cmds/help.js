
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