const gulp = require('gulp');
const flatmap = require('gulp-flatmap');
const minimist = require("minimist");
const assetsJson = require('../custom-gulp-plugins/assets-json');
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const print = require('gulp-print').default;
const minimatch = require("minimatch")
const colors = require('ansi-colors');
const path = require("path")
const order = require('gulp-order');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const configLoader = require('../common/config-loader');
const log = require('fancy-log');
const notifier = require('node-notifier');
const babel = require('gulp-babel');
const tap = require('gulp-tap')
const { spawn } = require('child_process');
const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = function() {

    /* Set environment variable from cli flag*/
    let env;
    const args = minimist(process.argv.slice(2));
    
    switch (args.env) {
        case "default":
            env = "default"
            break;
    
        case "development":
            env = "development"
            break;
    
        case "production":
            env = "production"
            break;
    
        default:
            env = "default"
            break;
    }
        configLoader.loadSkin(args.skinpath)
        
        return gulp.src(args.skinpath)
    
            /* Creates a stream for each skin */
            .pipe(flatmap(function(stream, skinDir) {
              
    
                return gulp.src([`${skinDir.path}/**/${paths.src.sourceFolder}`, `!**/node_modules/**/*`, `!**/master/**/*`, `!**/${paths.dist.outputFolder}/**/*`])
    
                    /* Creates a stream for each scripts folder*/
                    .pipe(flatmap(function(stream, dir) {

                    return gulp.src([`${dir.path}/**/index.js`,`!${dir.path}/**/*${paths.src.ignoreSuffix}*`],{allowEmpty: true })

                        .pipe(print(filepath => `Stream started for: ${colors.unstyle(path.dirname(filepath))}/${colors.red(path.basename(filepath))}`))
                        
                        .pipe(webpackStream({
                          mode: 'development',
                            output: {
                              path: (()=>dir.path.replace(new RegExp(`${paths.src.sourceFolder}`, 'g'), paths.dist.outputFolder))(),
                              filename: '[name].bundle.js',
                              publicPath: `${paths.dist.outputFolder}/`,
                              chunkFilename: '[name].bundle.js'
                            },
                            module: {
                              rules: [
                                {
                                  test: /\.(js|jsx)$/,
                                  loader: 'babel-loader',
                                  
                                },
                                {
                                  test: /\.html$/,
                                  use: [
                                    {
                                      loader: "html-loader"
                                    }
                                  ]
                                }
                              ]
                            },
                          plugins: [
                            new HtmlWebPackPlugin({
                              template: `${dir.path}/index.html`,
                              filename: "./index.html"
                            })
                          ]
                            // optimization: {
                            //   namedModules: true,
                            //       splitChunks: {
                            //           chunks: 'all',
                  
                            //       }
                            //   },
                            // ,


                            // optimization: {
                            //   splitChunks: {
                            //     chunks: 'all',
                            //   },
                            // },
                            /* 
                            ,
                            externals: {
                              jquery: 'jQuery'
                            }
                            */
                          }))

                        .pipe(gulp.dest(file=>file.base))
                        .pipe(print(filePath => `Finished '(${colors.cyan(args.skindir)}) stream for file:  ${colors.unstyle(path.dirname(filePath))}/${colors.blue(path.basename(filePath))}'`))
        
    
                    }))
            }))
            .on('end', function() {
    
              
                notifier.notify({
                    title: 'Hebspack',
                    message: `Scripts bundled in ${args.skindir}`,
                    icon: args.iconpath,
                });
    
            })
    }




// module.exports = 

// function() {
//     /* Set environment variable from cli flag*/
//     let env;
//     const args = minimist(process.argv.slice(2));
    
//     switch (args.env) {
//         case "default":
//             env = "default"
//             break;
    
//         case "development":
//             env = "development"
//             break;
    
//         case "production":
//             env = "production"
//             break;
    
//         default:
//             env = "default"
//             break;
//     }

//     configLoader.loadSkin(args.skinpath)


//   return new Promise(resolve => webpack({

//     entry: `${args.skinpath}/assets/scripts.js`,
//     output: {
//         filename: `scripts.min.js`,
//         path:  `${args.skinpath}/dist/`,
//     },
//     module: {
//         rules: [
//           {
//             test: /\.(js)$/,
//             loader: 'babel-loader',
//             // options: {
//             //   presets: [ 
//             //     [ "@babel/preset-env", {
//             //       useBuiltIns: 'entry',
//             //       modules: "auto"
//             //     }]
//             //   ],
//             //   plugins: ['syntax-dynamic-import']
//             // }
//           }
//         ]
//       },

//   }, (err, stats) => {

//       if (err) console.log('Webpack', err)

//       console.log(stats.toString({ /* stats options */ }))

//       resolve()

//   }))
// } 

