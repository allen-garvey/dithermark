"use strict";

const path = require('path');
const gulp = require('gulp');
const sass = require('gulp-sass');

const config = require(path.join(__dirname, 'gulp-config.js'));

/*
* Sass/Styles Tasks
*/
gulp.task('sass', function(){
    return gulp.src(config.styles.SOURCE_DIR + '**/*.scss')
        .pipe(sass(config.styles.sass_options).on('error', sass.logError))
        .pipe(gulp.dest(config.styles.DEST_DIR));
});


/*
* Watch tasks
*/
gulp.task('watchSass', function(){
    gulp.watch(config.styles.SOURCE_DIR + '**/*.scss', gulp.series('sass'));
});


/*
* Main gulp tasks
*/
//have to put watchSass sass task dependency here, since if we put it directly on the watchSass task, it will not watch, instead just run once
gulp.task('watch', gulp.series(['sass', 'watchSass']));
gulp.task('build', gulp.parallel(['sass']));
gulp.task('default', gulp.parallel(['build']));