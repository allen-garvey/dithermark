import { styleText } from 'util';
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
    FFMPEG_RAW_IMAGE_DIRECTORY,
    FFMPEG_OUTPUT_DIRECTORY,
    DITHERED_IMAGES_DIRECTORY_NAME,
    FFMPEG_TMP_ROOT_NAME,
    FFMPEG_VIDEO_UPLOAD_DIRECTORY_NAME,
} from './ffmpeg.js';

const upload = multer({
    dest: `${FFMPEG_TMP_ROOT_NAME}/${FFMPEG_VIDEO_UPLOAD_DIRECTORY_NAME}/`,
});
const uploadDithered = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(
                null,
                `${FFMPEG_TMP_ROOT_NAME}/${DITHERED_IMAGES_DIRECTORY_NAME}/`
            );
        },
        filename: function (req, file, cb) {
            // TODO sanitize filename to remove forward slashes
            cb(null, file.originalname);
        },
    }),
});

const FFMPEG_OUTPUT_URL_BASE = '/output/ffmpeg';
const FFMPEG_RAW_URL_BASE = '/raw/ffmpeg';

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
    const start = performance.now();
    videoToFrames(req.file.path, req.body.fps, req.body.videoDuration).then(
        imageFilePaths => {
            const end = performance.now();
            console.log(
                styleText(
                    'green',
                    `\nVideo to frames finished after ${
                        (end - start) / 1000
                    }s\n`
                )
            );
            res.json(
                imageFilePaths.map(name => ({
                    name,
                    url: `${FFMPEG_RAW_URL_BASE}/${name}`,
                }))
            );
        }
    );
});

app.post('/api/ffmpeg/image', uploadDithered.single('image'), (req, res) => {
    return res.json({ code: 200 });
});

app.post('/api/ffmpeg/frames-to-video', (req, res) => {
    const start = performance.now();
    framesToVideo(req.body.fps, req.body.imageExtension).then(videoName => {
        const end = performance.now();
        console.log(
            styleText(
                'green',
                `\nFrames to video finished after ${(end - start) / 1000}s\n`
            )
        );
        res.json({
            url: `${FFMPEG_OUTPUT_URL_BASE}/${videoName}`,
        });
    });
});

app.use(
    FFMPEG_RAW_URL_BASE,
    express.static(FFMPEG_RAW_IMAGE_DIRECTORY, { index: false })
);

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
