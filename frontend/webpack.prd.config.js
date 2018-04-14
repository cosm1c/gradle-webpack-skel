'use strict';

const path = require('path'),
  webpack = require('webpack'),
  ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin'),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  CleanCSSPlugin = require("less-plugin-clean-css"),
  CleanWebpackPlugin = require('clean-webpack-plugin'),
  OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin"),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {

  mode: 'production',

  entry: './app/main.tsx',

  // TODO: Code splitting with dll-plugin

  output: {
    filename: '[chunkhash]-[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
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
              outputPath: '/images'
            }
          }
        ]
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          // {loader: 'style-loader'}, // This breaks build
          {loader: 'css-loader'},
          {
            loader: 'less-loader',
            options: {
              sourceMap: false,
              strictMath: true,
              noIeCompat: true,
              lessPlugins: [
                new CleanCSSPlugin({advanced: true})
              ]
            }
          }
        ]
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                sourceMap: false
              }
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },

  resolve: {
    modules: [__dirname, path.resolve(__dirname, '..', 'node_modules')],
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.less', '.css', '.json']
  },

  optimization: {
    minimizer: [
      new OptimizeCSSAssetsPlugin({})
    ]
  },

  plugins: [
    new CleanWebpackPlugin(['dist'], {root: path.resolve(__dirname)}),
    new webpack.DefinePlugin({
      IS_PROD: JSON.stringify(true)
    }),
    new ForkTsCheckerWebpackPlugin({
      tslint: false, // TODO: use tslint?
      checkSyntacticErrors: true
    }),
    new MiniCssExtractPlugin({
      filename: "[chunkhash]-[name].css",
      chunkFilename: "[chunkhash]-[id].css"
    }),
    new UglifyJsPlugin({uglifyOptions: {ecma: 6}}),
    new CopyWebpackPlugin([
      {from: 'manifest.json'},
      {from: 'favicon.ico'},
      {from: 'apple-touch-icon.png'},
      {from: 'images', to: 'images'}
    ]),
    new HtmlWebpackPlugin({
      template: 'index.html',
      inject: true,
      hash: true,
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
