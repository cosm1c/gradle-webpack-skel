'use strict';

const gulp = require('gulp'),
  log = require('fancy-log');

gulp.task('default', function (cb) {
  log('Tasks are:');
  log('\tclean');
  log('\ttest');
  log('\tpackage');
  cb();
});

gulp.task('clean', function (cb) {
  require("rimraf")('dist', cb);
});

gulp.task('test', function (done) {
  require('npm-run').exec('jest', done);
});

gulp.task('package', ['clean', 'test'], function (cb) {
  const webpackConfig = require('./webpack.prd.config.js'),
    webpack = require('webpack');

  webpack(webpackConfig, function (err, stats) {
    // see: https://webpack.github.io/docs/node.js-api.html#stats-tostring
    log("[webpack stats]", stats.toString());
    if (err) throw err;
    if (stats.hasErrors()) throw 'Webpack failed to compile';
    cb();
  });
});
