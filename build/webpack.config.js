import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import { VueLoaderPlugin } from 'vue-loader';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PUBLIC_HTML_DIR = path.resolve(__dirname, '../public_html');
export const ASSETS_DIR = 'assets';
export const PUBLIC_ASSETS_DIR = path.resolve(PUBLIC_HTML_DIR, ASSETS_DIR);

export const getConfig = () => ({
    mode: 'development',
    entry: [`${__dirname}/../js/index.js`, `${__dirname}/../sass/style.scss`],
    output: {
        filename: 'app.js',
        path: PUBLIC_ASSETS_DIR,
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
            {
                test: /\.scss$/,
                oneOf: [
                    // this matches `<style module>`
                    {
                        resourceQuery: /module/,
                        use: [
                            {
                                loader: MiniCssExtractPlugin.loader,
                            },
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
});

export default getConfig();
