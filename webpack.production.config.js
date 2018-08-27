const path = require('path');
const config = require('./webpack.config.js');

config.mode = 'production';
config.output.filename = 'bundle.min.js';

config.resolve.alias['app-performance-timer'] = path.resolve(__dirname, 'js_src/shared/timer-dummy.js');
config.resolve.alias['print-palette-button'] = path.resolve(__dirname, 'js_src/app/vues/dummy.vue');
config.resolve.alias['texture-combine-component'] = path.resolve(__dirname, 'js_src/app/vues/dummy.vue');

module.exports = config;