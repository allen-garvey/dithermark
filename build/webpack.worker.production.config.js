import path from 'path';
import { getWorkerConfig } from './webpack.worker.config.js';

/**
 *
 * @returns {import('webpack').WebpackOptionsNormalized}
 */
export const getWorkerProductionConfig = () => {
    const config = getWorkerConfig();

    config.mode = 'production';

    config.resolve.alias['app-performance-timer'] = path.resolve(
        import.meta.dirname,
        '../js/shared/timer-dummy.js'
    );

    return config;
};
