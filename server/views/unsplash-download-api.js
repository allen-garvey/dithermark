import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { render, getTemplate } from './view-helpers.js';

import { UNSPLASH_API_PHOTO_ID_QUERY_KEY } from '../../constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templateName = 'unsplash-download.php';

export const renderUnsplashDownloadApi = () =>
    fs
        .readFile(
            path.join(
                __dirname,
                '..',
                '..',
                'public_html',
                'api',
                'unsplash.json'
            ),
            'utf8'
        )
        .catch((e) => {
            if (e.code === 'ENOENT') {
                console.log('unsplash.json not found, run npm run seed:unsplash to generate.');
            }
            else {
                console.error(e);
            }
            console.log(`Skipping building ${templateName}`);
            return null;
        })
        .then((s) => {
            if (s === null) {
                return null;
            }
            const unsplashRandomImageData = JSON.stringify(JSON.parse(s).map((imageData) => imageData.download));

            return getTemplate(templateName).then(template => render(template, {
                UNSPLASH_PHOTO_ID_QUERY_KEY: UNSPLASH_API_PHOTO_ID_QUERY_KEY,
                unsplashRandomImageData,
            }));

        }
        );