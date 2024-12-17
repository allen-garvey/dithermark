/**
 *
 * @param {string} filename
 * @returns {string}
 */
export const getFilenameWithoutExtension = filename =>
    filename.replace(/\..+$/, '');
