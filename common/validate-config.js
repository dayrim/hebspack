module.exports = function(paths, run, options) {
    if (
        paths.src.sourceFolder === "" ||
        !paths.src.sourceFolder
    ) {
        return 'Config error: Assets folder is required'
    }

    if (
        paths.src.styleFolder === "" ||
        !paths.src.styleFolder
    ) {
        return 'Config error: Style folder is required'
    }
    if (
        paths.src.styleFiles === "" ||
        !paths.src.styleFiles
    ) {
        return 'Config error: Style files to bundle is required'
    }
    else if(!paths.src.styleFiles.isArray()){
        return 'Config error: Style files needs to be an array'
    }
    if (
        paths.src.libFolder === "" ||
        !paths.src.libFolder
    ) {
        return 'Config error: Scripts lib folder is required'
    }

    if (
        paths.src.imagesFolder === "" ||
        !paths.src.imagesFolder
    ) {
        return 'Config error: Image folder is required'
    }

    if (
        paths.src.fontsFolder === "" ||
        !paths.src.fontsFolder
    ) {
        return 'Config error: Fonts folder is required'
    }

    if (
        paths.src.pluginsFolder === "" ||
        !paths.src.pluginsFolder
    ) {
        return 'Config error: Plugins folder is required'
    }

    if (
        paths.src.scriptsEntry === "" ||
        !paths.src.scriptsEntry
    ) {
        return 'Config error: Scripts entry file is required'
    }

    if (
        paths.dist.outputFolder === "" ||
        !paths.dist.outputFolder
    ) {
        return 'Config error: Destination assets folder is required'
    }
    if (
        paths.dist.styleFolder === "" ||
        !paths.dist.styleFolder
    ) {
        return 'Config error: Destination style folder is required'
    }
    if (
        paths.dist.scriptsFolder === "" ||
        !paths.dist.scriptsFolder
    ) {
        return 'Config error: Destination scripts folder is required'
    }
    if (
        paths.dist.outputScript === "" ||
        !paths.dist.outputScript
    ) {
        return 'Config error: Output script file name is required'
    }
    if (
        paths.dist.imagesFolder === "" ||
        !paths.dist.imagesFolder
    ) {
        return 'Config error: Destination images folder is required'
    }
    if (
        paths.dist.fontsFolder === "" ||
        !paths.dist.fontsFolder
    ) {
        return 'Config error: Destination fonts folder is required'
    }
    return false
}