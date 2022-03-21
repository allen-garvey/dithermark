const webpack = require('webpack');
const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'development',
    entry: [`${__dirname}/../js_src/index.js`, `${__dirname}/../sass/style.scss`,],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, '../public_html/assets')
    },
    resolve: {
        alias: {
            'app-performance-timer': path.resolve(__dirname, '../js_src/shared/timer.js'),
            'print-palette-button': path.resolve(__dirname, '../js_src/app/vues/print-palette-button.vue'),
            'texture-combine-component': path.resolve(__dirname, '../js_src/app/vues/texture-combine.vue'),
        }
    },
    devServer: {
        static: {
            directory: path.join(__dirname, '../public_html'),
        },
        devMiddleware: {
            publicPath: 'http://localhost:3000/assets/',
        },
        port: 3000,
        open: true,
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
                    inline: 'no-fallback',
                },
            },
            //besides the sass files, also extracts css from dithermark-vue-color
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'sass-loader',
                    },
                ]
            },
            {
                test: /\.scss$/,
                oneOf: [
                    // this matches `<style module>`
                    {
                        resourceQuery: /module/,
                        use: [
                            'vue-style-loader',
                            {
                                loader: 'css-loader',
                                options: {
                                    esModule: false,
                                    modules: {
                                        localIdentName: '[local]_[hash:base64:8]',
                                    },
                                }
                            },
                            {
                                loader: 'sass-loader',
                                options: {
                                    additionalData: `@import "${path.resolve(__dirname, '../sass')}/variables.scss"; @import "${path.resolve(__dirname, '../sass')}/mixins.scss";`,
                                },
                            },
                        ]
                    },
                    {
                        use: [
                            'vue-style-loader',
                            {
                                loader: MiniCssExtractPlugin.loader,
                                options: {
                                    esModule: false,
                                },
                            },
                            'css-loader',
                            'sass-loader',
                        ]
                    },
                ],
            },
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: '../assets/style.css',
        }),
        new webpack.DefinePlugin({
            __VUE_OPTIONS_API__: true,
            __VUE_PROD_DEVTOOLS__: false,
        }),
    ],
};