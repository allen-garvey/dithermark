const config = require('./webpack.config.js');

config.watch = true;
config.watchOptions = {
    aggregateTimeout: 300,
    poll: 1000
};

module.exports = config;