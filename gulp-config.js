"use strict";

const path = require('path');
const config = {};

config.SOURCE_DIR = path.join(__dirname, '/');
config.DEST_DIR = path.join(__dirname, 'public_html');

/*
* JS Configuration 
* for google closure compiler https://github.com/google/closure-compiler-js
*/
config.js = {};
config.js.SOURCE_DIR = path.join(config.DEST_DIR, 'js/');
config.js.DEST_DIR = config.js.SOURCE_DIR;
const WORKER_NAME = 'dither-worker';
config.js.worker_src_name = `${WORKER_NAME}.js`;
config.js.worker_dest_name = `${WORKER_NAME}.min.js`;
const APP_NAME = 'app';
config.js.app_src_name = `${APP_NAME}.js`;
config.js.app_dest_name = `${APP_NAME}.min.js`;
const JS_COMPILER_OPTIONS = {
  compilationLevel: 'SIMPLE',
  warningLevel: 'DEFAULT',
  languageIn: 'ES6',
  languageOut: 'ES6',
};
config.js.worker_options = Object.assign({jsOutputFile: config.js.worker_dest_name}, JS_COMPILER_OPTIONS);
config.js.app_options = Object.assign({jsOutputFile: config.js.app_dest_name}, JS_COMPILER_OPTIONS);

/*
* Sass/Styles configuration
*/
config.styles = {};
config.styles.SOURCE_DIR = path.join(config.SOURCE_DIR, 'sass/');
config.styles.DEST_DIR = path.join(config.DEST_DIR, 'styles/');
config.styles.sass_options = {
  errLogToConsole: true,
  // sourceComments: true, //turns on line number comments 
  outputStyle: 'compressed' //options: expanded, nested, compact, compressed
};


/*
* Export config
*/
module.exports = config;