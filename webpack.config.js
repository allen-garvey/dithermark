const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
    mode: "development",
    entry: './js_src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public_html/js')
    },
    resolve: {
        alias: {
            'app-performance-timer': path.resolve(__dirname, 'js_src/shared/timer.js'),
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /worker-main\.js$/,
                loader: 'worker-loader',
                options: { 
                    inline: true, 
                    fallback: false,
                },
              }
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ],
};