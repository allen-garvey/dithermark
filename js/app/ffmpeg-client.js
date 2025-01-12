import { getSaveImageFileTypes } from './models/export-model.js';
import { getFileExtension } from './path.js';

const saveImageFileTypes = getSaveImageFileTypes();

/**
 *
 * @param {string} name
 * @param {string} url
 * @returns {Promise<File>}
 */
const fetchRawImage = (name, url) => {
    const fileExtension = getFileExtension(name);
    return fetch(url)
        .then(res => res.blob())
        .then(
            blob =>
                new File([blob], name, {
                    type: saveImageFileTypes.find(
                        fileType => fileType.extension === fileExtension
                    ).mime,
                })
        );
};

/**
 *
 * @param {File} videoFile
 * @param {number} fps
 * @param {number} videoDuration
 * @returns {Promise<Array<() => Promise>>}
 */
export const ffmpegClientVideoToImages = (videoFile, fps, videoDuration) => {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('fps', `${fps}`);
    formData.append('videoDuration', `${videoDuration}`);
    return fetch('/api/ffmpeg/video-to-frames', {
        method: 'POST',
        body: formData,
    })
        .then(res => res.json())
        .then(imageData =>
            imageData.map(imageData => {
                return () => fetchRawImage(imageData.name, imageData.url);
            })
        );
};

/**
 *
 * @param {File} imageFile
 * @returns {Promise}
 */
export const ffmpegClientSaveImage = imageFile => {
    const formData = new FormData();
    formData.append('image', imageFile);

    return fetch('/api/ffmpeg/image', {
        method: 'POST',
        body: formData,
    });
};

/**
 *
 * @param {number} fps
 * @param {string} imageExtension e.g. .jpg or .webp
 * @returns {Promise<Blob>}
 */
export const ffmpegClientFramesToVideo = (fps, imageExtension) => {
    return fetch('/api/ffmpeg/frames-to-video', {
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ fps, imageExtension }),
    })
        .then(res => res.json())
        .then(res => fetch(res.url))
        .then(res => res.blob());
};
