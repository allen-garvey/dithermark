import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const FFMPEG_RAW_DIRECTORY = path.join(__dirname, '..', 'tmp');
export const FFMPEG_OUTPUT_DIRECTORY = path.join(__dirname, '..', 'tmp-output');
const OUTPUT_VIDEO_NAME = 'video.mp4';
const OUTPUT_VIDEO_PATH = path.join(FFMPEG_OUTPUT_DIRECTORY, OUTPUT_VIDEO_NAME);
const IMAGE_EXTENSION = '.jpg';
const RAW_AUDIO_NAME = 'audio.m4a';
const RAW_AUDIO_PATH = path.join(FFMPEG_RAW_DIRECTORY, RAW_AUDIO_NAME);

export const DITHERED_IMAGES_DIRECTORY_NAME = 'uploads-dithered';
const DITHERED_IMAGES_DIRECTORY_PATH = path.join(
    __dirname,
    '..',
    DITHERED_IMAGES_DIRECTORY_NAME
);

/**
 *
 * @param {string[]} args
 * @returns {Promise<number>}
 */
const ffmpegExecute = args =>
    new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', args, {
            cwd: path.join(__dirname, '..', 'tmp'),
        });

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

/**
 * @returns {Promise}
 */
const cleanUpRawFiles = () =>
    fs.readdir(FFMPEG_RAW_DIRECTORY).then(filePaths => {
        const cleanUpFilesPromises = filePaths
            .filter(
                filePath =>
                    filePath.endsWith(IMAGE_EXTENSION) ||
                    filePath === RAW_AUDIO_NAME
            )
            .map(filePath =>
                fs.unlink(path.join(FFMPEG_RAW_DIRECTORY, filePath))
            );

        return Promise.all(cleanUpFilesPromises);
    });

/**
 *
 * @returns {Promise<boolean>}
 */
const doesAudioFileExist = () =>
    fs
        .access(RAW_AUDIO_PATH, fs.constants.R_OK)
        .then(() => true)
        .catch(() => false);

/**
 *
 * @param {string} videoPath
 * @param {number} fps
 * @param {number} duration
 * @returns {Promise<string[]>}
 */
export const videoToFrames = (videoPath, fps, duration) => {
    const framesPattern = Math.max(
        Math.ceil(Math.log10(Math.ceil(parseInt(fps) * parseInt(duration)))),
        2
    );

    const videoInputPath = path.join(__dirname, '..', videoPath);

    return cleanUpRawFiles()
        .then(() =>
            ffmpegExecute([
                '-i',
                videoInputPath,
                '-vf',
                `fps=${fps}`,
                `${FFMPEG_RAW_DIRECTORY}/%0${framesPattern}d${IMAGE_EXTENSION}`,
            ])
        )
        .then(code => {
            if (code === 0) {
                return ffmpegExecute([
                    '-i',
                    videoInputPath,
                    '-vn',
                    '-acodec',
                    'copy',
                    RAW_AUDIO_PATH,
                ]);
            }
        })
        .then(code => {
            if (code === 0) {
                return fs.unlink(videoInputPath);
            }
        })
        .then(() => fs.readdir(FFMPEG_RAW_DIRECTORY))
        .then(files => files.filter(file => file.endsWith(IMAGE_EXTENSION)));
};

/**
 *
 * @param {number} fps
 * @returns {Promise<string>}
 */
export const framesToVideo = fps =>
    fs
        .unlink(OUTPUT_VIDEO_PATH)
        .then(() => doesAudioFileExist())
        .then(hasAudio => {
            let args = [
                '-framerate',
                `${fps}`,
                '-f',
                'image2',
                '-pattern_type',
                'glob',
                '-i',
                `${DITHERED_IMAGES_DIRECTORY_PATH}/*${IMAGE_EXTENSION}`,
            ];

            if (hasAudio) {
                args = args.concat(['-i', RAW_AUDIO_PATH, '-c:a', 'copy']);
            }

            args = args.concat([
                '-vf',
                `format=yuv420p, pad=ceil(iw/2)*2:ceil(ih/2)*2`,
                '-vcodec',
                'libx264',
                // '-acodec',
                // 'aac',
                OUTPUT_VIDEO_PATH,
            ]);

            return ffmpegExecute(args);
        })
        .then(code => {
            return cleanUpRawFiles().then(() =>
                code === 0 ? OUTPUT_VIDEO_NAME : ''
            );
        });
