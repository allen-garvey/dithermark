import path from 'path';
import express from 'express';
import { createFsFromVolume, Volume } from 'memfs';
const fs = createFsFromVolume(new Volume()).promises;

import { APP_NAME } from '../constants.js';
import { renderHome } from './views/home.js';
import {
    getConfig,
    PUBLIC_ASSETS_DIR,
    PUBLIC_HTML_DIR,
    ASSETS_DIR,
} from '../build/webpack.config.js';
import { createWebpackCompiler } from './webpack.js';

const webpackCompiler = createWebpackCompiler(fs, getConfig());

const app = express();
const port = 3000;

const mimeTypes = new Map([
    ['.js', 'text/javascript'],
    ['.css', 'text/css'],
]);

app.get('/', (req, res) => {
    renderHome({}).then(html => res.send(html));
});

app.get(`/${ASSETS_DIR}/:filename`, (req, res) => {
    const { filename } = req.params;
    const mimeType = mimeTypes.get(path.extname(filename));

    return fs
        .readFile(path.resolve(PUBLIC_ASSETS_DIR, filename))
        .catch(error => {
            if (error.code === 'ENOENT') {
                res.sendStatus(404);
            } else {
                console.error(error);
            }
            throw error;
        })
        .then(
            data => {
                if (data === null) {
                    return;
                }
                res.setHeader('Content-Type', mimeType);
                res.send(data);
            },
            () => {}
        );
});

app.use(express.static(PUBLIC_HTML_DIR, { index: false }));

app.listen(port, () => {
    console.log(
        `${APP_NAME} development server listening on http://localhost:${port}`
    );
});

/**
 *
 * @param {number} d
 * @returns {string}
 */
const formatTimePart = d =>
    d.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });

webpackCompiler.watch({}, async (err, stats) => {
    if (err) throw err;
    const info = stats.toJson();
    const now = new Date();

    console.log(
        `webpack compilation finished at ${formatTimePart(
            now.getHours()
        )}:${formatTimePart(now.getMinutes())}:${formatTimePart(
            now.getSeconds()
        )} in ${info.time / 1000}s`
    );

    if (stats.hasErrors()) {
        console.error(info.errors);
    }

    if (stats.hasWarnings()) {
        console.warn(info.warnings);
    }
});
