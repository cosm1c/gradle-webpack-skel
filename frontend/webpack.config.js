'use strict';

const path = require('path'),
  webpack = require('webpack'),
  // BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin,
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  MiniCssExtractPlugin = require("mini-css-extract-plugin"),
  OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'),
  BabelMinifyPlugin = require('babel-minify-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = (env, argv) => ({

  mode: argv.mode || 'development',

  devtool: argv.mode === 'production' ? false : 'eval-source-map',

  watch: argv.mode !== 'production',

  context: __dirname,

  entry: './app/index.tsx',

  output: {
    filename: '[hash]-[name].js',
    chunkFilename: '[hash]-[name].chunk.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },

  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.tsx?$/,
        use: 'source-map-loader'
      },
      {
        test: /\.(png|jpg|gif|woff|woff2|eot|ttf|svg)$/,
        use: [
          {loader: 'file-loader', options: {outputPath: 'images'}}
        ]
      },
      {
        test: /\.s?[ac]ss$/,
        use: [
          argv.mode === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
          {loader: 'css-loader', options: {sourceMap: argv.mode !== 'production'}},
          {loader: 'sass-loader', options: {sourceMap: argv.mode !== 'production'}}
        ]
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {loader: 'babel-loader'}, // TODO: Disable in dev?
          {loader: 'ts-loader'}
        ]
      }
    ]
  },

  resolve: {
    // modules: [__dirname, path.resolve(__dirname, '..', 'node_modules')],
    extensions: ['.css', '.less', '.js', '.ts', '.jsx', '.tsx', '.json']
  },

  devServer: {
    proxy: {
      '/': 'http://localhost:8080'
    },
    host: 'localhost',
    port: 9090,
    publicPath: 'http://localhost:9090/',
    // contentBase: false, // path.resolve(__dirname, 'dist'),
    compress: true,
    stats: true,
    overlay: {
      warnings: true,
      errors: true
    },
    hot: true
  },

  optimization: {
    minimize: false,
    // minimizer: [],
    runtimeChunk: false,
    // splitChunks: {
    //   cacheGroups: {
    //     default: false,
    //     commons: {
    //       test: /[\\/]node_modules[\\/]/,
    //       name: 'vendor_app',
    //       chunks: 'all',
    //       minChunks: 2
    //     },
    //     // TODO: break Sass up to load on demand, minimal for first render
    //     styles: {
    //       name: 'styles',
    //       test: /\.css$/,
    //       chunks: 'all',
    //       enforce: true
    //     }
    //   }
    // }
  },

  plugins: [
    // new BundleAnalyzerPlugin(),
    new CleanWebpackPlugin(['dist'], {root: path.resolve(__dirname)}),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(argv.mode || 'development')
    }),
    new CopyWebpackPlugin([
      {from: 'manifest.json'},
      {from: 'favicon.ico'},
      {from: 'apple-touch-icon.png'},
      {from: 'images', to: 'images'}
    ]),
    new MiniCssExtractPlugin({
      filename: '[hash]-[name].css',
      chunkFilename: '[hash]-[name].chunk.css'
    }),
    new OptimizeCssAssetsPlugin({
      // cssProcessorOptions: {discardComments: {removeAll: true}}
    }),
    argv.mode === 'production' ?
      new BabelMinifyPlugin({mangle: {topLevel: true}}) :
      new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.html',
      inject: true,
      //hash: true,
      xhtml: true,
      minify: argv.mode === 'production' ?
        {
          collapseInlineTagWhitespace: false,
          collapseWhitespace: true,
          // conservativeCollapse: true,
          keepClosingSlash: true,
          removeComments: true,
          minifyCSS: true,
          minifyJS: true
        } :
        false
    })
  ]
});
