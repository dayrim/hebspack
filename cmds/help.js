
const menus = {
    main: `
      hebspack [command]
  
      version ............ show package version
      help ............... show help menu for a command
      default ............ run default gulp environment in watch mode
      development ........ run development gulp environment in watch mode
      production ......... run production gulp environment in watch mode
      default init ....... run default gulp environment in initial mode
      development init ... run development gulp environment in initial mode
      production init .... run production gulp environment in initial mode

      Visit https://www.npmjs.com/package/hebspack for a complete guide.
      `
  }
  
  module.exports = (args) => {
    const subCmd = args._[0] === 'help'
      ? args._[1]
      : args._[0]
    console.log(menus[subCmd] || menus.main)
  }