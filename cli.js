const minimist = require("minimist");

module.exports = () => {
  const args = minimist(process.argv.slice(2));

  if(args._.includes('help') || args._.includes('h'))
  {
    require("./cmds/help")(args);
  }
  else if(args._.includes('version') || args._.includes('v'))
  {
    require("./cmds/version")(args);
  }
  else{
    if(args._.includes('default'))
    {
      require("./cmds/default")(args);
    }
    else if(args._.includes('productiom'))
    {
      require("./cmds/productiom")(args);
    }
    else if(args._.includes('development'))
    {
      require("./cmds/development")(args);
    }
    else{
      require("./cmds/default")(args);
    }
  }

};
