

<p align="center">
    <img src="./favicon.png" >
</p>
Hebspack is a gulp-based cli tool to bundle skin files for web development and distribution.

## Installation

Hebspack is meant to be used on a folder containing skins. Hebspack only bundles skins that have configured 'hebspack-config.json' in root directory.

#### Installation steps:

Assuming you have [Node](https://nodejs.org/en/) version 11 or later installed. 

- Run this command inside a folder containing skins. If skins are located inside a different folder then you need to specify which one.

```bash
npm init
```
This will generate 'package.json' file. Default options are fine.

- Then run this command to download and install hebspack package
```bash
npm install hebspack
```
This will download and install all dependencies.

- *Optionaly*. 
Change curent skins folder by adding 'skinpath' field in in 'package.json' file. Example:
```json
{
  "name": "skins",
  "version": "1.0.0",
  ...
  "hebspackconfig":{
    "skinsath": "/Users/admin/sites/cms/public/skins/"
  }
}
```

- *Optionaly*. 
Set list of projects to bundle by adding 'skins' field in in 'package.json' file. Example:
```json
{
  "name": "skins",
  "version": "1.0.0",
  ...
  "hebspackconfig":{
    "skins": ["skin-innatonu","skin-aka","skin-viceroy"]
  }
}
```
#### Migrating from Code Kit:

- Run the following command changing 'skin-name' to name of skin folder.
```bash
npx hebspack skin-name
```
This will generate default config file and execute initial build. 

- Replace the following code inside root .tpl file.
```php
<style>
    {inline_css path="assets/desktop/styles/initial/styles.min.css" paths_to_replace=['../fonts/' => 'assets/desktop/fonts/', '../images/' => 'assets/desktop/images/']}
</style>
```
With this code. 
```php
{asset_loader position="head" paths_to_replace=['../fonts/' => 'dist/desktop/fonts/', '../images/' => 'dist/desktop/images/'] manifest="dist/desktop/assets.manifest.json"}
```
This will load inline files that are listed in json manifest. Paths_to_replace are paths inside inline css that has to be replaced in order for the links to work relative to root directory. 

- Replace the following line inside root .tpl file.
```php
{block name="assets"}
    <link rel="stylesheet" href="{asset path="assets/desktop/styles/styles.min.css" cdn=false}" async defer>
    <script src="{asset path="assets/desktop/scripts/scripts.min.js" cdn=false}"></script>
{/block}
```
With this code. 
```php
{block name="assets"}
    {asset_loader position="body" manifest="dist/desktop/assets.manifest.json"}
{/block}
```
This will load inline files that are listed in json manifest. 

- Copy @codekit-prepend file names from "scripts.js" or similiar entry point. 
```js
// @codekit-prepend "libraries/_jquery.js", "libraries/_jquery.ui.js", "libraries/_cookie.js", "libraries/_json.js", "libraries/_what-input.min.js", "libraries/_validation.js", "libraries/_validation-en.js", "libraries/_hebs.bp.js", "libraries/_swiper.js", "libraries/_galleria.js", "_variables.js", "_polyfills.js", "_ada.js";
```

Paste these file names in 'hebspack-config.json' replacing 'libFiles' array elements to ensure the order of script loading is correct. 
```js
...
"libFiles":[  
    "_jquery.js", "_jquery.ui.js", "_cookie.js", "_json.js", "_what-input.min.js", "_validation.js", "_validation-en.js", "_hebs.bp.js", "_swiper.js", "_galleria.js", "_variables.js", "_polyfills.js", "_ada.js"
],
...
```
This will load specified files in the order they are given and then every other file in library folder.

- Copy @codekit-append file names from "scripts.js" or similiar entry point. 
```js
// @codekit-append "_common.js", "_booking.js", "_photos.js", "_promotiles.js", "_events.js", "_reviews.js", "_google-maps.js", "_maps.js", "_poi.js", "_galleries.js", "_pressroom.js", "_rooms.js", "_venues.js", "_feeds.js", "_calendar.js";
```
Paste these file names in 'hebspack-config.json' replacing 'scriptsFiles' array elements to ensure the order of script loading is correct. 
```js
...
"scriptsFiles":[  
    "_common.js", "_booking.js", "_photos.js", "_promotiles.js", "_events.js", "_reviews.js", "_google-maps.js", "_maps.js", "_poi.js", "_galleries.js", "_pressroom.js", "_rooms.js", "_venues.js", "_feeds.js", "_calendar.js"
],
...
```
This will load specified files in the order they are given and then every other file in scripts folder.

## Bundler commands

```bash
npx hebspack [skin-name] [options]
```

#### [skin-name]

| [skin-name]        | Description           |
| ------------- |:-------------:| 
| skin-name | Runs bundling for specified skin only | 
|      | By default bundling runs for every found skin | 

#### [options]

| [options]        | Description           |
| ------------- |:-------------:| 
| -b, -browsersync | Start browsersync |   


## Examples

```bash
npx hebspack
```
This will run bundler for every skin that contains 'hebspack-config.json'.

```bash
npx hebspack skin-name -b
```
This will run bundler for a skin, which name is "skin-name" and start browsersync.

## Custom Task Declaration

Custom task creation steps:

- Create a folder called 'gulp-tasks' inside a skin folder.

- Create 'task-name.js' inside 'gulp-tasks' folder changing the name to suit your task.

- Modify 'taskSeries' field in 'hebspack-config.json' by adding 'task-name' to a new of existing series.
```js
...
    "taskSeries":[
        {
        ...
        "slug": "newSeries",
            "tasks":[ "task-name"]
        },
        }
    ]
...
```

- Declare a task inside 'task-name.js' choosing one of the following methods:

#### Callback

You can provide a callback parameter to your task’s function and then call it when the task is complete:
```js
const del = require('del');

module.exports = function(done) {
    del(['.build/'], done);
});
```

#### Return a Stream

You can also return a stream, usually made via gulp.src or even by using the vinyl-source-stream package directly. This will likely be the most common way of doing things.
```js
const del = require('del');

module.exports = function() {
    return gulp.src('client/**/*.js')
        .pipe(minify())
        .pipe(gulp.dest('build'));
});
```

#### Return a Promise

Return a promise and Gulp will know when it’s finished:
```js
const promisedDel = require('promised-del');

module.exports = function() {
    return promisedDel(['.build/']);
});
```

#### Return a Child Process

You can spawn child processes and just return them as well!
 ```js
const spawn = require('child_process').spawn;

module.exports = function() {
    return spawn('rm', ['-rf', path.join(__dirname, 'build')]);
});
```

#### Return a RxJS observable

It's also possible to return an RxJS observable.
 ```js
const Observable = require('rx').Observable;

module.exports = function() {
    return Observable.return(42);
});
```

## Default config walkthrough

```js
{
   /*General settings*/
   },
   "generalOptions":{
      /*Bundler environment mode*/    
      "environment": "production",
      /*Defines bundler task series to run*/    
      "taskSeries":[
         {
            "slug": "init",
            "tasks":[ "style-init","script-init","image-init","font-init","php-plugins-init"]
         },
         {
            "slug": "watch",
            "tasks":[ "style-watch","script-watch","image-watch","font-watch","php-plugins-watch"]
         }
      ]
   },
    /*Source and destination folder/file names*/
    "paths": {
        /*Source folder and file names*/
        "src": {
            /*Folder containing project assets*/
            "sourceFolder": "assets",
            /*Folder containing project styles*/
            "styleFolder": "styles",
            /*Main style files to be bundled separately*/
            "styleFiles": [
                "promotiles.scss",
                "styles.scss",
                "test.scss",
                "initial/styles.scss"
            ],
            /*Folder containing project scripts*/
            "scriptsFolder": "scripts",
            /*Folder containing styles destinated for inline usage*/
            "inlineStyleFolder": "initial",
            /*Specifies order for Javascript library files*/
            "libFiles": [
                "_jquery.js",
                "_jquery.ui.js",
                "_cookie.js",
                "_json.js",
                "_what-input.min.js",
                "_validation.js",
                "_validation-en.js",
                "_hebs.bp.js",
                "_swiper.js",
                "_galleria.js",
                "_variables.js",
                "_polyfills.js",
                "_ada.js"
            ],
            /*Javascript library folder*/
            "libFolder": "libraries",
            /*Main Javascript files*/
            "scriptsEntry": "scripts.js",
            /*Specifies order for Javascript files*/
            "scriptsFiles": [
                "_common.js",
                "_booking.js",
                "_photos.js",
                "_promotiles.js",
                "_events.js",
                "_reviews.js",
                "_google-maps.js",
                "_maps.js",
                "_poi.js",
                "_galleries.js",
                "_pressroom.js",
                "_rooms.js",
                "_feeds.js",
                "_calendar.js"
            ],
            /*Ignores all Javascript files with specified suffix*/
            "ignoreSuffix": "scripts.min.js",
            /*Folder containing project images*/
            "imagesFolder": "images",
            /*Folder containing project fonts*/
            "fontsFolder": "fonts",
            /*Folder containing project plugins*/
            "pluginsFolder": "plugins"
        },
        /*Destination folder and file names*/
        "dist": {
            /*Destination folder for bundling*/
            "outputFolder": "dist",
            /*Destination style folder*/
            "styleFolder": "styles",
            /*Destination scripts folder*/
            "scriptsFolder": "scripts",
            /*Name for a single Javascript file output*/
            "outputScript": "scripts.min.js",
            /*Destination images folder*/
            "imagesFolder": "images",
            /*Destination fonts folder*/
            "fontsFolder": "fonts"
        }
    },
    /*Specifies tasks and plugins to run*/
    "run": {
        /*Settings for default environment*/
        "default": {
            /*Script plugins*/
            "script": {
                "sourcemaps": false,
                "uglify": false,
                "stripDebug": false,
                "babel": false
            },
            /*Style plugins*/
            "style": {
                "sourcemaps": false,
                "autoprefixer": false,
                "extractMedia": false,
                "cleanCSS": false
            }
        },
        /*Settings for development environment*/
        "development": {
            /*Script plugins*/
            "script": {
                "sourcemaps": false,
                "uglify": false,
                "stripDebug": false,
                "babel": false 
            },
            /*Style plugins*/
            "style": {
                "sourcemaps": false,
                "extractMedia": true,
                "cleanCSS": false,
                "autoprefixer": false
            }
        },
        /*Settings for production environment*/
        "production": {
            /*Script plugins*/
            "script": {
                "sourcemaps": true,
                "uglify": true,
                "stripDebug": true,
                "babel": false
            },
            /*Style plugins*/
            "style": {
                "sourcemaps": true,
                "extractMedia": false,
                "cleanCSS": true,
                "autoprefixer": true
            }
        }
    },
    /*Plugins options*/
    "pluginOptions": {
        /*Settings for default environment*/
        "default": {
            /*Script plugins options*/
            "script": {
                /*Allowed extensions*/
                "extensions": [".js"],
                "uglify": {
                    "mangle": false,
                    "compress": false
                },
                "babel":{
                "presets": ["@babel/env"],
                "sourceType": "script",
                "compact": false
                }
            },
            /*Style plugins options*/
            "style": {
                /*Allowed extensions*/
                "extensions": [".scss"],
                "cleanCSS": {
                    "sourcemaps": true,
                    "level": {
                        "1": {
                            "removeQuotes": false
                        },
                        "2": {

                        }
                    },
                    "compatibility": {
                        "properties": {
                            "urlQuotes": true
                        }
                    }
                },
                "autoprefixer": {
                    "browsers": [
                        "last 2 versions"
                    ],
                    "cascade": false
                }
            },
            "php_plugin": {
                /*Allowed extensions*/
                "extensions": [".php"]
            },
            "image": {
                /*Allowed extensions*/
                "extensions": [".gif", ".png", ".jpg", ".jpeg", ".ai", ".svg", ".psd"]
            },
            "fonts": {
                /*Allowed extensions*/
                "extensions": [".woff", ".woff2", ".ttf", ".eot", ".svg"]
            }
        },
        /*Settings for development environment*/
        "development": {
            /*Script plugins options*/
            "script": {
                "extensions": [".js"],
                "uglify": {
                    "mangle": false,
                    "compress": false
                },
                "babel":{
                "presets": ["@babel/env"],
                "sourceType": "script",
                "compact": false
                }
            },
            /*Style plugins options*/
            "style": {
                "extensions": [".scss"],
                "cleanCSS": {
                    "sourcemaps": true,
                    "level": {
                        "1": {
                            "removeQuotes": false
                        },
                        "2": {}
                    },
                    "compatibility": {
                        "properties": {
                            "urlQuotes": true
                        }
                    }
                },
                "autoprefixer": {
                    "browsers": [
                        "last 2 versions"
                    ],
                    "cascade": false
                }
            },
            "image": {
                /*Allowed extensions*/
                "extensions": [".gif", ".png", ".jpg", ".jpeg", ".ai", ".svg", ".psd"]
            },
            "font": {
                /*Allowed extensions*/
                "extensions": [".woff", ".woff2", ".ttf", ".eot", ".svg"]
            },
            "php_plugin": {
                /*Allowed extensions*/
                "extensions": [".php"]
            }
        },
        /*Settings for production environment*/
        "production": {
            /*Script plugins options*/
            "script": {
                "extensions": [".js"],
                "uglify": {
                    "mangle": false,
                    "compress": false
                },
                "babel":{
                "presets": ["@babel/env"],
                "sourceType": "script",
                "compact": false
                }
            },
            /*Style plugins options*/
            "style": {
                /*Allowed extensions*/
                "extensions": [".scss"],
                "cleanCSS": {
                    "sourcemaps": true,
                    "level": {
                        "1": {
                            "removeQuotes": false
                        }
                    },
                    "compatibility": {
                        "properties": {
                            "urlQuotes": true
                        }
                    }
                },
                "autoprefixer": {
                    "browsers": [
                        "last 2 versions"
                    ],
                    "cascade": false
                }
            },
            "image": {
                /*Allowed extensions*/
                "extensions": [".gif", ".png", ".jpg", ".jpeg", ".ai", ".svg", ".psd"]
            },
            "font": {
                /*Allowed extensions*/
                "extensions": [".woff", ".woff2", ".ttf", ".eot", ".svg"]
            },
            "php_plugin": {
                /*Allowed extensions*/
                "extensions": [".php"]
            }
        }
    }
}
```

