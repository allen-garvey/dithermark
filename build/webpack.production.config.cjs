const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const config = require('./webpack.config.js');

config.mode = 'production';
config.output.filename = 'bundle.min.js';

config.resolve.alias['app-performance-timer'] = path.resolve(__dirname, '../js_src/shared/timer-dummy.js');
config.resolve.alias['print-palette-button'] = path.resolve(__dirname, '../js_src/app/vues/dummy.vue');
config.resolve.alias['texture-combine-component'] = path.resolve(__dirname, '../js_src/app/vues/dummy.vue');


config.optimization = {
    minimizer: [  
        //since we are overrided minimizer for OptimizeCSSAssetsPlugin we need to manually add terser
        new TerserPlugin({
            parallel: true,
        }),
        //while the sass is already minified, we need this plugin so css extracted from dithermark-vue-color is minified too
        new CssMinimizerPlugin(),
    ],
};


module.exports = config;