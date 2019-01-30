
const fileSystem = require("fs");
const glob = require("glob");
const log = require("fancy-log");
const colors = require("ansi-colors");
const path = require("path");
/* Set global config*/
let globalConfig;

function load(skinDirectory) {
    let rawData;
    if (fileSystem.existsSync(`${skinDirectory}/hebspack-config.json`)) {
        rawData = fileSystem.readFileSync(
            `${skinDirectory}/hebspack-config.json`
        );
        globalConfig = JSON.parse(rawData);
        return ({ paths, constants, run, plugin,options } = globalConfig);
    }
    else {
        return false
    }
}

function create(skinPaths,source) {
    //log(`Config initiated from ${source} task in ${skinPaths}`)
    if (Array.isArray(skinPaths)) {
        if (skinPaths.length === 1) {
            skinPaths = glob.sync(skinPaths[0]);
            skinPaths.forEach(skinPath => {
                copyDefaultConfig(skinPath);
            });
        } else {
            skinPaths.forEach(skinPath => {
                copyDefaultConfig(skinPath);
            });
        }
    } else {
        skinPaths = glob.sync(skinPaths);
        skinPaths.forEach(skinPath => {
            copyDefaultConfig(skinPath);
        });
    }
}

function copyDefaultConfig(destinationPath) {
    let defaultConfig = `${path.join(
        __dirname,
        "../common/hebspack-config.json"
    )}`;

    if (!fileSystem.existsSync(`${destinationPath}/hebspack-config.json`)) {
        fileSystem.copyFileSync(
            defaultConfig,
            `${destinationPath}/${path.basename(defaultConfig)}`,
            err => {
                if (err) throw err;
            }
        );
        log(`Config created: ${destinationPath}/${colors.blue('hebspack-config.json')}`);
    }
}

module.exports = {
    load: load,
    create: create
};
