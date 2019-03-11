const webpack = require("webpack");
const merge = require("webpack-merge");
const path = require("path");
const VueLoaderPlugin = require('vue-loader/lib/plugin')

var commonConfig = {
  output: {
    path: path.resolve(__dirname + "/dist/")
  },
  module: {
    rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        // this will apply to both plain `.js` files
        // AND `<script>` blocks in `.vue` files
        {
          test: /\.js$/,
          loader: 'babel-loader'
        },
        // this will apply to both plain `.css` files
        // AND `<style>` blocks in `.vue` files
        {
          test: /\.css$/,
          use: [
            'vue-style-loader',
            'css-loader'
          ]
        }
      ]
  },
  //externals: { ...},
  plugins: [
      new VueLoaderPlugin()
    ]
};

module.exports = [
  // for the browser based implementation
  merge(commonConfig, {
    entry: path.resolve(__dirname + "/index.js"),
    output: {
      filename: "forge-vuer.min.js",
      libraryTarget: "window",
      library: "ForgeVuer"
    }
  }),

  // for the node based implementation
  merge(commonConfig, {
    entry: path.resolve(__dirname + "/index.js"),
    output: {
      filename: "forge-vuer.js",
      library: "ForgeVuer",
      libraryTarget: "umd",
    }
  })
];
