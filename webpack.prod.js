/********************************************************************
 *  WEBPACK PRODUCTION - Config that builds off of webpack.common.js
 *  to build production-ready distrobution.
 ********************************************************************/

const path = require("path");
const common = require("./webpack.common");
const merge = require("webpack-merge");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");    // This plugin extracts CSS into separate files. It creates a CSS file per JS file which contains CSS. It supports On-Demand-Loading of CSS and SourceMaps.
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");              // JS Minimizer - require when necessary to explicitly minify JS outside default 'minimizer' behavior
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');           // Copies individual files or entire directories to the build directory.
const WebappWebpackPlugin = require('webapp-webpack-plugin');       // automatically generate webapp manifest files along with 44 different icon formats as appropriate for iOS devices, Android devices, Windows Phone and various desktop browsers out of your single logo.png
const ManifestPlugin = require('webpack-manifest-plugin');          // For generating asset manifests 
const ProgressBarPlugin = require('progress-bar-webpack-plugin');   // Progress bar during build


module.exports = merge(common, {
  mode: "production",
  output: {                                                 // OUTPUT
    filename: "[name].[contentHash].bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  optimization: {
    minimizer: [                                            // 
      new OptimizeCssAssetsPlugin(),                        // CSS Optimize
      new TerserPlugin(),                                   // Must re-specify since default settings are overidden with OptimizeCssAssetsPlugin         
      new HtmlWebpackPlugin({                               // Must re-specify since default settings are overidden with OptimizeCssAssetsPlugin 
        template: "./src/index.html",                       // <-- Template HTML
        minify: {
          removeAttributeQuotes: true,
          collapseWhitespace: true,
          removeComments: true
        }
      })
    ]
  },

  plugins: [
    new MiniCssExtractPlugin({ filename: "[name].[contentHash].css" }),
    new ManifestPlugin({
        fileName: 'asset-manifest.json'
    }),
    new ProgressBarPlugin(),
    new CleanWebpackPlugin(),
    (new CopyWebpackPlugin([{                               // Copies individual files or entire directories to the build directory.
        from: './src/assets/images',
        to: './assets/images'
      }])),
    new WebappWebpackPlugin({
        logo: './src/assets/images/favicon.png',
        cache: true,
        prefix: 'favicons-[hash]/',
        // emitStats: true,
        // statsFilename: 'favicon-manifest.json',
        inject: true,
        favicons: {
          icons: {
            android: false,
            appleIcon: false,
            appleStartup: false,
            coast: false,
            favicons: true,
            firefox: false,
            windows: false,
            yandex: false
          }
        }
      })
  ],
  
  module: {
    rules: [
      {
        test: /\.scss$/,                                          // LOADER - SCSS
        use: [
          MiniCssExtractPlugin.loader,                            // 3. Extract css into files
          {
            loader: 'css-loader',                                 // 2. Turns css into commonjs
            options: {
              importLoaders: 1
            }
          },
          'postcss-loader',                                       // 1. Adds API for post css tools, like autoprefixer
          "sass-loader"                                           // 0. Turns scss into css
        ]
      },
      {
        test: /\.css$/,                                           // LOADER - CSS
        use: [
          MiniCssExtractPlugin.loader,                            // 3. Extract css into files
          {
            loader: 'css-loader',                                 // 2. Turns css into commonjs
            options: {
              importLoaders: 1
            }
          },
          'postcss-loader',                                       // 1. Adds API for post css tools, like autoprefixer
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|tif|tiff|bmp|svg)$/,           // LOADER = Images
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