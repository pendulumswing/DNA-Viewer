/********************************************************************
 *  WEBPACK PRODUCTION - Config that builds off of webpack.common.js
 *  to build production-ready distrobution.
 ********************************************************************/

const path = require("path");
const common = require("./webpack.common");
const merge = require("webpack-merge");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");      // Require when necessary to explicitly minify JS outside default 'minimizer' behavior
const HtmlWebpackPlugin = require("html-webpack-plugin");

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
        template: "./src/index.html",                      // <-- Template HTML
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
    new CleanWebpackPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,                    // SCSS Loader
        use: [
          MiniCssExtractPlugin.loader,      // 3. Extract css into files
          {
            loader: 'css-loader',           // 2. Turns css into commonjs
            options: {
              importLoaders: 1
            }
          },
          'postcss-loader',                 // 1. Adds API for post css tools, like autoprefixer
          "sass-loader"                     // 0. Turns sass into css
        ]
      },
      {
        test: /\.css$/,                    // CSS Loader
        use: [
          MiniCssExtractPlugin.loader,      // 3. Extract css into files
          {
            loader: 'css-loader',           // 2. Turns css into commonjs
            options: {
              importLoaders: 1
            }
          },
          'postcss-loader',                 // 1. Adds API for post css tools, like autoprefixer
        ]
      }
    ]
  }
});