
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");     // A loader for webpack which transforms files into base64 URIs.

module.exports = {
  entry: {
    main: "./src/index.js",                     // This is the code that changes more frequently         
    vendor: "./src/vendor.js"                   // This code usually stays the same
  },

  module: {
    rules: [
      {
        test: /\.html$/,                        // LOADER - HTML
        use: ["html-loader"]
      },
      {
        test: /\.js$/,                          // LOADER - JS with Babel
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.json/,                         // LOADER - Json
        use: 'json-loader'
      }
    ]
  },  
};