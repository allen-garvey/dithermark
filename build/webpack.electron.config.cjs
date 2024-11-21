const path = require('path');
const config = require('./webpack.production.config.cjs');

config.output.path = path.resolve(__dirname, '../electron/public_html/assets');

module.exports = config;
