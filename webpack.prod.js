/********************************************************************
 *  WEBPACK PRODUCTION - Config that builds off of webpack.common.js
 *  to build production-ready distrobution.
 ********************************************************************/

const path = require("path");
const common = require("./webpack.common");
const { merge } = require("webpack-merge");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");    // This plugin extracts CSS into separate files. It creates a CSS file per JS file which contains CSS. It supports On-Demand-Loading of CSS and SourceMaps.
// const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");              // JS Minimizer - require when necessary to explicitly minify JS outside default 'minimizer' behavior
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');           // Copies individual files or entire directories to the build directory.
// const WebappWebpackPlugin = require('webapp-webpack-plugin');       // automatically generate webapp manifest files along with 44 different icon formats as appropriate for iOS devices, Android devices, Windows Phone and various desktop browsers out of your single logo.png
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');          // For generating asset manifests
const ProgressBarPlugin = require('progress-bar-webpack-plugin');   // Progress bar during build
const { BaseHrefWebpackPlugin } = require('base-href-webpack-plugin');  // Extension for html-webpack-plugin to programmatically insert or update <base href="" /> tag.


module.exports = merge(common, {                            // Will merge this config to the 'common' config
  mode: "production",
  output: {                                                 // JS OUTPUT FILENAME
    filename: "bundle.[name].[contentHash].js",
    path: path.resolve(__dirname, "dist")
  },
  optimization: {
    minimizer: [                                            //
      // new OptimizeCssAssetsPlugin(),                        // CSS Optimize
      new CssMinimizerPlugin(),
      new TerserPlugin(),                                   // Must re-specify since default settings are overidden with OptimizeCssAssetsPlugin
      new HtmlWebpackPlugin({                               // Must re-specify since default settings are overidden with OptimizeCssAssetsPlugin
        template: "./src/index.html",                       // <-- Template HTML
        // inject: 'body',
        minify: {
          removeAttributeQuotes: true,
          collapseWhitespace: true,
          removeComments: true
        }
      }),
      new BaseHrefWebpackPlugin({
        baseHref: '/'
      })
    ],
    splitChunks: {
      chunks: 'all'
    }
  },

  plugins: [
    new WebpackManifestPlugin({
      fileName: 'asset-manifest.json'
    }),
    new ProgressBarPlugin(),
    new MiniCssExtractPlugin({
      filename: "styles.[name].[contentHash].css",          // CSS OUTPUT FILENAME
      chunkFilename: 'styles.[id].css',
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({                                // Copies individual files or entire directories to the build directory.
      patterns: [
          {from: './src/assets/images', to: './assets/images'  }
      ]
    }),
    // new WebappWebpackPlugin({                               // Favicon
    //   logo: './src/assets/images/favicon.png',
    //   cache: true,
    //   prefix: 'favicons-[hash]/',
    //   // emitStats: true,
    //   // statsFilename: 'favicon-manifest.json',
    //   inject: true,
    //   favicons: {
    //     icons: {
    //       android: false,
    //       appleIcon: false,
    //       appleStartup: false,
    //       coast: false,
    //       favicons: true,
    //       firefox: false,
    //       windows: false,
    //       yandex: false
    //     }
    //   }
    // })
  ],

  module: {
    rules: [
      {
        test: /\.scss$/,                                          // LOADER - SCSS
        use: [
          MiniCssExtractPlugin.loader,                                // 3. Extract css into files
          {
            loader: 'css-loader',                                     // 2. Turns css into commonjs
            options: {
              importLoaders: 1
            }
          },
          'postcss-loader',                                           // 1. Adds API for post css tools, like autoprefixer
          "sass-loader"                                               // 0. Turns scss into css
        ]
      },
      {
        test: /\.css$/,                                           // LOADER - CSS
        use: [
          MiniCssExtractPlugin.loader,                                // 3. Extract css into files
          {
            loader: 'css-loader',                                     // 2. Turns css into commonjs
            options: {
              importLoaders: 1,
            }
          },
          'postcss-loader',                                           // 1. Adds API for post css tools, like autoprefixer
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|tif|tiff|bmp|svg)$/,           // LOADER - Images
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            name: ('./src/assets/images/[name].[hash:8].[ext]',
            './src/assets/images/[name].[ext]')
          }
        }
      },
      {
        test: /\.(ttf|otf|eot|woff(2)?)(\?[a-z0-9]+)?$/,          // LOADER - Fonts
        use: {
          loader: 'file-loader',
          options: {
            name: (
              './src/assets/fonts/[name].[hash:8].[ext]',
              './src/assets/fonts/[name].[ext]'
            )
          }
        }
      }
    ]
  }
});
