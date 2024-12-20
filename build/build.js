import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

import { renderHome } from '../server/views/home.js';
import { renderUnsplashDownloadApi } from '../server/views/unsplash-download-api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.IS_PRODUCTION === 'true';
const isElectron = process.env.ELECTRON === 'true';

const publicHtmlDir = path.join(__dirname, '..', 'public_html');
let homeOutputPath = path.join(publicHtmlDir, 'index.html');
let getPrebuildHomePromise = () => Promise.resolve();

if (isElectron) {
    const electronOutputDir = path.join(
        __dirname,
        '..',
        'electron',
        'public_html'
    );

    getPrebuildHomePromise = () =>
        fs.cp(publicHtmlDir, electronOutputDir, {
            recursive: true,
            filter: (src, _dest) => {
                if (src === publicHtmlDir) {
                    return true;
                }
                return /\.(png|ico)$/.test(src);
            },
        });

    homeOutputPath = path.join(electronOutputDir, 'index.html');
}

const homePromise = getPrebuildHomePromise()
    .then(() => renderHome({ isProduction, isElectron }))
    .then((indexContent) => fs.writeFile(homeOutputPath, indexContent));

const SERVERLESS_PATH = path.join(__dirname, '..', 'serverless');

const unsplashDownloadApiPromise = fs
    .mkdir(SERVERLESS_PATH, { recursive: true })
    .then(() => renderUnsplashDownloadApi())
    .then((unsplashDownloadApi) => {
        if (unsplashDownloadApi) {
            return fs.writeFile(
                path.join(SERVERLESS_PATH, 'unsplash-download.php'),
                unsplashDownloadApi
            );
        }
        return null;
    }
    );

Promise.all([homePromise, unsplashDownloadApiPromise]);
