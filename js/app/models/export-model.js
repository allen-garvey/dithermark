import { isiOs } from '../cross-platform.js';

/**
 * @typedef {Object} FileType
 * @property {string} label label to be displayed
 * @property {string} mime mime type
 * @property {string} extension file extension including dot
 * @property {string} value unique key
 */

// https://caniuse.com/mdn-api_htmlcanvaselement_toblob_type_parameter_webp
export const isWebpExportSupported = !isiOs();

/**
 *
 * @returns {FileType[]}
 */
export const getSaveImageFileTypes = () => {
    const types = [
        {
            label: 'png',
            mime: 'image/png',
            extension: '.png',
            value: 'png',
        },
        {
            label: 'jpeg',
            mime: 'image/jpeg',
            extension: '.jpg',
            value: 'jpeg',
        },
    ];

    if (isWebpExportSupported) {
        types.push({
            label: 'webp\xa0(lossless)',
            mime: 'image/webp',
            extension: '.webp',
            value: 'webp_lossless',
        });
    }

    return types;
};
