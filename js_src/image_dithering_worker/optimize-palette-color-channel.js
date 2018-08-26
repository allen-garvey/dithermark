/**
 * The broad overview of how this algorithm works is to store the average of each pixel for each distinct hue
 * and each distinct lightness (lightness divided into buckets by the number of ouput palette colors), 
 * and then merge the values with the closest buckets by rgb or luma or least number of pixels to get our palette.
 * Conceptually similar to octree (when reducing by pixel count) or k-means (when reducing by rgb or luma distance), but much faster, since while the merging is slightly less effecient since it
 * involves nested loops O(n^2) actually reading the pixels is much faster and more efficient than octree, and only has to read the pixels once, unlike k-means, which has to re-read the pixels in each iteration of the loop.
 * Seems to work particularly well at preserving gradients
 */

import Image from './image.js';
import PixelMath from '../shared/pixel-math.js';


function ChannelStats(statsBuffer, count){
    this.buffer = statsBuffer;
    this.bucketIndexSet = createBucketIndexSet(statsBuffer);
    this.count = count;
}

function createBucketIndexSet(statsBuffer){
    const bucketIndexSet = new Set();
    const length = statsBuffer.length;
    for(let i=0,bucketIndex=0;i<length;i+=4,bucketIndex++){
        if(statsBuffer[i+3] === 0){
            continue;
        }
        bucketIndexSet.add(bucketIndex);
    }

    return bucketIndexSet;
}

function createImageChannels(pixels, numColors){
    const maxLightnessDiff = 127;
    const maxSaturationCubed = 1000000;

    const hueBuffer = new Float32Array(360 * 4);
    const numLightnessBuckets = Math.min(256, numColors);

    const lightnessBuffer = new Float32Array(numLightnessBuckets * 4);
    const lightnessFraction = 256 / numLightnessBuckets;

    const lightnessHistogram = new Float32Array(256 * 4);

    let pixelCount = 0;
    let hueCount = 0;
    let lightnessCount = 0;

    Image.forEachOpaquePixel(pixels, (pixel)=>{
        const hue = PixelMath.hue(pixel);
        const saturation = PixelMath.saturation(pixel);
        const lightness = PixelMath.lightness(pixel);

        //increment hue buffer
        //hue percentages from createHslPopularityMap in optimize palette perceptual
        const lightnessDiff = lightness >= 128 ? lightness - 128 : 127 - lightness;
        const hueCountFraction = saturation * saturation * saturation / maxSaturationCubed * ((maxLightnessDiff - lightnessDiff) / maxLightnessDiff);
        const hueIndex = hue * 4;
        hueBuffer[hueIndex]   += pixel[0] * hueCountFraction;
        hueBuffer[hueIndex+1] += pixel[1] * hueCountFraction;
        hueBuffer[hueIndex+2] += pixel[2] * hueCountFraction;
        hueBuffer[hueIndex+3] += hueCountFraction;
        hueCount += hueCountFraction;


        //increment lightness buffer
        const lightnessIndex = Math.floor(lightness / lightnessFraction) * 4;
        const lightnessCountFraction = 1 - hueCountFraction;
        lightnessBuffer[lightnessIndex]   += pixel[0] * lightnessCountFraction;
        lightnessBuffer[lightnessIndex+1] += pixel[1] * lightnessCountFraction;
        lightnessBuffer[lightnessIndex+2] += pixel[2] * lightnessCountFraction;
        lightnessBuffer[lightnessIndex+3] += lightnessCountFraction;
        lightnessCount += lightnessCountFraction;

        //increment lightness histgram, used for black and white values
        const lightnessHistogramIndex = lightness * 4;
        for(let i=0;i<3;i++){
            lightnessHistogram[lightnessHistogramIndex+i] += pixel[i];
        }
        lightnessHistogram[lightnessHistogramIndex+3]++;

        pixelCount++;
    });

    return {
        hueChannel: new ChannelStats(hueBuffer, hueCount),
        lightnessChannel: new ChannelStats(lightnessBuffer, lightnessCount),
        lightnessHistogram,
        pixelCount,
    }
}

function bucketIndexDistancePenaltyBuilder(shouldWrap, numDistinctValues){
    if(shouldWrap){
        return (smallerBucketKey, largerBucketKey, buffer)=>{ 
            return bucketIndexDistancePenalty(Math.min(smallerBucketKey + numDistinctValues - largerBucketKey, largerBucketKey - smallerBucketKey)); };
    }
    return (smallerBucketKey, largerBucketKey, buffer)=>{ 
        return bucketIndexDistancePenalty(largerBucketKey - smallerBucketKey); 
    };
}

function bucketIndexDistancePenalty(bucketIndexDistance){
    return Math.log2(bucketIndexDistance + 1);
}

