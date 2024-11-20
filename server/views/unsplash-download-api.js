import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { render, getTemplate } from './view-helpers.js';

import { UNSPLASH_API_PHOTO_ID_QUERY_KEY } from '../../constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const renderUnsplashDownloadApi = () => {
    const templatePromise = getTemplate('unsplash-download.php');
    const unsplashRandomImagesPromise = fs
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
        .then((s) =>
            JSON.stringify(JSON.parse(s).map((imageData) => imageData.download))
        );

    return Promise.all([templatePromise, unsplashRandomImagesPromise]).then(
        ([template, unsplashRandomImageData]) => {
            return render(template, {
                UNSPLASH_PHOTO_ID_QUERY_KEY: UNSPLASH_API_PHOTO_ID_QUERY_KEY,
                unsplashRandomImageData,
            });
        }
    );
};
