import { isiOs } from './cross-platform.js';

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

    // https://caniuse.com/mdn-api_htmlcanvaselement_toblob_type_parameter_webp
    if (!isiOs()) {
        types.push({
            label: 'webp\xa0(lossless)',
            mime: 'image/webp',
            extension: '.webp',
            value: 'webp_lossless',
        });
    }

    return types;
};