function bucketPixelDistance(bucketIndex1, bucketIndex2, buffer, redMultiplier=1, greenMultiplier=1, blueMultiplier=1){
    const bucket1Offset = bucketIndex1 * 4;
    const bucket2Offset = bucketIndex2 * 4;
    const bucket1Count = buffer[bucket1Offset + 3];
    const bucket2Count = buffer[bucket2Offset + 3];
    
    const redDistance = (buffer[bucket1Offset] / bucket1Count) - (buffer[bucket2Offset] / bucket2Count);
    const greenDistance = (buffer[bucket1Offset+1] / bucket1Count) - (buffer[bucket2Offset+1] / bucket2Count);
    const blueDistance = (buffer[bucket1Offset+2] / bucket1Count) - (buffer[bucket2Offset+2] / bucket2Count);

    return redDistance * redDistance * redMultiplier + greenDistance * greenDistance * greenMultiplier + blueDistance * blueDistance * blueMultiplier;
}

function rgbDistancePenalty(bucketIndex1, bucketIndex2, buffer){
    return bucketPixelDistance(bucketIndex1, bucketIndex2, buffer);
}

function lumaDistancePenalty(bucketIndex1, bucketIndex2, buffer){
    return bucketPixelDistance(bucketIndex1, bucketIndex2, buffer, 0.299, 0.587, 0.114);
}

function getPenaltyFunc(penaltyFuncId, shouldWrap, numDistinctValues){
    switch(penaltyFuncId){
        case 1:
            return rgbDistancePenalty;
        case 2:
            return lumaDistancePenalty;
        default:
            return bucketIndexDistancePenaltyBuilder(shouldWrap, numDistinctValues);
    }
}
//returns maximum possible distance for each penalty
function getMaximumPenalty(penaltyFuncId, shouldWrap, numDistinctValues){
    switch(penaltyFuncId){
        case 1:
            return 255 * 255 * 3;
        case 2:
            return 255 * 255;
        default:
            return shouldWrap ? Math.floor(numDistinctValues / 2) : numDistinctValues;
    }
}

function reduceChannelBuckets(channelStats, reducedBucketCount, penaltyFuncId, shouldWrap=false){
    if(reducedBucketCount <= 0){
        channelStats.bucketIndexSet.clear();
        return;
    }

    //copy channel counts into single buffer, which makes logic of comparing counts easire
    //and improves memory adjacency
    const channelBuffer = channelStats.buffer;
    const numDistinctValues = channelBuffer.length / 4;
    const penaltyDistanceFunc = getPenaltyFunc(penaltyFuncId, shouldWrap, numDistinctValues);
    const maximumPenalty = getMaximumPenalty(penaltyFuncId, shouldWrap, numDistinctValues);

    const bucketCounts = new Float32Array(channelBuffer.length / 4);
    for(let i=3,bucketIndex=0;i<channelBuffer.length;i+=4,bucketIndex++){
        bucketCounts[bucketIndex] = channelBuffer[i];
    }
    const bucketIndexSet = channelStats.bucketIndexSet;
    const numReductions = bucketIndexSet.size - reducedBucketCount;
    for(let i=0;i<numReductions;i++){
        const bucketKeys = [...bucketIndexSet.keys()];
        const lastKeyIndex = bucketKeys.length - 1;
        let leastCombinedValue = Infinity;
        let leastPenalty = 0;
        let keyToMergeStartIndex = -1;
        
        for(let j=0;j<lastKeyIndex;j++){
            const bucketKey1 = bucketKeys[j];
            const bucketKey2 = bucketKeys[j+1];
            //penalize buckets that are far away from each other
            const penalty = penaltyDistanceFunc(bucketKey1, bucketKey2, channelBuffer);
            const combinedValue = (bucketCounts[bucketKey1] + bucketCounts[bucketKey2]) * penalty;
            if(combinedValue < leastCombinedValue){
                leastCombinedValue = combinedValue;
                leastPenalty = penalty;
                keyToMergeStartIndex = j;
            }
        }
        //for hues which wrap around
        if(shouldWrap){
            const bucketKey1 = bucketKeys[lastKeyIndex];
            const bucketKey2 = bucketKeys[0];
            const penalty = penaltyDistanceFunc(bucketKey2, bucketKey1, channelBuffer);
            const wrappedCombinedValue = (bucketCounts[bucketKey1] + bucketCounts[bucketKey2]) * penalty;
            if(wrappedCombinedValue < leastCombinedValue){
                leastCombinedValue = wrappedCombinedValue;
                keyToMergeStartIndex = lastKeyIndex;
            }
        }
        
        //remove one key by either deleting key with lowest pixel count, or merging keys by averaging values
        const firstKey = bucketKeys[keyToMergeStartIndex];
        const secondKey = keyToMergeStartIndex === lastKeyIndex ? bucketKeys[0] : bucketKeys[keyToMergeStartIndex + 1];
        //delete key with lowest pixel count
        //use this for color hues, since that avoids them from getting grey by merging
        if(shouldWrap && penaltyFuncId !== 0){
            let keyToDelete = secondKey;
            //use fraction because the closer the two keys are, the more pixels will be drawn to remaining key (in theory)
            const fraction = 1 - (leastPenalty / maximumPenalty);
            if(bucketCounts[secondKey] > bucketCounts[firstKey]){
                keyToDelete = firstKey;
                bucketCounts[secondKey] += bucketCounts[firstKey] * fraction;
            }
            else{
                bucketCounts[firstKey] += bucketCounts[secondKey] * fraction;
            }
            bucketIndexSet.delete(keyToDelete);
        }
        //merge two keys by averaging values
        //merge grey keys, since that makes them more grey anyway
        else{
            const keyToDelete = secondKey;
            const bufferStartIndex = firstKey * 4;
            const bufferMergeIndex = keyToDelete * 4;

            for(let j=0;j<4;j++){
                channelBuffer[bufferStartIndex + j] += channelBuffer[bufferMergeIndex + j]; 
            }
            //update color counts
            bucketCounts[firstKey] += bucketCounts[keyToDelete];

            bucketIndexSet.delete(keyToDelete);
        }
        
    }
}

