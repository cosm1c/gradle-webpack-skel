'use strict';

const path = require('path'),
  webpack = require('webpack'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin');

const ENV = process.env.NODE_ENV = process.env.ENV = 'development';

module.exports = {
  mode: 'development',

  watch: true,

  entry: {
    app: './app/main.tsx'
  },

  /*
    entry: [
      'webpack-dev-server/client?http://localhost:9090',
      'webpack/hot/only-dev-server',
      './app/main.tsx'
    ],
  */

  output: {
    filename: '[name].js',
    // path: path.resolve(__dirname, 'out', 'ui'),
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
        test: /\.css$/,
        use: [
          {
            loader: 'css-loader',
            options: {
              minimize: false,
              sourceMap: true
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
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {loader: 'cache-loader'},
          {
            loader: 'thread-loader',
            options: {
              workers: require('os').cpus().length - 1
            }
          },
          {
            loader: 'ts-loader',
            options: {
              happyPackMode: true
            }
          }
        ]
      }
    ]
  },

  resolve: {
    modules: [__dirname, path.resolve(__dirname, '..', 'node_modules')],
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.less', '.json']
  },

  devtool: 'eval-source-map',

  context: __dirname,

  target: "web",

  devServer: {
    proxy: {
      '/': 'http://localhost:8080'
    },
    host: 'localhost',
    port: 9090,
    publicPath: 'http://localhost:9090/',
    // contentBase: path.resolve(__dirname, 'out'),
    contentBase: false,
    compress: true,
    stats: true,
    hot: true
  },

  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: false,
      debug: true,
      options: {
        context: __dirname,
        htmlLoader: {
          minimize: true,
          removeAttributeQuotes: false,
          caseSensitive: true
        }
      }
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(ENV),
      IS_PROD: false
    }),

    new ForkTsCheckerWebpackPlugin({checkSyntacticErrors: true}),
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
      chunksSortMode: 'dependency',
      inject: true,
      xhtml: true
    })
  ],

  node: {
    global: true,
    crypto: 'empty',
    process: false,
    module: false,
    clearImmediate: false,
    setImmediate: false
  }
};
