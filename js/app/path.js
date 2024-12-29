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
    const split = path.split('.');
    const extension = split[split.length - 1];
    return extension ? `.${extension}` : '';
};