function loadPaletteBufferBw(paletteBuffer, lightnessHistogram, pixelCount){
    const imageFractionalPixels = pixelCount * 0.02;
    const pixelAverageBuffer = new Float32Array(4);

    //get average for black pixel
    for(let i=0;pixelAverageBuffer[3]<imageFractionalPixels;i+=4){
        for(let j=0;j<4;j++){
            pixelAverageBuffer[j] += lightnessHistogram[i+j];
        }
    }
    //load black pixel to palette
    for(let i=0;i<3;i++){
        paletteBuffer[i] = Math.round(pixelAverageBuffer[i] / pixelAverageBuffer[3]);
    }

    pixelAverageBuffer.fill(0);
    //get average for white pixel
    for(let i=lightnessHistogram.length-4;pixelAverageBuffer[3]<imageFractionalPixels;i-=4){
        for(let j=0;j<4;j++){
            pixelAverageBuffer[j] += lightnessHistogram[i+j];
        }
    }
    //load white pixel to palette
    for(let i=0;i<3;i++){
        paletteBuffer[i+3] = Math.round(pixelAverageBuffer[i] / pixelAverageBuffer[3]);
    }
}

function loadPaletteBuffer(channelStats, paletteBuffer, startIndex=0){
    const channelBuffer = channelStats.buffer;
    let paletteIndex = startIndex * 3;

    for(let bucketIndex of channelStats.bucketIndexSet.keys()){
        const bufferIndex = bucketIndex * 4;
        const pixelCount = channelBuffer[bufferIndex + 3];

        paletteBuffer[paletteIndex++] = Math.round(channelBuffer[bufferIndex] / pixelCount);
        paletteBuffer[paletteIndex++] = Math.round(channelBuffer[bufferIndex+1] / pixelCount);
        paletteBuffer[paletteIndex++] = Math.round(channelBuffer[bufferIndex+2] / pixelCount);
    }
}

function colorChannel(pixels, numColors, colorQuantization, _imageWidth, _imageHeight, progressCallback){
    const paletteBuffer = new Uint8Array(numColors * 3);
    const {hueChannel, lightnessChannel, lightnessHistogram, pixelCount} = createImageChannels(pixels, numColors);
    const numHueBuckets = hueChannel.bucketIndexSet.size;
    const numLightnessBuckets = lightnessChannel.bucketIndexSet.size;

    //increase contrast by getting black and white values from lightness
    loadPaletteBufferBw(paletteBuffer, lightnessHistogram, pixelCount);

    const numColorsAdjusted = numColors - 2;
    if(numHueBuckets + numLightnessBuckets > numColorsAdjusted){
        const baseLightnessFraction = lightnessChannel.count / (lightnessChannel.count + hueChannel.count);
        //progressively add more grays as color count increases, use sqrt to decrease large baseLightnessFraction, while leaving small baseLightnessFraction relatively unchanged
        const hueFraction = hueChannel.count / (hueChannel.count + (lightnessChannel.count / (colorQuantization.greyMix * Math.sqrt(100 * baseLightnessFraction))) * (1 - Math.log2(numColors) / numColors));

        const lightnessBucketCount = Math.floor(numColorsAdjusted * (1-hueFraction));
        const penaltyFuncId = colorQuantization.penaltyFuncId;
        reduceChannelBuckets(lightnessChannel, lightnessBucketCount, penaltyFuncId);
        //have to recalculate lightness bucket count, since it might have had less buckets than required
        reduceChannelBuckets(hueChannel, numColorsAdjusted - lightnessChannel.bucketIndexSet.size, penaltyFuncId, true);
    }

    loadPaletteBuffer(lightnessChannel, paletteBuffer, 2);
    //have to get new bucket size since we might have reduced it
    loadPaletteBuffer(hueChannel, paletteBuffer, lightnessChannel.bucketIndexSet.size + 2);
    return paletteBuffer;
}

export default {
    colorChannel,
};