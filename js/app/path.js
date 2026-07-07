/**
 *
 * @param {string} filename
 * @returns {string}
 */
export const getFilenameWithoutExtension = filename => {
    const dotIndex = filename.lastIndexOf('.');
    return dotIndex === -1 ? filename : filename.substring(0, dotIndex);
};

/**
 *
 * @param {string} path
 * @returns {string}
 */
export const getFileExtension = path => {
    const dotIndex = path.lastIndexOf('.');
    return dotIndex === -1 ? '' : path.slice(dotIndex);
};
