
const path = require("path");
var HtmlWebpackPlugin = require("html-webpack-plugin");     // A loader for webpack which transforms files into base64 URIs.
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
        test: /\.js$/,                          // JS Loader with Babel
        use: 'babel-loader',
        exclude: /node_modules/
      },
    //   {
    //     test: /\.(png|jpg|jpeg|gif|tif|tiff|bmp|svg)$/,           // Image Loader
    //     use: {
    //       loader: "file-loader",
    //       options: {
    //         name: "[name].[hash].[ext]",
    //         outputPath: "imgs"
    //       }
    //     }
    //   }
    // {
    //   test: /\.(png|jpg|jpeg|gif|tif|tiff|bmp|svg)$/,           // Image Loader
    //   use: {
    //     loader: "url-loader",
    //     options: {
    //       limit: 10000,
    //       // name: 'assets/images/[name].[hash:8].[ext]'
    //       name: ('assets/images/[name].[hash:8].[ext]',
    //       'assets/images/[name].[ext]')
    //     }
    //   }
    // }
    ]
  },
//   plugins: removeEmpty([
//     // new webpack.DefinePlugin({
//     //   // __BASENAME__: JSON.stringify(BASENAME),
//     //   'process.env': {
//     //     'NODE_ENV': JSON.stringify(env.webpack || env)
//     //   }
//     // }),
//         new ProgressBarPlugin(),
//   ])
  
};