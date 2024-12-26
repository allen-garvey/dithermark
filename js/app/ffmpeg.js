import { fileToArray } from './fs.js';

const FFMPEG_RAW_DIRECTORY = '/tmp/raw';
const FFMPEG_DITHERED_DIRECTORY = '/tmp/dithered';

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
 * @param {string} imageFileExtension
 * @returns {Promise<string[]>}
 */
export const videoToFrames = (ffmpeg, file, fps, imageFileExtension) => {
    const importedVideoPath = `${FFMPEG_RAW_DIRECTORY}/${file.name}`;
    return fileToArray(file)
        .then(data => ffmpeg.writeFile(importedVideoPath, data))
        .then(() =>
            ffmpeg.exec([
                '-i',
                importedVideoPath,
                '-vf',
                `fps=${fps}`,
                // TODO use video duration to figure how many digits in filename pattern
                `${FFMPEG_RAW_DIRECTORY}/%04d${imageFileExtension}`,
            ])
        )
        .then(errorCode => {
            console.log(`ffmpeg return value ${errorCode}`);
            return ffmpeg.deleteFile(importedVideoPath);
        })
        .then(() => ffmpeg.listDir(FFMPEG_RAW_DIRECTORY))
        .then(files =>
            files
                .filter(file => !file.isDir)
                .map(file => `${FFMPEG_RAW_DIRECTORY}/${file.name}`)
        );
};

/**
 *
 * @param {import("../../node_modules/@ffmpeg/ffmpeg/dist/esm/classes").FFmpeg} ffmpeg
 * @param {string} exportFilename
 * @param {number} fps
 * @param {string} imageFileExtension
 * @returns {Promise<import("../../node_modules/@ffmpeg/ffmpeg/dist/esm/types").FileData>}
 */
export const exportFramesToVideo = (
    ffmpeg,
    exportFilename,
    fps,
    imageFileExtension
) => {
    const exportFilePath = `${FFMPEG_DITHERED_DIRECTORY}/${exportFilename}`;

    return ffmpeg
        .exec([
            '-framerate',
            `${fps}`, // for some reason ffmpeg will fail if fps is not a string
            '-f',
            'image2',
            '-pattern_type',
            'glob',
            '-i',
            `${FFMPEG_DITHERED_DIRECTORY}/*${imageFileExtension}`,
            // filter has to be after image source
            '-filter:v',
            `format=pix_fmts='yuv420p'`,
            '-vf',
            'pad=ceil(iw/2)*2:ceil(ih/2)*2',
            exportFilePath,
        ])
        .then(errorCode => {
            // console.log(`ffmpeg return value ${errorCode}`);
            return ffmpeg.readFile(exportFilePath);
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
