import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const FFMPEG_RAW_DIRECTORY = path.join(__dirname, '..', 'tmp');
const IMAGE_EXTENSION = '.jpg';

export const videoToFrames = (videoPath, fps, duration) => {
    const framesPattern = Math.max(
        Math.ceil(Math.log10(Math.ceil(parseInt(fps) * parseInt(duration)))),
        2
    );

    const videoInputPath = path.join(__dirname, '..', videoPath);

    return fs
        .readdir(FFMPEG_RAW_DIRECTORY)
        .then(filePaths => {
            const cleanUpFilesPromises = filePaths
                .filter(filePath => filePath.endsWith(IMAGE_EXTENSION))
                .map(filePath =>
                    fs.unlink(path.join(FFMPEG_RAW_DIRECTORY, filePath))
                );

            return Promise.all(cleanUpFilesPromises);
        })
        .then(() => {
            return new Promise((resolve, reject) => {
                const ffmpeg = spawn(
                    'ffmpeg',
                    [
                        '-i',
                        videoInputPath,
                        '-vf',
                        `fps=${fps}`,
                        `${FFMPEG_RAW_DIRECTORY}/%0${framesPattern}d${IMAGE_EXTENSION}`,
                    ],
                    { cwd: path.join(__dirname, '..', 'tmp') }
                );

                ffmpeg.stdout.on('data', data => {
                    console.log(data.toString());
                });

                ffmpeg.stderr.on('data', data => {
                    console.error(data.toString());
                });

                ffmpeg.on('close', code => {
                    console.log(`ffmpeg exited with code ${code}`);

                    resolve([code, videoInputPath]);
                });
            });
        })
        .then(([code, videoInputPath]) => {
            if (code === 0) {
                return fs.unlink(videoInputPath);
            }
        })
        .then(() => fs.readdir(FFMPEG_RAW_DIRECTORY))
        .then(files => files.filter(file => file.endsWith(IMAGE_EXTENSION)));
};
