'use strict';

const path = require('path'),
  webpack = require('webpack'),
  // BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin,
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  MiniCssExtractPlugin = require("mini-css-extract-plugin"),
  OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'),
  MinifyPlugin = require('babel-minify-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {

  mode: 'production',

  devtool: false,

  entry: ['./app/main.tsx', './app/main.less'],

  output: {
    filename: '[chunkhash]-[name].js',
    chunkFilename: '[chunkhash]-[name].chunk.js',
    path: path.resolve(__dirname, 'dist')/*,
    publicPath: '/'*/
  },

  module: {
    rules: [
      // {test: /\.txt$/, use: 'raw-loader'},
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
          MiniCssExtractPlugin.loader,
          {loader: 'css-loader'},
          {
            loader: 'less-loader',
            options: {
              sourceMap: false,
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
          {loader: 'babel-loader'},
          {loader: 'ts-loader'}
        ]
      }
    ]
  },

  resolve: {
    modules: [__dirname, path.resolve(__dirname, '..', 'node_modules')],
    extensions: ['.css', '.less', '.js', '.ts', '.jsx', '.tsx', '.json']
  },

  optimization: {
    minimize: false/*,
    minimizer: []*/
  },

  plugins: [
    // new BundleAnalyzerPlugin(),
    new CleanWebpackPlugin(['dist'], {root: path.resolve(__dirname)}),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new CopyWebpackPlugin([
      {from: 'manifest.json'},
      {from: 'favicon.ico'},
      {from: 'apple-touch-icon.png'},
      {from: 'images', to: 'images'}
    ]),
    new MiniCssExtractPlugin({
      filename: '[chunkhash]-[name].css',
      chunkFilename: '[chunkhash]-[name].chunk.css'
    }),
    new OptimizeCssAssetsPlugin({
      cssProcessorOptions: {discardComments: {removeAll: true}}
    }),
    new MinifyPlugin({
      mangle: {topLevel: true}
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
      inject: true,
      //hash: true,
      xhtml: true,
      minify: {
        collapseInlineTagWhitespace: false,
        collapseWhitespace: true,
        // conservativeCollapse: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true,
        sortAttributes: true,
        sortClassName: true
      }
    })
  ]
};
