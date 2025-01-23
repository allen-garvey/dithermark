import path from 'path';
import fs from 'fs/promises';
import { styleText } from 'util';
import { render, getTemplate } from './view-helpers.js';

import { UNSPLASH_API_PHOTO_ID_QUERY_KEY } from '../../constants.js';
import { PUBLIC_HTML_DIR } from '../../build/webpack.config.js';

const templateName = 'unsplash-download.php';
const unsplashJson = 'unsplash.json';

export const renderUnsplashDownloadApi = () =>
    fs
        .readFile(path.join(PUBLIC_HTML_DIR, 'api', unsplashJson), 'utf8')
        .catch(e => {
            if (e.code === 'ENOENT') {
                console.log(
                    styleText(
                        'red',
                        `${unsplashJson} not found, run npm run seed:unsplash to generate.`
                    )
                );
            } else {
                console.error(e);
            }
            console.log(`Skipping building ${templateName}`);
            return null;
        })
        .then(s => {
            if (s === null) {
                return null;
            }
            const unsplashRandomImageData = JSON.stringify(
                JSON.parse(s).map(imageData => imageData.download)
            );

            return getTemplate(templateName).then(template =>
                render(template, {
                    UNSPLASH_PHOTO_ID_QUERY_KEY:
                        UNSPLASH_API_PHOTO_ID_QUERY_KEY,
                    unsplashRandomImageData,
                })
            );
        });
