import WorkerHeaders from '../shared/worker-headers.js';
import Polyfills from '../shared/polyfills.js';

//based on: https://stackoverflow.com/questions/10100798/whats-the-most-straightforward-way-to-copy-an-arraybuffer-object
function copyPixels(pixelBufferOriginal){
    //faster than using for loop
    const copiedBuffer = new Polyfills.SharedArrayBuffer(pixelBufferOriginal.byteLength);
    const copiedPixels = new Uint8Array(copiedBuffer);
    copiedPixels.set(new Uint8Array(pixelBufferOriginal));
    
    return copiedPixels;
}

function createDitherResponse(imageId, messageTypeId, pixels){
    return {
        imageId,
        messageTypeId,
        pixels,
    };
}

function createOptimizePaletteBuffer(imageId, colors, messageTypeId, colorQuantizationModeId){
    return {
        imageId,
        messageTypeId,
        colorQuantizationModeId,
        numColors: colors.length / 3,
        colors,
    };
}

//percent done is integer 1-100
function createOptimizePaletteProgressBuffer(imageId, colorQuantizationModeId, numColors, percentage){
    return {
        imageId,
        messageTypeId: WorkerHeaders.OPTIMIZE_PALETTE_PROGRESS,
        colorQuantizationModeId,
        numColors,
        percentage,
    };
}

function createHistogramBuffer(length){
    const buffer = new Polyfills.SharedArrayBuffer(length);
    return new Uint8Array(buffer);
}

export default {
    copyPixels,
    createDitherResponse,
    createHistogramBuffer,
    createOptimizePaletteBuffer,
    createOptimizePaletteProgressBuffer,
};
