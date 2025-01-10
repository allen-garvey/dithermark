import express from 'express';
import multer from 'multer';
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
import {
    videoToFrames,
    framesToVideo,
    FFMPEG_RAW_DIRECTORY,
    FFMPEG_OUTPUT_DIRECTORY,
    DITHERED_IMAGES_DIRECTORY_NAME,
} from './ffmpeg.js';

const upload = multer({ dest: 'uploads/' });
const uploadDithered = multer({ dest: `${DITHERED_IMAGES_DIRECTORY_NAME}/` });

const FFMPEG_OUTPUT_URL_BASE = '/output/ffmpeg';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    renderHome({}).then(html => res.send(html));
});

app.get(`/${ASSETS_DIR}/:filename`, (req, res) => {
    const { filename } = req.params;
    return serveFile(res, fs, PUBLIC_ASSETS_DIR, filename);
});

app.post('/api/ffmpeg/video-to-frames', upload.single('video'), (req, res) => {
    videoToFrames(req.file.path, req.body.fps, req.body.videoDuration).then(
        imageFilePaths => res.json(imageFilePaths)
    );
});

app.post('/api/ffmpge/image', uploadDithered.single('image'), (req, res) => {
    return res.json({ code: 200 });
});

app.post('/api/ffmpeg/frames-to-video', (req, res) => {
    framesToVideo(req.body.fps).then(videoName =>
        res.json({
            name: videoName,
            url: `${FFMPEG_OUTPUT_URL_BASE}/${videoName}`,
        })
    );
});

app.use('/raw/ffmpeg', express.static(FFMPEG_RAW_DIRECTORY, { index: false }));

app.use(
    FFMPEG_OUTPUT_URL_BASE,
    express.static(FFMPEG_OUTPUT_DIRECTORY, { index: false })
);

app.use(express.static(PUBLIC_HTML_DIR, { index: false }));

app.listen(port, () => {
    console.log(
        `${APP_NAME} development server listening on http://localhost:${port}`
    );
});

startWebpackCompiler(createWebpackCompiler(fs, getConfig()));
