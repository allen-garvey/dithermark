/**
 * Random palette color quantization
 */

import { fillArray } from '../../shared/array-util.js';

function randomPalette(
    _pixels,
    numColors,
    _colorQuantization,
    _imageWidth,
    _imageHeight
) {
    return fillArray(new Uint8Array(numColors * 3), () =>
        Math.round(Math.random() * 255)
    );
}

export default {
    random: randomPalette,
};
