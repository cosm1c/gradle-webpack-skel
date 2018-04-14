'use strict';

const path = require('path'),
  webpack = require('webpack'),
  CleanCSSPlugin = require("less-plugin-clean-css"),
  ClosureCompilerPlugin = require('webpack-closure-compiler'),
  MiniCssExtractPlugin = require("mini-css-extract-plugin"),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {

  context: __dirname,

  mode: 'production',

  target: 'web',

  bail: true,

  stats: true,

  entry: {
    main: ['./app/main.tsx']
  },

  resolve: {
    modules: [__dirname, path.resolve(__dirname, '..', 'node_modules')],
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.less', '.json']
  },

  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'dist')/*,
    publicPath: './'*/
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },

  plugins: [
    new CleanWebpackPlugin([
      'dist'
    ], {
      root: path.resolve(__dirname)
    }),
    new webpack.DefinePlugin({
      IS_PROD: true
    }),
    new MiniCssExtractPlugin({
      filename: "[name].bundle.[chunkhash].css",
      chunkFilename: "[id].[chunkhash].css",
    }),
    new ClosureCompilerPlugin({
      compiler: {
        //jar: 'path/to/your/custom/compiler.jar', //optional
        language_in: 'ECMASCRIPT6',
        language_out: 'ECMASCRIPT6',
        compilation_level: 'ADVANCED'
      }
    }),
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
  ],

  module: {
    rules: [
      {
        test: /\.(jpg|png|gif)$/,
        use: 'file-loader'
      },
      {
        test: /\.(woff|woff2|eot|ttf|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 100000
          }
        }
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'less-loader',
            options: {
              sourceMap: false,
              //strictMath: true,
              noIeCompat: true,
              lessPlugins: [
                new CleanCSSPlugin({advanced: true})
              ]
            }
          }
        ]
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      }
    ]
  },

  node: {
    global: true,
    crypto: 'empty',
    process: false,
    module: false,
    clearImmediate: false,
    setImmediate: false
  }
};
