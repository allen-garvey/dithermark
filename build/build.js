import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

import { renderHome, renderUnsplashDownloadApi } from '../server/templates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.IS_PRODUCTION === 'true';

const homePromise = renderHome(isProduction).then((indexContent) =>
    fs.writeFile(
        path.join(__dirname, '..', 'public_html', 'index.html'),
        indexContent
    )
);

const SERVERLESS_PATH = path.join(__dirname, '..', 'serverless');

const unsplashDownloadApiPromise = fs
    .mkdir(SERVERLESS_PATH, { recursive: true })
    .then(() => renderUnsplashDownloadApi())
    .then((unsplashDownloadApi) =>
        fs.writeFile(
            path.join(SERVERLESS_PATH, 'unsplash-download.php'),
            unsplashDownloadApi
        )
    );

Promise.all([homePromise, unsplashDownloadApiPromise]);
