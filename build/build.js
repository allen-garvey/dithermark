import path from 'path';
import fs from 'fs/promises';

import { PUBLIC_HTML_DIR } from './webpack.config.js';
import { renderHome } from '../server/views/home.js';

const isProduction = process.env.IS_PRODUCTION === 'true';

const homeOutputPath = path.join(PUBLIC_HTML_DIR, 'index.html');

const homePromise = renderHome({ isProduction }).then(indexContent =>
    fs.writeFile(homeOutputPath, indexContent)
);

Promise.all([homePromise]);
