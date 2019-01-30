

// Requirements
var map = require('map-stream');
var fs = require('fs');
var path = require('path');
var log = require('fancy-log');


// Helper function
function errorMessage(message){
     log('gulp-asset-manifest', message);
}

function checkManifestFile(filename) {
    // Check if manifest file exists
    return fs.existsSync(filename);
}

function readManifestFile(filename) {
    // Read data from manifest file
    if(checkManifestFile(filename)){
        return fs.readFileSync(filename, 'utf8');
    }
    else{
        resetManifestFile(filename)
    }
}

function writeManifestFile(data, manifestFile) {
    // Write data to manifest file


    if (!fs.existsSync(path.dirname(manifestFile))){

        fs.mkdirSync(path.dirname(manifestFile), { recursive: true });

    }

    fs.writeFileSync(manifestFile, JSON.stringify(data));
    
}

function resetManifestFile(manifestFile) {
    // Check if manifest file exists
    var doesFileExist = checkManifestFile(manifestFile);
    var fileList = {};
    var filePositions = ["head","body"]

    filePositions.forEach(position => {
        fileList[position] = [];
    })

    if(doesFileExist){fs.truncateSync(manifestFile, 0)}
    writeManifestFile(fileList, manifestFile);

}


// Plugin function
function assetsJson(options, sectionFunction) {

    let fileList;
    let filePositions = ["head","body"]

    // Prepare options
    options = options || {};
    
    options.manifestFile = `${options.manifestPath}/${options.manifestFile}` || 'assets_manifest.json';


    // Reset asset file
    if(options.resetManifest){resetManifestFile(options.manifestFile);}

    // Process files
    return map(function(file, callback) {


        // Let empty files pass
        if (file.isNull()) {
            return callback(null, file);
        }

        // Emit error for streams
        if (file.isStream()) {
            errorMessage('Streams are not supported');
        }

        // Read asset file contents
        var contents = readManifestFile(options.manifestFile);

        // Copy data into file list
        fileList = contents ? JSON.parse(contents) : {};



        filePositions.forEach(position => {
            if (!fileList[position]){
                fileList[position] = [];
            }
        })
        // Add fileObject to fileList

        let fileObject
        if(options.makeFileObject){
             fileObject = options.makeFileObject(file.path,file.media)
        }
  
     
        if(fileObject){
            filePositions.forEach(position => {
                if (fileObject.position == position){
                    let fileObjectExists = fileList[position].reduce((searchResult, existingFile)=>{
                        if(existingFile.path == fileObject.path){

                            return searchResult || true
                        }
                        else{
                            return searchResult || false
                        }
                    },false)
                    
                    if(!fileObjectExists){
                        fileList[position].push(fileObject);
                        delete fileObject.position;
                    }
                }
            })
            writeManifestFile(fileList, options.manifestFile);

    
        }


        // Write list to asset file

        callback(null, file);
    });
};
module.exports = assetsJson;