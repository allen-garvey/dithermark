const webpack = require('webpack');
const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'development',
    entry: [`${__dirname}/../js/index.js`, `${__dirname}/../sass/style.scss`],
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, '../public_html/assets'),
    },
    resolve: {
        alias: {
            'app-performance-timer': path.resolve(
                __dirname,
                '../js/shared/timer.js'
            ),
            'print-palette-button': path.resolve(
                __dirname,
                '../js/app/vues/print-palette-button.vue'
            ),
            'texture-combine-component': path.resolve(
                __dirname,
                '../js/app/vues/texture-combine.vue'
            ),
        },
    },
    devServer: {
        static: {
            directory: path.join(__dirname, '../public_html'),
        },
        devMiddleware: {
            publicPath: 'http://localhost:3000/assets/',
        },
        port: 3000,
        client: {
            overlay: {
                warnings: false,
            },
        },
        open: true,
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            //besides the sass files, also extracts css from dithermark-vue-color
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'vue-style-loader'
                    },
                    {
                        loader: 'css-loader'
                    }
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
                                        localIdentName:
                                            '[local]_[hash:base64:8]',
                                    },
                                },
                            },
                            {
                                loader: 'sass-loader',
                                options: {
                                    additionalData: `@use "${path.resolve(
                                        __dirname,
                                        '../sass'
                                    )}/variables.scss"; @use "${path.resolve(
                                        __dirname,
                                        '../sass'
                                    )}/mixins.scss";`,
                                },
                            },
                        ],
                    },
                    {
                        use: [
                            {
                                loader: MiniCssExtractPlugin.loader,
                                options: {
                                    esModule: false,
                                },
                            },
                            'css-loader',
                            'sass-loader',
                        ],
                    },
                ],
            },
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: '../assets/style.css',
        }),
        new webpack.DefinePlugin({
            __VUE_OPTIONS_API__: true,
            __VUE_PROD_DEVTOOLS__: false,
            __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
        }),
    ],
};
