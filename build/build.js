import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

import { PUBLIC_HTML_DIR } from './webpack.config.js';
import { renderHome } from '../server/views/home.js';
import { renderUnsplashDownloadApi } from '../server/views/unsplash-download-api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isProduction = process.env.IS_PRODUCTION === 'true';

const homeOutputPath = path.join(PUBLIC_HTML_DIR, 'index.html');

const homePromise = renderHome({ isProduction }).then(indexContent =>
    fs.writeFile(homeOutputPath, indexContent)
);

const SERVERLESS_PATH = path.join(__dirname, '..', 'serverless');

const unsplashDownloadApiPromise = fs
    .mkdir(SERVERLESS_PATH, { recursive: true })
    .then(() => renderUnsplashDownloadApi())
    .then(unsplashDownloadApi => {
        if (unsplashDownloadApi) {
            return fs.writeFile(
                path.join(SERVERLESS_PATH, 'unsplash-download.php'),
                unsplashDownloadApi
            );
        }
        return null;
    });

Promise.all([homePromise, unsplashDownloadApiPromise]);
