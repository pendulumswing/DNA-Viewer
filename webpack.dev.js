/********************************************************************
 *  WEBPACK DEVELOPMENT - Config that builds off of webpack.common.js
 *  to build within a development environment. 
 ********************************************************************/

const path = require("path");
const common = require("./webpack.common");
const merge = require("webpack-merge");
var HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = merge(common, {
  mode: "development",                                  // OUTPUT
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  },

  plugins: [
    new HtmlWebpackPlugin({                             // PLUGIN - HtmlWebpackPlugin
      template: "index.html"                      // <-- Template HTML
    })
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          "style-loader",           // 3. Inject styles into DOM
          {
            loader: 'css-loader',   // 2. Turns css into commonjs
            options: {
              importLoaders: 1
            }
          },
          'postcss-loader',         // 1. Adds API for post css tools, like autoprefixer
          "sass-loader"             // 0. Turns sass into css
        ]
      },
      {
        test: /\.css$/,
        use: [
            "style-loader",           // 3. Inject styles into DOM
            {
              loader: 'css-loader',   // 2. Turns css into commonjs
              options: {
                importLoaders: 1
              }
            },
            'postcss-loader',         // 1. Adds API for post css tools, like autoprefixer
        ]
      }
    ]
  }
});