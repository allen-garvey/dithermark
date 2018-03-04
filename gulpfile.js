"use strict";

var path = require('path');
var gulp = require('gulp');
var sass = require('gulp-sass');

var config = require(path.join(__dirname, 'gulp-config.js'));

/*
* Sass/Styles Tasks
*/
gulp.task('sass', function() {
    gulp.src(config.styles.SOURCE_DIR + '**/*.scss')
        .pipe(sass(config.styles.sass_options).on('error', sass.logError))
        .pipe(gulp.dest(config.styles.DEST_DIR));
});


/*
* Watch tasks
*/

gulp.task('watchSass', ['sass'], function() {
    gulp.watch(config.styles.SOURCE_DIR + '**/*.scss', ['sass']);
});


/*
* Main gulp tasks
*/
gulp.task('watch', ['watchSass']);
gulp.task('build', ['sass']);
gulp.task('default', ['build']);