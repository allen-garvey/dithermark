const FFMPEG_EXPORT_DIRECTORY = '/tmp/export';

/**
 *
 * @param {import("../../node_modules/@ffmpeg/ffmpeg/dist/esm/classes").FFmpeg} ffmpeg
 * @returns {Promise<boolean>}
 */
export const initializeFfmpeg = ffmpeg =>
    ffmpeg.load().then(() => ffmpeg.createDir(FFMPEG_EXPORT_DIRECTORY));

/**
 *
 * @param {import("../../node_modules/@ffmpeg/ffmpeg/dist/esm/classes").FFmpeg} ffmpeg
 * @param {string} filename
 * @param {Uint8Array} data
 * @returns {Promise}
 */
export const saveImageFrame = (ffmpeg, filename, data) =>
    ffmpeg.writeFile(`${FFMPEG_EXPORT_DIRECTORY}/${filename}`, data);

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
    const exportFilePath = `${FFMPEG_EXPORT_DIRECTORY}/${exportFilename}`;

    return ffmpeg
        .exec([
            '-framerate',
            `${fps}`, // for some reason ffmpeg will fail if fps is not a string
            '-f',
            'image2',
            '-i',
            `${FFMPEG_EXPORT_DIRECTORY}/%4d${imageFileExtension}`,
            exportFilePath,
        ])
        .then(errorCode => {
            console.log(`ffmpeg return value ${errorCode}`);
            return ffmpeg.listDir(FFMPEG_EXPORT_DIRECTORY);
        })
        .then(contents => console.log(contents))
        .then(() => ffmpeg.readFile(exportFilePath));
};
