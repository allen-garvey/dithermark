import { fileToArray } from './fs.js';
import {
    getSaveImageFileTypes,
    isWebpExportSupported,
} from './models/export-model.js';
import { getFileExtension } from './path.js';

const FFMPEG_RAW_DIRECTORY = '/tmp/raw';
const FFMPEG_DITHERED_DIRECTORY = '/tmp/dithered';
const FFMPEG_AUDIO_FILE_NAME = 'audio.m4a';
const FFMPEG_AUDIO_FILE = `${FFMPEG_DITHERED_DIRECTORY}/${FFMPEG_AUDIO_FILE_NAME}`;
const FFMPEG_VIDEO_OUTPUT_FILE = `${FFMPEG_DITHERED_DIRECTORY}/movie.mp4`;

const exportFileTypeValue = isWebpExportSupported ? 'webp_lossless' : 'png';
export const ffmpegImageFileType = getSaveImageFileTypes().find(
    fileType => fileType.value === exportFileTypeValue
);

const ffmpegRawImageFileType = getSaveImageFileTypes().find(
    fileType => fileType.value === 'jpeg'
);

const IMAGE_FILE_EXTENSION = ffmpegImageFileType.extension;
const RAW_IMAGE_FILE_EXTENSION = ffmpegRawImageFileType.extension;
const RAW_IMAGE_MIME = ffmpegRawImageFileType.mime;

/**
 *
 * @param {import("../../node_modules/@ffmpeg/ffmpeg/dist/esm/classes").FFmpeg} ffmpeg
 * @returns {Promise<boolean>}
 */
export const initializeFfmpeg = ffmpeg =>
    ffmpeg
        .load()
        .then(() =>
            Promise.all([
                ffmpeg.createDir(FFMPEG_DITHERED_DIRECTORY),
                ffmpeg.createDir(FFMPEG_RAW_DIRECTORY),
            ]).then(results => results.every(value => value))
        );

/**
 *
 * @param {import("../../node_modules/@ffmpeg/ffmpeg/dist/esm/classes").FFmpeg} ffmpeg
 * @param {string} filename
 * @param {Uint8Array} data
 * @returns {Promise}
 */
export const saveImageFrame = (ffmpeg, filename, data) =>
    ffmpeg.writeFile(`${FFMPEG_DITHERED_DIRECTORY}/${filename}`, data);

/**
 *
 * @param {import("../../node_modules/@ffmpeg/ffmpeg/dist/esm/classes").FFmpeg} ffmpeg
 * @param {File} file
 * @param {number} fps
 * @param {number} duration video duration in seconds
 * @param {boolean} useAudio
 * @returns {Promise<File[]>}
 */
export const videoToFrames = (ffmpeg, file, fps, duration, useAudio) => {
    const importedVideoPath = `${FFMPEG_RAW_DIRECTORY}/movie${getFileExtension(
        file.name
    )}`;
    const framesPattern = Math.max(
        Math.ceil(Math.log10(Math.ceil(fps * duration))),
        2
    );

    return fileToArray(file)
        .then(data => ffmpeg.writeFile(importedVideoPath, data))
        .then(() =>
            ffmpeg
                .exec([
                    '-i',
                    importedVideoPath,
                    '-vf',
                    `fps=${fps}`,
                    `${FFMPEG_RAW_DIRECTORY}/%0${framesPattern}d${RAW_IMAGE_FILE_EXTENSION}`,
                ])
                .then(code => [null, code])
        )
        .catch(errorRaw => {
            const error =
                typeof errorRaw === 'string' ? new Error(errorRaw) : errorRaw;
            return [error, -1];
        })
        .then(([error, code]) => {
            console.log(`ffmpeg video to frames return value ${code}`);

            if (!error && code === 0 && useAudio) {
                return ffmpeg
                    .exec([
                        '-i',
                        importedVideoPath,
                        '-vn',
                        '-acodec',
                        'copy',
                        FFMPEG_AUDIO_FILE,
                    ])
                    .then(code => {
                        console.log(
                            `ffmpeg extract audio return value ${code}`
                        );
                        return [error, code];
                    });
            }
            return [error, code];
        })
        .then(result => {
            return ffmpeg.deleteFile(importedVideoPath).then(() => result);
        })
        .then(([error, code]) => {
            if (error) {
                throw error;
            }

            return ffmpeg.listDir(FFMPEG_RAW_DIRECTORY).then(files => {
                const filesPromises = files
                    .filter(file => !file.isDir)
                    .map(file => {
                        const imagePath = `${FFMPEG_RAW_DIRECTORY}/${file.name}`;

                        return ffmpeg.readFile(imagePath).then(data => {
                            const retFile = new File([data], file.name, {
                                type: RAW_IMAGE_MIME,
                            });

                            return ffmpeg
                                .deleteFile(imagePath)
                                .then(() => retFile);
                        });
                    });
                return Promise.all(filesPromises);
            });
        });
};

/**
 *
 * @param {import("../../node_modules/@ffmpeg/ffmpeg/dist/esm/classes").FFmpeg} ffmpeg
 * @param {number} fps
 * @returns {Promise<import("../../node_modules/@ffmpeg/ffmpeg/dist/esm/types").FileData>}
 */
export const exportFramesToVideo = (ffmpeg, fps) => {
    return ffmpeg
        .listDir(FFMPEG_DITHERED_DIRECTORY)
        .then(files => {
            const hasAudio =
                files.findIndex(
                    file => file.name === FFMPEG_AUDIO_FILE_NAME
                ) !== -1;

            let args = [
                '-framerate',
                `${fps}`, // for some reason ffmpeg will fail if fps is not a string
                '-f',
                'image2',
                '-pattern_type',
                'glob',
                '-i',
                `${FFMPEG_DITHERED_DIRECTORY}/*${IMAGE_FILE_EXTENSION}`,
            ];

            if (hasAudio) {
                args = args.concat(['-i', FFMPEG_AUDIO_FILE, '-c:a', 'copy']);
            }

            args = args.concat([
                '-vf',
                `format=yuv420p, pad=ceil(iw/2)*2:ceil(ih/2)*2`,
                '-vcodec',
                'libx264',
                // '-acodec',
                // 'aac',
                FFMPEG_VIDEO_OUTPUT_FILE,
            ]);

            return ffmpeg.exec(args);
        })
        .then(errorCode => {
            console.log(`ffmpeg frames to video return value ${errorCode}`);
            return ffmpeg.readFile(FFMPEG_VIDEO_OUTPUT_FILE);
        })
        .then(data =>
            ffmpeg.listDir(FFMPEG_DITHERED_DIRECTORY).then(files => {
                const promises = files
                    .filter(file => !file.isDir)
                    .map(file =>
                        ffmpeg.deleteFile(
                            `${FFMPEG_DITHERED_DIRECTORY}/${file.name}`
                        )
                    );
                return (
                    Promise.all(promises)
                        // .then(() => ffmpeg.listDir(FFMPEG_EXPORT_DIRECTORY))
                        // .then(contents => console.log(contents))
                        .then(() => data)
                );
            })
        );
};
