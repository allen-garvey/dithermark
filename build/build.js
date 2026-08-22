import path from 'path';
import fs from 'fs/promises';

import { createFsFromVolume, Volume } from 'memfs';
const mockFs = createFsFromVolume(new Volume()).promises;

import { PUBLIC_HTML_DIR } from './webpack.config.js';
import { renderHome } from '../server/views/home.js';
import { getWorkerProductionConfig } from './webpack.worker.production.config.js';
import { createWebpackCompiler } from '../server/webpack.js';

const isProduction = process.env.IS_PRODUCTION === 'true';

const homeOutputPath = path.join(PUBLIC_HTML_DIR, 'index.html');

const workerWebpackCompiler = createWebpackCompiler(
    mockFs,
    getWorkerProductionConfig()
);

const homePromise = renderHome({
    isProduction,
    webpack: workerWebpackCompiler,
    fs: mockFs,
}).then(indexContent => fs.writeFile(homeOutputPath, indexContent));

Promise.all([homePromise]);
