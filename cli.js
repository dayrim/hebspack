const minimist = require("minimist");

module.exports = () => {
  const args = minimist(process.argv.slice(2));


  let cmd = args._[0] || "help";
  if (args.version || args.v) {
    cmd = "version";
  }

  if (args.help || args.h) {
    cmd = "help";
  }

  switch (cmd) {
    case "version":

      require("./cmds/version")(args);
      break;

    case "help":
      require("./cmds/help")(args);
      break;

    case "default":
      require("./cmds/default")(args);
      break;

    case "development":
      require("./cmds/development")(args);
      break;

    case "production":
      require("./cmds/production")(args);
      break;

    default:
      console.error(`"${cmd}" is not a valid command!`);
      break;
  }
};
