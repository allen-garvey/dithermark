const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'development',
    entry: [`${__dirname}/../js_src/index.js`, `${__dirname}/../sass/style.scss`,],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, '../public_html/js')
    },
    resolve: {
        alias: {
            'app-performance-timer': path.resolve(__dirname, '../js_src/shared/timer.js'),
            'print-palette-button': path.resolve(__dirname, '../js_src/app/vues/print-palette-button.vue'),
            'texture-combine-component': path.resolve(__dirname, '../js_src/app/vues/texture-combine.vue'),
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
            },
            //besides the sass files, also extracts css from dithermark-vue-color
            {
                test: /\.s?css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            outputStyle: 'compressed',
                        },
                    },
                ]
            },
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: '../styles/style.css',
        }),
    ],
};