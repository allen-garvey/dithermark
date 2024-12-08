import path from 'path';
import { fileURLToPath } from 'url';
import { getProductionConfig } from './webpack.production.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = getProductionConfig();

config.output.path = path.resolve(__dirname, '../electron/public_html/assets');

export default config;
