const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const config = require('./webpack.config.js');

config.mode = 'production';
config.output.filename = 'bundle.min.js';

config.resolve.alias['app-performance-timer'] = path.resolve(__dirname, '../js_src/shared/timer-dummy.js');
config.resolve.alias['print-palette-button'] = path.resolve(__dirname, '../js_src/app/vues/dummy.vue');
config.resolve.alias['texture-combine-component'] = path.resolve(__dirname, '../js_src/app/vues/dummy.vue');


config.optimization = {
    minimizer: [  
        new UglifyJsPlugin({  
            parallel: true,
            cache: true,  
            uglifyOptions: {  
                compress: {  
                    ecma: 8,
                    warnings: true,
                },
                ecma: 8,
                warn: true,
                mangle: true,
            },  
        }),
        //while the sass is already minified, we need this plugin so css extracted from dithermark-vue-color is minified too
        new OptimizeCSSAssetsPlugin,
    ],
};


module.exports = config;