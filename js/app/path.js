/**
 *
 * @param {string} filename
 * @returns {string}
 */
export const getFilenameWithoutExtension = filename =>
    filename.replace(/\..+$/, '');

/**
 *
 * @param {string} path
 * @returns {string}
 */
export const getFileExtension = path => {
    const dotIndex = path.lastIndexOf('.');
    return dotIndex === -1 ? '' : path.slice(dotIndex);
};
