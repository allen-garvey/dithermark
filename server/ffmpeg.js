import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FFMPEG_RAW_DIRECTORY = path.join(__dirname, '..', 'tmp2');

export const videoToFrames = (videoPath, fps, duration) => {
    const framesPattern = Math.max(
        Math.ceil(Math.log10(Math.ceil(parseInt(fps) * parseInt(duration)))),
        2
    );

    return new Promise((resolve, reject) => {
        const ffmpeg = spawn(
            'ffmpeg',
            [
                '-i',
                path.join(__dirname, '..', videoPath),
                '-vf',
                `fps=${fps}`,
                `${FFMPEG_RAW_DIRECTORY}/%0${framesPattern}d.jpg`,
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

            resolve(code);
        });
    });
};
