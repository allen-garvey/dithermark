import path from 'path';
import { fileURLToPath } from 'url';
import { getConfig } from './webpack.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getProductionConfig = () => {
    const config = getConfig();

    config.mode = 'production';

    config.resolve.alias['app-performance-timer'] = path.resolve(
        __dirname,
        '../js/shared/timer-dummy.js'
    );
    config.resolve.alias['print-palette-button'] = path.resolve(
        __dirname,
        '../js/app/vues/dummy.vue'
    );
    config.resolve.alias['texture-combine-component'] = path.resolve(
        __dirname,
        '../js/app/vues/dummy.vue'
    );

    return config;
};

export default getProductionConfig();
