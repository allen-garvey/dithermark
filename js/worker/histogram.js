import Image from './image.js';
import PixelMath from '../shared/pixel-math.js';


/*
* @param pixelHashFunc - used to get index of pixel that is used for counting unique values for histogram - (@params pixel @returns int)
*/
function createHistogram(pixels, histogramPercentages, uniqueValues, pixelHashFunc){
    
    //can't use int array, since we may overflow it
    const histogramArray = new Float32Array(uniqueValues);

    Image.forEachOpaquePixel(pixels, (pixel)=>{
        const index = pixelHashFunc(pixel);
        if(index >= 0){
            histogramArray[index] = histogramArray[index] + 1;
        }
    });

    //find maximum value so we can normalize values
    const max = histogramArray.reduce((currentMax, element)=>{
        return Math.max(currentMax, element);
    }, 0);
    
    //calculate each unique values percentage of bar height
    //if max is 0, no need to do anything, since percentages should already be 0ed out,
    //and dividing by 0 will be infinity anyway
    if(max > 0){
        for(let i=0;i<histogramArray.length;i++){
            const percentage = Math.ceil(histogramArray[i] / max * 100);
            histogramPercentages[i] = percentage;
        }
    }
}

function createBwHistogram(pixels, histogramPercentages){
    return createHistogram(pixels, histogramPercentages, 256, PixelMath.lightness);
}

function createHueHistogram(pixels, histogramPercentages){
    return createHistogram(pixels, histogramPercentages, 360, (pixel)=>{
        if(PixelMath.saturation(pixel) === 0){
            return -1;
        }
        return PixelMath.hue(pixel);
    });
}

export default {
    createBwHistogram: createBwHistogram,
    createHueHistogram: createHueHistogram,
};