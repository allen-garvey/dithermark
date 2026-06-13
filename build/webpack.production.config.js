import path from 'path';
import { getConfig } from './webpack.config.js';

/**
 *
 * @returns {import('webpack').WebpackOptionsNormalized}
 */
export const getProductionConfig = () => {
    const config = getConfig();

    config.mode = 'production';

    config.resolve.alias['app-performance-timer'] = path.resolve(
        import.meta.dirname,
        '../js/shared/timer-dummy.js'
    );
    config.resolve.alias['print-palette-button'] = path.resolve(
        import.meta.dirname,
        '../js/app/vues/dummy.vue'
    );
    config.resolve.alias['texture-combine-component'] = path.resolve(
        import.meta.dirname,
        '../js/app/vues/dummy.vue'
    );

    return config;
};

export default getProductionConfig();
