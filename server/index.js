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
import { createWebpackCompiler, startWebpackCompiler } from './webpack.js';
import { serveFile } from './routes.js';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    renderHome({}).then(html => res.send(html));
});

app.get(`/${ASSETS_DIR}/:filename`, (req, res) => {
    const { filename } = req.params;
    return serveFile(res, fs, PUBLIC_ASSETS_DIR, filename);
});

app.use(express.static(PUBLIC_HTML_DIR, { index: false }));

app.listen(port, () => {
    console.log(
        `${APP_NAME} development server listening on http://localhost:${port}`
    );
});

startWebpackCompiler(createWebpackCompiler(fs, getConfig()));
