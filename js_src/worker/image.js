import Pixel from '../shared/pixel.js';
import ColorDitherModeFunctions from './color-dither-mode-functions.js';
import DitherUtil from '../shared/dither-util.js';


function transformImage(pixels, imageWidth, imageHeight, pixelTransformFunc){
    const pixel = Pixel.create(0, 0, 0);

    for(let i=0,y=0;y<imageHeight;y++){
        for(let x=0;x<imageWidth;x++,i+=4){
            //nothing needs to be done for transparent pixels
            if(pixels[i+3] > 0){
                pixel[Pixel.R_INDEX] = pixels[i];
                pixel[Pixel.G_INDEX] = pixels[i+1];
                pixel[Pixel.B_INDEX] = pixels[i+2];
                pixel[Pixel.A_INDEX] = pixels[i+3];
                
                const outputPixel = pixelTransformFunc(pixel, x, y);
            
                pixels[i] = outputPixel[0];
                pixels[i+1] = outputPixel[1];
                pixels[i+2] = outputPixel[2];
                pixels[i+3] = outputPixel[3];
            }
        }
    }
    
    return pixels;
}


function findClosestColorIndex(pixelValue, colorValues, distanceFunc){
    let closestIndex = 0;
    let closestDistance = Infinity;

    colorValues.forEach((colorValue, i)=>{
        const distance = distanceFunc(pixelValue, colorValue);
        if(distance < closestDistance){
            closestIndex = i;
            closestDistance = distance;
        }
    });

    return closestIndex;
}

function identity(value){
    return value;
}

function colorDitherImage(pixels, imageWidth, imageHeight, colorDitherModeId, colors, pixelAdjustmentFunc, postscriptFunc=null){
    const colorDitherModeFuncs = ColorDitherModeFunctions[colorDitherModeId];
    const pixelValueFunc = colorDitherModeFuncs.pixelValue;
    const pixelDistanceFunc = colorDitherModeFuncs.distance;
    if(!postscriptFunc){
        postscriptFunc = identity;
    }
    const ditherRCoefficient = DitherUtil.ditherRCoefficient(colors.length);
    const colorValues = colors.map(pixelValueFunc);

    let y = 0;
    let x = 0;
    const pixel = new Uint8ClampedArray(3);
    
    for(let i=0;i<pixels.length;i+=4){
        //nothing needs to be done for transparent pixels
        if(pixels[i+3] > 0){
            pixel[Pixel.R_INDEX] = pixels[i];
            pixel[Pixel.G_INDEX] = pixels[i+1];
            pixel[Pixel.B_INDEX] = pixels[i+2];
            // pixel[Pixel.A_INDEX] = pixels[i+3]; //not necessary to set alpha

            const pixelAdjustmentValue = pixelAdjustmentFunc(x, y, pixel) * ditherRCoefficient;
            if(pixelAdjustmentValue !== 0){
                //no need to clamp results, since Uint8ClampedArray does this automatically
                pixel[0] = pixel[0] + pixelAdjustmentValue;
                pixel[1] = pixel[1] + pixelAdjustmentValue;
                pixel[2] = pixel[2] + pixelAdjustmentValue;
            }
            const closestColor = colors[findClosestColorIndex(pixelValueFunc(pixel), colorValues, pixelDistanceFunc)];
            //postscriptFunc is for hue-lightness dither
            const outputPixel = postscriptFunc(closestColor, x, y, pixel);

            pixels[i] = outputPixel[0];
            pixels[i+1] = outputPixel[1];
            pixels[i+2] = outputPixel[2];
            pixels[i+3] = pixels[i+3];
        }
        
        x++;
        if(x >= imageWidth){
            x = 0;
            y++;
        }
    }
    return pixels;
}

function forEachOpaquePixel(pixels, callback){
    const pixel = new Uint8Array(3);
    const length = pixels.length;
    for(let i=0;i<length;i+=4){
        //ignore transparent pixels
        if(pixels[i+3] === 0){
            continue;
        }
        //manually loading pixel is faster than using subarray
        pixel[0] = pixels[i];
        pixel[1] = pixels[i+1];
        pixel[2] = pixels[i+2];
        //don't load alpha, since it is not used
        
        callback(pixel);
    }
}


export default {
    transform: transformImage,
    colorDither: colorDitherImage,
    findClosestColorIndex,
    forEachOpaquePixel,
};
