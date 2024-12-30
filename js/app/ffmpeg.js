import { fileToArray } from './fs.js';
import { getSaveImageFileTypes } from './models/export-model.js';
import { getFileExtension } from './path.js';

const FFMPEG_RAW_DIRECTORY = '/tmp/raw';
const FFMPEG_DITHERED_DIRECTORY = '/tmp/dithered';
const FFMPEG_AUDIO_FILE = `${FFMPEG_DITHERED_DIRECTORY}/audio.m4a`;
const FFMPEG_VIDEO_OUTPUT_FILE = `${FFMPEG_DITHERED_DIRECTORY}/movie.mp4`;

export const ffmpegImageFileType = getSaveImageFileTypes().find(
    fileType => fileType.value === 'png'
);

export const ffmpegRawImageFileType = getSaveImageFileTypes().find(
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
 * @returns {Promise<File[]>}
 */
export const videoToFrames = (ffmpeg, file, fps) => {
    const importedVideoPath = `${FFMPEG_RAW_DIRECTORY}/movie${getFileExtension(
        file.name
    )}`;
    return fileToArray(file)
        .then(data => ffmpeg.writeFile(importedVideoPath, data))
        .then(() =>
            ffmpeg.exec([
                '-i',
                importedVideoPath,
                '-vf',
                `fps=${fps}`,
                // TODO use video duration to figure how many digits in filename pattern
                `${FFMPEG_RAW_DIRECTORY}/%04d${RAW_IMAGE_FILE_EXTENSION}`,
            ])
        )
        .then(errorCode => {
            console.log(`ffmpeg video to frames return value ${errorCode}`);

            return ffmpeg.exec([
                '-i',
                importedVideoPath,
                '-vn',
                '-acodec',
                'copy',
                FFMPEG_AUDIO_FILE,
            ]);
        })
        .then(errorCode => {
            console.log(`ffmpeg extract audio return value ${errorCode}`);
            return ffmpeg.deleteFile(importedVideoPath);
        })
        .then(() => ffmpeg.listDir(FFMPEG_RAW_DIRECTORY))
        .then(files => {
            const filesPromises = files
                .filter(file => !file.isDir)
                .map(file => {
                    const imagePath = `${FFMPEG_RAW_DIRECTORY}/${file.name}`;

                    return ffmpeg.readFile(imagePath).then(data => {
                        const retFile = new File([data], file.name, {
                            type: RAW_IMAGE_MIME,
                        });

                        return ffmpeg.deleteFile(imagePath).then(() => retFile);
                    });
                });
            return Promise.all(filesPromises);
        });
};

/**
 *
 * @param {import("../../node_modules/@ffmpeg/ffmpeg/dist/esm/classes").FFmpeg} ffmpeg
 * @param {number} fps
 * @param {boolean} hasAudio
 * @returns {Promise<import("../../node_modules/@ffmpeg/ffmpeg/dist/esm/types").FileData>}
 */
export const exportFramesToVideo = (ffmpeg, fps, hasAudio) => {
    let args = [
        '-framerate',
        `${fps}`, // for some reason ffmpeg will fail if fps is not a string
        '-f',
        'image2',
        '-pattern_type',
        'glob',
        '-i',
        `${FFMPEG_DITHERED_DIRECTORY}/*${IMAGE_FILE_EXTENSION}`,
        // filter has to be after image source
        '-vf',
        `format=yuv420p, pad=ceil(iw/2)*2:ceil(ih/2)*2`,
        '-vcodec',
        'libx264',
        // '-acodec',
        // 'aac',
        FFMPEG_VIDEO_OUTPUT_FILE,
    ];

    if (hasAudio) {
        args = args.concat(['-i', FFMPEG_AUDIO_FILE, '-c:a', 'copy']);
    }

    return ffmpeg
        .exec(args)
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
