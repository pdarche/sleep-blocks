'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var watch = require('gulp-watch');
var count = require('gulp-count');

gutil.log('Environment', gutil.colors.blue(gulp.env.production ? 'Production' : 'Development'));

gulp.task('scripts', function() {
 return gulp.src('./js/app.js', {read: false})
   .pipe(browserify({
     insertGlobals : false,
     transform: ['reactify'],
     extensions: ['.jsx'],
     debug: !gulp.env.production
   }))
   .pipe(gulpif(gulp.env.production, uglify({
     mangle: {
       except: ['require', 'export', '$super']
     }
   })))
   .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function() {
  gulp.env.watch = true;
  // Watch files and run tasks if they change
   gulp.watch('js/**', function() {
     gulp.run('scripts', function() {});
   });
});

gulp.task('default', ['scripts', 'watch']);