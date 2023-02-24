const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: 'development',
  entry: ['babel-polyfill', path.join(__dirname, "src/dapp")],
  output: {
    path: path.join(__dirname, "prod/dapp"),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        type: 'asset/resource',
      },
      {
        test: /\.html$/,
        use: "html-loader",
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ 
      template: path.join(__dirname, "src/dapp/index.html")
    })
  ],
  resolve: {
    extensions: [".js"]
  },
  devServer: {
    static: path.join(__dirname, "dapp"),
    port: 8000,
  },
  devtool: 'inline-source-map',
  performance: {
    hints: false,
  },
};

// const path = require("path");
// const HtmlWebpackPlugin = require("html-webpack-plugin");
// const nodeExternals = require("webpack-node-externals");

// module.exports = {
//   entry: ['babel-polyfill', path.join(__dirname, "src/dapp")],
//   // devtool: 'eval-source-map',
//   output: {
//     path: path.join(__dirname, "prod/dapp"),
//     filename: "bundle.js",
//     libraryTarget: 'amd'
//   },
//   externalsPresets: { node: true }, 
//   externals: [nodeExternals({importType: 'umd'})],
//   // node: {
//   //     child_process: "empty",
//   //     fs: "empty", // if unable to resolve "fs"
//   //   },
//   module: {
//     rules: [
//       {
//         test: /\.(js|jsx)$/,
//         use: "babel-loader",
//         exclude: /node_modules/
//       },
//       {
//         test: /\.css$/,
//         use: ["style-loader", "css-loader"]
//       },
//       {
//         test: /\.(png|svg|jpg|gif)$/,
//         type: 'asset/resource',
//       },
//       {
//         test: /\.html$/,
//         use: "html-loader",
//         exclude: /node_modules/
//       }
//     ]
//   },

//   plugins: [
//     new HtmlWebpackPlugin({ 
//       template: path.join(__dirname, "src/dapp/index.html")
//     })
//   ],
//   resolve: {
//     extensions: ['.js'],
//     preferRelative: true,
//     // fallback: {
//     //   "fs": false,
//     //   "tls": false,
//     //   "net": false,
//     //   "path": false,
//     //   "zlib": false,
//     //   "http": false,
//     //   "https": false,
//     //   "stream": false,
//     //   "crypto": false,
//     //   "vm": false,
//     //   "url": false,
//     //   "os": false,
//     //   "querystring": false,
//     //   "assert": false,
//     //   "constants": false,
//     //   "child-process": false,
//     //   "worker-threads": false
//     //   //"crypto-browserify": require.resolve('crypto-browserify'), //if you want to use this module also don't forget npm i crypto-browserify 
//     // } 
//   },
//   devServer: {
//     static: path.join(__dirname, "src/dapp"),
//     port: 8000
//     //stats: "minimal"
//   }
// };
