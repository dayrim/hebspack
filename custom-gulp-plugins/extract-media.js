var through = require('through2');
var rework = require('rework');
var split = require('rework-split-media');
var reworkMoveMedia = require('rework-move-media');
var stringify = require('css-stringify');
var cleanUpString = require('clean-up-string');
var pathjoin = require('path').join;
var dirname = require('path').dirname;
var log = require('fancy-log')
var path = require('path')



function extractMedia(options) {
	return through.obj(function(file, enc, callback) {
		let stream = this;
		options.pathIgnored(file.path)
		if (file.isNull()) { return; }
		if (file.isStream()) { return this.emit('error', new PluginError('gulp-extract', 'Streaming not supported')); }
		let skipExecution = false;
		options.ignoreFiles.forEach(ignored => {

			if (options.pathIgnored(file.path,ignored)){

				skipExecution = true
			}
		})
		if(!skipExecution){
			
			var reworkData = rework(file.contents.toString())
				.use(reworkMoveMedia());
			stylesheets = split(reworkData);
			var stylesheetKeys = Object.keys(stylesheets);
	
			stylesheetKeys.forEach(function(key) {
				var name = cleanUpString(key);
				var poop=file.clone({
					contents: false
				});
	
	
				if (name) {
					var filepath = pathjoin(dirname(file.path), 'media-'+ name + '.css');
					poop.path = filepath;
				} else {
					poop.path = file.path;
				}
	
	
					var contents = stringify(stylesheets[key]);
					poop.contents = Buffer.from(contents)
		
				poop.media = key
				stream.push(poop);
			});
		}
		else{
			stream.push(file);
		}

		callback();
  });
}

module.exports = extractMedia