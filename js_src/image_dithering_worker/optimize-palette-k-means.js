
import ColorDitherModes from '../shared/color-dither-modes.js';
import ColorDitherModeFunctions from './color-dither-mode-functions.js';
import OptimizePalettePerceptual from './optimize-palette-perceptual';
import PixelMath from '../shared/pixel-math.js';
import Util from './optimize-palette-util.js';


function bufferToPixelArray(buffer){
    const numItems = buffer.length / 3;
    const ret = new Array(numItems)
    for(let i=0,baseIndex=0;i<numItems;i++,baseIndex+=3){
        ret[i] = buffer.subarray(baseIndex, baseIndex + 3);
    }
    return ret;
}

function findClosestPaletteIndex(pixel, palette, distanceFunc){
    let shortestDistance = Infinity;
    let closestPaletteIndex = 0;

    palette.forEach((color, index)=>{
        const currentDistance = distanceFunc(pixel, color);
        if(currentDistance < shortestDistance){
            shortestDistance = currentDistance;
            closestPaletteIndex = index;
        }
    });

    return closestPaletteIndex;
}
function convergeMeans(paletteBuffer, meansBuffer, numColors){
    let hasConverged = true;
    for(let i=0, paletteBufferIndexOffset=0,meansBufferIndexOffset=0;i<numColors;i++,paletteBufferIndexOffset+=3,meansBufferIndexOffset+=4){
        const numPixels = meansBuffer[meansBufferIndexOffset+3];
        for(let j=0;j<3;j++){
            const mean = Math.round(meansBuffer[meansBufferIndexOffset + j] / numPixels);
            const paletteIndex = paletteBufferIndexOffset + j;
            hasConverged = hasConverged && mean === paletteBuffer[paletteIndex];
            paletteBuffer[paletteIndex] = mean;
        }
    }

    return hasConverged;
}

//creates histogram of unique colors
//improvement from https://arxiv.org/abs/1101.0395 to reduce number of distance calculations
//32 bit pixel manipulation from rgb quant
function createColorHistogram(pixels){
    const buf32 = new Uint32Array(pixels.buffer);
    const histogram = new Map();
    const length = buf32.length;
    
    for(let i=0;i<length;i++){
        const color32 = buf32[i];

        // skip transparent
        if(PixelMath.color32Alpha(color32) === 0){
            continue;
        }
        //technically we are not normalizing the transparency values,
        //however this does not effect accuracy, it just means for semi-transparent values
        //we might be doing a little extra unneeded work
        const previousValue = histogram.get(color32) || 0;
        histogram.set(color32, previousValue + 1);
    }
    return histogram; 
}

//wide and narrow initialization generally return similar results, the reason why there is an option is because
//for mostly black and white images with few colors, wide is better.
//also on chrome, wide is generally 2x faster, however on firefox, where perceptual median cut is much slower, narrow is 2x faster
function kMeans(pixels, numColors, colorQuantization, imageWidth, imageHeight, progressCallback){
    //artiquant 2 balanced used instead of artiquant 3 balanced since it is slightly faster
    //with negligible loss is quality
    //using neuquant with sample 30 and networkSize 64 (super low) is 2x faster by itself, but when used with k-means ends up taking nearly exactly the same time, and the quality is sometimes better, but mostly not
    const paletteBuffer = OptimizePalettePerceptual.medianCut(pixels, numColors, {'hueMix': 1.6}, imageWidth, imageHeight);
    const palette = bufferToPixelArray(paletteBuffer);
    const colorDitherModeKey = colorQuantization.distanceLuma ? 'LUMA' : 'RGB';
    const distanceFunc = ColorDitherModeFunctions[ColorDitherModes.get(colorDitherModeKey).id].distance;
    const meansBuffer = new Float32Array(4 * numColors);
    const colorHistogram = createColorHistogram(pixels);

    progressCallback(10);

    //generally converges in at most 59 iterations, and usually around 20
    //if it needs to go longer than 64, that generally doesn't result in noticeable improvement anyway
    const maximumIterations = 64;
    const halfway = Math.floor(maximumIterations / 2);
    const pixelBuffer = new Uint8ClampedArray(3);
    for(let currentIteration=0,hasConverged=false;!hasConverged && currentIteration<maximumIterations;currentIteration++){
        colorHistogram.forEach((count, color32)=>{
            Util.loadPixelBuffer(color32, pixelBuffer);

            const paletteIndex = findClosestPaletteIndex(pixelBuffer, palette, distanceFunc);
            const meansBufferIndexOffset = paletteIndex * 4;
            for(let j=0;j<3;j++){
                meansBuffer[meansBufferIndexOffset+j] += pixelBuffer[j] * count;
            }
            meansBuffer[meansBufferIndexOffset+3] += count;
        });
        hasConverged = convergeMeans(paletteBuffer, meansBuffer, numColors);
        if(currentIteration === halfway){
            progressCallback(50);
        }
        meansBuffer.fill(0);
    }

    return paletteBuffer;
}


export default {
    kMeans
};