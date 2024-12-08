/**
 * Shared functions used by optimize palette algorithms
 */

import { createArray } from '../../shared/array-util.js';
import PixelMath from '../../shared/pixel-math.js';

//turns JavaScript array of pixels into a single Uint8Array
//need palette count for octree, since length of pixelArray
//might be less than number of colors returned
function pixelArrayToBuffer(pixelArray, paletteCount = 0) {
    let ret = new Uint8Array(Math.max(pixelArray.length, paletteCount) * 3);
    for (let i = 0, offset = 0; i < pixelArray.length; i++, offset += 3) {
        const pixel = pixelArray[i];
        ret[offset] = pixel[0];
        ret[offset + 1] = pixel[1];
        ret[offset + 2] = pixel[2];
    }

    return ret;
}

//sorts Float32Array of pixels using counting sort algorithm
function countingSort32(array, valueFunc) {
    const valueMap = createArray(256, () => []);
    array.forEach(value => {
        valueMap[valueFunc(value)].push(value);
    });
    let arrayIndex = 0;
    valueMap.forEach(subarray => {
        subarray.forEach(value => {
            array[arrayIndex++] = value;
        });
    });
    return array;
}

//sorts Uint8 or Uint8Clamped array of pixels by pixelValueFunc
//32bit pixel manipulation from rgb quant
function sortPixelBuffer(pixels, pixelValueFunc) {
    const pixel1Buffer = new Uint8Array(3);
    const pixel2Buffer = new Uint8Array(3);
    const buffer32 = new Uint32Array(pixels.buffer);
    buffer32.sort((a32, b32) => {
        loadPixelBuffer(a32, pixel1Buffer);
        loadPixelBuffer(b32, pixel2Buffer);
        return pixelValueFunc(pixel1Buffer) - pixelValueFunc(pixel2Buffer);
    });

    return buffer32;
}

function pixelBuffer32ToPixelBuffer8(buffer32) {
    return new Uint8Array(buffer32.buffer);
}

//no loading of alpha, since we are not using it
function loadPixelBuffer(color32, pixelBuffer) {
    pixelBuffer[0] = PixelMath.color32Red(color32);
    pixelBuffer[1] = PixelMath.color32Green(color32);
    pixelBuffer[2] = PixelMath.color32Blue(color32);
    // if(pixelBuffer.length > 3){
    //     pixelBuffer[3] = PixelMath.color32Alpha(color32);
    // }
}

export default {
    pixelArrayToBuffer,
    countingSort32,
    sortPixelBuffer,
    pixelBuffer32ToPixelBuffer8,
    loadPixelBuffer,
};
