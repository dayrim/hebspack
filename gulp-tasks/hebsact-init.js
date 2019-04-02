const gulp = require("gulp");
const flatmap = require("gulp-flatmap");
const minimist = require("minimist");
const webpack = require("webpack");
const webpackStream = require("webpack-stream");
const print = require("gulp-print").default;
const colors = require("ansi-colors");
const path = require("path");
const configLoader = require("../common/config-loader");
const log = require("fancy-log");
const notifier = require("node-notifier");
const HtmlWebPackPlugin = require("html-webpack-plugin");


module.exports = function() {
  /* Set environment variable from cli flag*/

  const args = minimist(process.argv.slice(2));

  configLoader.loadSkin(args.skinpath);
  let webpackConfig = {};
  return (
    gulp
      .src(args.skinpath)

      /* Creates a stream for each skin */
      .pipe(
        flatmap(function(stream, skinDir) {
          return (
            gulp
              .src([
                `${skinDir.path}/**/${paths.src.sourceFolder}`,
                `!**/node_modules/**/*`,
                `!**/master/**/*`,
                `!**/${paths.dist.outputFolder}/**/*`
              ])

              /* Creates a stream for each scripts folder*/
              .pipe(
                flatmap(function(stream, dir) {
                  return gulp
                    .src(
                      [
                        `${dir.path}/**/index.js`,
                        `!${dir.path}/**/*${paths.src.ignoreSuffix}*`
                      ],
                      { allowEmpty: true }
                    )

                    .pipe(
                      print(
                        filepath =>
                          `Stream started for: ${colors.unstyle(
                            path.dirname(filepath)
                          )}/${colors.red(path.basename(filepath))}`
                      )
                    )

                    .pipe(
                      webpackStream(
                        Object.assign(webpackConfig, {
                          mode: "development",
                          output: {
                            path: (() =>
                              dir.path.replace(
                                new RegExp(`${paths.src.sourceFolder}`, "g"),
                                paths.dist.outputFolder
                              ))(),
                            filename: "[name].bundle.js",
                            publicPath: `${paths.dist.outputFolder}/`,
                            chunkFilename: "[name].bundle.js"
                          },
                          module: {
                            rules: [
                              {
                                test: /\.(js|jsx)$/,
                                loader: "babel-loader",
                                options: pluginOptions[args.env].script.babel
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
                        }),

                        webpack
                      )
                    )

                    .pipe(gulp.dest(file => file.base))
                    .pipe(
                      print(
                        filePath =>
                          `Finished '(${colors.cyan(
                            args.skindir
                          )}) stream for file:  ${colors.unstyle(
                            path.dirname(filePath)
                          )}/${colors.blue(path.basename(filePath))}'`
                      )
                    );
                })
              )
          );
        })
      )
      .on("end", function() {
        // const server = new WebpackDevServer(webpack, webpackConfig.devServer);
        const bundler = webpack(webpackConfig);
        // server.listen(8080, '127.0.0.1', () => {
        //   console.log('Starting server on http://localhost:8080');
        // });
        /*
        notifier.notify({
          title: "Hebspack",
          message: `Scripts bundled in ${args.skindir}`,
          icon: args.iconpath
        });
        */
      })
  );
};
