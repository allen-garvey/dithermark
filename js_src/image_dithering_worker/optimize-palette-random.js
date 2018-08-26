/**
 * Random palette color quantization
 */

import ArrayUtil from '../shared/array-util.js';


function randomPalette(_pixels, numColors, _colorQuantization, _imageWidth, _imageHeight){
    return ArrayUtil.create(numColors * 3, ()=>{
        return Math.round(Math.random() * 255);
    }, Uint8Array);
}

export default {
    random: randomPalette,
};
