const path = require('path');
const config = require('./webpack.config.cjs');

config.mode = 'production';

config.resolve.alias['app-performance-timer'] = path.resolve(
    __dirname,
    '../js/shared/timer-dummy.js'
);
config.resolve.alias['print-palette-button'] = path.resolve(
    __dirname,
    '../js/app/vues/dummy.vue'
);
config.resolve.alias['texture-combine-component'] = path.resolve(
    __dirname,
    '../js/app/vues/dummy.vue'
);

module.exports = config;
