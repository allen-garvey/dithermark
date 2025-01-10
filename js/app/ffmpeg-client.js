import { getSaveImageFileTypes } from './models/export-model.js';
import { getFileExtension } from './path.js';

const saveImageFileTypes = getSaveImageFileTypes();

/**
 *
 * @param {File} videoFile
 * @param {number} fps
 * @param {number} videoDuration
 * @returns {Promise<File[]>}
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
        .then(imageUrls => {
            const imageFilePromises = imageUrls.map(fileName => {
                const fileExtension = getFileExtension(fileName);
                return fetch(`/raw/ffmpeg/${fileName}`)
                    .then(res => res.blob())
                    .then(
                        blob =>
                            new File([blob], fileName, {
                                type: saveImageFileTypes.find(
                                    fileType =>
                                        fileType.extension === fileExtension
                                ).mime,
                            })
                    );
            });

            return Promise.all(imageFilePromises);
        });
};
