import path from 'path';
import webpack from 'webpack';

export const WORKER_OUT_FILE = 'worker.js';

/**
 *
 * @returns {import('webpack').WebpackOptionsNormalized}
 */
export const getWorkerConfig = () => ({
    mode: 'development',
    entry: [`${import.meta.dirname}/../js/worker/worker-main.js`],
    output: {
        filename: WORKER_OUT_FILE,
        path: '/',
    },
    resolve: {
        alias: {
            'app-performance-timer': path.resolve(
                import.meta.dirname,
                '../js/shared/timer.js'
            ),
        },
    },
});
