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
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }

    if (stats) {
      log("[webpack stats]", stats.toString({colors: true}));
      if (stats.hasErrors()) throw 'Webpack failed to compile';
    }

    cb();
  });
});
