import { styleText } from 'util';
import path from 'path';
import webpack from 'webpack';

/**
 *
 * @param {import('memfs/lib/node/types').FsPromisesApi} fs
 * @param {import('webpack').WebpackOptionsNormalized} config
 * @returns
 */
export const createWebpackCompiler = (fs, config) => {
    const compiler = webpack(config);
    compiler.outputFileSystem = fs;
    compiler.outputFileSystem.join = path.join.bind(path);
    return compiler;
};

/**
 *
 * @param {number} d
 * @returns {string}
 */
const formatTimePart = d =>
    d.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });

export const startWebpackCompiler = webpackCompiler => {
    webpackCompiler.watch({}, async (err, stats) => {
        if (err) throw err;
        const info = stats.toJson();
        const now = new Date();

        console.log(
            styleText(
                'green',
                `webpack compilation finished at ${formatTimePart(
                    now.getHours()
                )}:${formatTimePart(now.getMinutes())}:${formatTimePart(
                    now.getSeconds()
                )} in ${info.time / 1000}s`
            )
        );

        if (stats.hasErrors()) {
            console.error(info.errors);
        }

        if (stats.hasWarnings()) {
            console.warn(info.warnings);
        }
    });
};
