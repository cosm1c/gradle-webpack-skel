'use strict';

var path = require('path'),
  webpack = require('webpack'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  CleanWebpackPlugin = require('clean-webpack-plugin');

var ENV = process.env.NODE_ENV = process.env.ENV = 'development';

module.exports = {

  mode: 'development',

  devtool: 'eval-source-map',

  watch: true,

  context: __dirname,

  entry: ['./app/main.tsx', './app/main.less'],

  output: {
    filename: '[name].js',
    // chunkFilename: '[name].chunk.js',
    // path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },

  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader'
      },
      {
        enforce: 'pre',
        test: /\.tsx?$/,
        use: 'source-map-loader'
      },
      {
        test: /\.(png|jpg|gif|woff|woff2|eot|ttf|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images'
            }
          }
        ]
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true
            }
          },
          {
            loader: "less-loader",
            options: {
              sourceMap: true,
              strictMath: true,
              noIeCompat: true
            }
          }
        ]
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          //{loader: 'babel-loader'},
          {loader: 'ts-loader'}
        ]
      }
    ]
  },

  resolve: {
    modules: [__dirname, path.resolve(__dirname, '..', 'node_modules')],
    extensions: ['.css', '.less', '.js', '.ts', '.jsx', '.tsx', '.json']
  },

  devServer: {
    proxy: {
      '/': 'http://localhost:8080'
    },
    host: 'localhost',
    port: 9090,
    publicPath: 'http://localhost:9090/',
    // contentBase: path.resolve(__dirname, 'dist'),
    contentBase: false,
    compress: true,
    stats: true,
    inline: false,
    overlay: {
      warnings: true,
      errors: true
    },
    hot: true
  },

  plugins: [
    new CleanWebpackPlugin(['dist'], {root: path.resolve(__dirname)}),
    new webpack.LoaderOptionsPlugin({
      minimize: false,
      debug: true,
      options: {
        context: __dirname
      }
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(ENV)
    }),
    new CopyWebpackPlugin([
      {from: 'manifest.json'},
      {from: 'favicon.ico'},
      {from: 'apple-touch-icon.png'},
      {from: 'images', to: 'images'}
    ]),
    new webpack.HotModuleReplacementPlugin(),
    //new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.html',
      // chunksSortMode: 'dependency',
      keepClosingSlash: true,
      inject: true,
      xhtml: true
    })
  ]
};
