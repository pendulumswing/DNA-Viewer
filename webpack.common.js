
const path = require("path");
var HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  entry: {
    main: "./src/index.js",                     // This is the code that changes more frequently         
    vendor: "./src/vendor.js"                   // This code usually stays the same
  },
  module: {
    rules: [
      {
        test: /\.html$/,                        // HTML Loader
        use: ["html-loader"]
      },
      {
        test: /\.(svg|png|jpg|gif)$/,           // Image Loader
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[hash].[ext]",
            outputPath: "imgs"
          }
        }
      }
    ]
  }
};