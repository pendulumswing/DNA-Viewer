/********************************************************************
 *  WEBPACK DEVELOPMENT - Config that builds off of webpack.common.js
 *  to build within a development environment. 
 ********************************************************************/

const path = require("path");
const common = require("./webpack.common");
const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = merge(common, {
  mode: "development",                                  // OUTPUT
  output: {
    filename: "bundle.[name].js",
    path: path.resolve(__dirname, "dist")
  },

  plugins: [
    new HtmlWebpackPlugin({                             // PLUGIN - HtmlWebpackPlugin
      template: "./src/index.html"                      // <-- Template HTML
    })
  ],  

  module: {
    rules: [
      {
        test: /\.scss$/,                                // LOADER - SCSS
        use: [
          "style-loader",                                   // 3. Inject styles into DOM
          {
            loader: 'css-loader',                           // 2. Turns css into commonjs
            options: {
              importLoaders: 1
            }
          },
          'postcss-loader',                                 // 1. Adds API for post css tools, like autoprefixer
          "sass-loader"                                     // 0. Turns scss into css
        ]
      },
      {
        test: /\.css$/,                                 // LOADER - CSS
        use: [
          "style-loader",                                 // 3. Inject styles into DOM
          {
            loader: 'css-loader',                         // 2. Turns css into commonjs
            options: {
              importLoaders: 1
            }
          },
          'postcss-loader',                               // 1. Adds API for post css tools, like autoprefixer
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|tif|tiff|bmp|svg)$/, // LOADER - Image
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            name: "[name].[hash].[ext]"
          }
        }
      }
    ]
  },
  // devServer: {                 // Overriding port number will not load favicon. 
  //   // https: false,
  //   // host: 'localhost',
  //   port: 3000,
  //   // key: key ? fs.readFileSync(env.key) : '',
  //   // cert: env.cert ? fs.readFileSync(env.cert) : '',
  //   historyApiFallback: {
  //     // index: `index.html`,
  //     rewrites: [
  //       { from: /favicon.png/, to: '[imgs/favicon.png]' }
  //     ]
  //   }
  // }
});