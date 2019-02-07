
'use strict';

var through = require('through');
var PluginError = require('plugin-error');
var path = require('path');
var Concat = require('concat-with-sourcemaps');

module.exports = function(options) {
    var filesMap = {};
    let mainFile;
    var concat;
    var isUsingSourceMaps = options.sourcemap;
    
    function bufferContents(file) {
        if (file.isNull()) { return; }
        if (file.isStream()) { return this.emit('error', new PluginError('gulp-concat-duplicates', 'Streaming not supported')); }

        var fullpath = path.resolve(file.path);

        if (filesMap[fullpath]) {

              concat = new Concat(isUsingSourceMaps, path.basename(file.path),'\n');

              concat.add(file.relative, file.contents, file.sourceMap);
              concat.add(filesMap[fullpath].relative, filesMap[fullpath].contents, filesMap[fullpath].sourceMap);

              filesMap[fullpath].contents = concat.content;

              if (concat.sourceMapping) {
                filesMap[fullpath].sourceMap = JSON.parse(concat.sourceMap);
              }

            return;
        } else {

            if(!mainFile)mainFile=file
            filesMap[fullpath] = file;
        }

    }

    function endStream() {
        let stream = this;
        Object.keys(filesMap).forEach(function(key) {

            stream.emit('data', filesMap[key]);
        });

        stream.emit('end');
    }

    return through(bufferContents, endStream);
};