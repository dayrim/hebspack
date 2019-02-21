
const fileSystem = require("fs");
const glob = require("glob");
const log = require("fancy-log");
const colors = require("ansi-colors");
const path = require("path");
/* Set global config*/
let globalSkinConfig;
let globalHebsConfig;

function loadSkin(skinDirectory) {
    let rawData;
    if (fileSystem.existsSync(`${skinDirectory}/hebspack-config.json`)) {
        rawData = fileSystem.readFileSync(
            `${skinDirectory}/hebspack-config.json`
        );
        globalSkinConfig = JSON.parse(rawData);
        return ({ paths, run ,options } = globalSkinConfig);
    }
    else {
        return false
    }
}

function loadHebspack(packageJsonDir) {
    if (!(packageJsonDir.slice(-1) == `/`)) {
        packageJsonDir = `${packageJsonDir}/`
    }
    let rawData;
    if (fileSystem.existsSync(`${packageJsonDir}/package.json`)) {
        rawData = fileSystem.readFileSync(
            `${packageJsonDir}/package.json`
        );
        globalHebsConfig = JSON.parse(rawData); 
        if(!globalHebsConfig.hebspackconfig){
           
            return ({hebspackconfig} = {hebspackconfig: {skinspath: packageJsonDir}});
        }
        else{
            if(!globalHebsConfig.hebspackconfig.skinspath){
                globalHebsConfig.hebspackconfig.skinspath=packageJsonDir;
            }else{
                if (!(globalHebsConfig.hebspackconfig.skinspath.slice(-1) == `/`)) {
                    globalHebsConfig.hebspackconfig.skinspath = `${globalHebsConfig.hebspackconfig.skinspath}/`
                }
            }

            return ({hebspackconfig}=globalHebsConfig);
        }
     
    }
    else {
        return false
    }
}

function create(skinPaths,source) {

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
    loadSkin: loadSkin,
    loadHebspack: loadHebspack,
    create: create
};
