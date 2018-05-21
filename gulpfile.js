"use strict";

const path = require('path');
const gulp = require('gulp');
const sass = require('gulp-sass');
const compiler = require('google-closure-compiler-js').gulp();

const config = require(path.join(__dirname, 'gulp-config.js'));

/*
* JS Tasks
*/

gulp.task('minifyApp', function(){
    return gulp.src(path.join(config.js.SOURCE_DIR, config.js.app_src_name))
        .pipe(compiler(config.js.app_options))
        .pipe(gulp.dest(config.js.DEST_DIR));
});

gulp.task('minifyWorker', function(){
    return gulp.src(path.join(config.js.SOURCE_DIR, config.js.worker_src_name))
        .pipe(compiler(config.js.worker_options))
        .pipe(gulp.dest(config.js.DEST_DIR));
});

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
gulp.task('minifyJs', ['minifyApp', 'minifyWorker']);
gulp.task('build', ['sass']);
gulp.task('release', ['sass', 'minifyJs']);
gulp.task('default', ['build']);