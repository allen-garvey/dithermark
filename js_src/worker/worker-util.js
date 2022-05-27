import WorkerHeaders from '../shared/worker-headers.js';
import Pixel from '../shared/pixel.js';
import Polyfills from '../shared/polyfills.js';

//based on: https://stackoverflow.com/questions/10100798/whats-the-most-straightforward-way-to-copy-an-arraybuffer-object
function copyBufferWithMessageType(pixelBufferOriginal, messageTypeId, imageId){
    //faster than using for loop
    const copiedBuffer = new Polyfills.SharedArrayBuffer(pixelBufferOriginal.byteLength + 2);
    const copiedPixels = new Uint8Array(copiedBuffer);
    
    //add messagetypeid to start of pixelbuffer
    copiedPixels[0] = imageId;
    copiedPixels[1] = messageTypeId;
    const copiedPixelsSubarray = copiedPixels.subarray(2, copiedPixels.length);
    copiedPixelsSubarray.set(new Uint8Array(pixelBufferOriginal));
    
    return {buffer: copiedBuffer, pixels: copiedPixelsSubarray};
}

function createOptimizePaletteBuffer(imageId, colors, messageTypeId, colorQuantizationModeId){
    //faster than using for loop
    const buffer = new Polyfills.SharedArrayBuffer(colors.length + 3);
    const array = new Uint8Array(buffer);
    
    array[0] = imageId;
    array[1] = messageTypeId;
    array[2] = colorQuantizationModeId;
    const copiedPixelsSubarray = array.subarray(3, array.length);
    copiedPixelsSubarray.set(colors);
    
    return buffer;
}

//percent done is integer 1-100
function createOptimizePaletteProgressBuffer(imageId, colorQuantizationModeId, colorCount, percentage){
    const buffer = new Polyfills.SharedArrayBuffer(5);
    const array = new Uint8Array(buffer);
    array[0] = imageId;
    array[1] = WorkerHeaders.OPTIMIZE_PALETTE_PROGRESS;
    array[2] = colorQuantizationModeId;
    array[3] = colorCount;
    array[4] = percentage;
    
    return buffer;
}

function createHistogramBuffer(length, messageTypeId, imageId){
    const buffer = new Polyfills.SharedArrayBuffer(length + 2);
    const fullArray = new Uint8Array(buffer);
    
    fullArray[0] = imageId;
    fullArray[1] = messageTypeId;
    const histogramArray = fullArray.subarray(2, fullArray.length);
    
    return {buffer: buffer, array: histogramArray};
}

export default {
    copyBufferWithMessageType,
    createHistogramBuffer,
    createOptimizePaletteBuffer,
    createOptimizePaletteProgressBuffer,
};
