import Image from './image.js';
import Pixel from '../shared/pixel.js';
import PixelMath from '../shared/pixel-math.js';
import ErrorPropModel from './error-prop-model.js';


/*
** Error propagation matrix stuff
*/
function createErrorMaxtrix(width, height){
    return {
        width: width,
        height: height,
        data: new Int16Array(width * height)
    };
}

function errorMatrixIndexFor(matrix, x, y){
    return (matrix.width * y) + x;
}

function errorMatrixIncrement(matrix, x, y, error, errorFraction){
    if(x >= matrix.width || y >= matrix.height){
        return;
    }
    const index = errorMatrixIndexFor(matrix, x, y);
    matrix.data[index] = matrix.data[index] + error * errorFraction;
}

function errorMatrixValue(matrix, x, y){
    const index = errorMatrixIndexFor(matrix, x, y);
    return matrix.data[index];
}

/**
 * Propagate error functions
*/
function propagateError(propagationModel, errorPropMatrix, x, y, currentError){
    propagationModel.forEach((item)=>{
        errorMatrixIncrement(errorPropMatrix, x + item.xOffset, y + item.yOffset, currentError, item.errorFraction);
    });
}

/*
** Actual dithering
*/
function errorPropagationDither(pixels, imageWidth, imageHeight, threshold, blackPixel, whitePixel, errorPropagationModel){
    let errorPropMatrix = createErrorMaxtrix(imageWidth, imageHeight);
    
    return Image.transform(pixels, imageWidth, imageHeight, (pixel, x, y)=>{
        const lightness = PixelMath.lightness(pixel);
        let adjustedLightness = lightness + errorMatrixValue(errorPropMatrix, x, y);
        //limit adjusted lightness to be between 0 and 255
        adjustedLightness = Math.min(Math.max(adjustedLightness, 0), 255);
        
        let ret;
        let currentError = 0;
        
        if(adjustedLightness > threshold){
            whitePixel[Pixel.A_INDEX] = pixel[Pixel.A_INDEX];
            ret = whitePixel;
            currentError = adjustedLightness - 255;
        }
        else{
            blackPixel[Pixel.A_INDEX] = pixel[Pixel.A_INDEX];
            ret = blackPixel;
            currentError = adjustedLightness;
        }
        if(currentError !== 0){
            propagateError(errorPropagationModel, errorPropMatrix, x, y, currentError);
        }
        
        return ret;
        
    });
}

function errorPropagationDitherBuilder(errorPropagationModel){
    return (pixels, imageWidth, imageHeight, threshold, blackPixel, whitePixel)=>{
        return errorPropagationDither(pixels, imageWidth, imageHeight, threshold, blackPixel, whitePixel, errorPropagationModel);
    };
}

export default{
    floydSteinberg: errorPropagationDitherBuilder(ErrorPropModel.floydSteinberg()),
    atkinson: errorPropagationDitherBuilder(ErrorPropModel.atkinson()),
    reducedAtkinson: errorPropagationDitherBuilder(ErrorPropModel.reducedAtkinson()),
    javisJudiceNinke: errorPropagationDitherBuilder(ErrorPropModel.javisJudiceNinke()),
    stucki: errorPropagationDitherBuilder(ErrorPropModel.stucki()),
    burkes: errorPropagationDitherBuilder(ErrorPropModel.burkes()),
    sierra3: errorPropagationDitherBuilder(ErrorPropModel.sierra3()),
    sierra2: errorPropagationDitherBuilder(ErrorPropModel.sierra2()),
    sierra1: errorPropagationDitherBuilder(ErrorPropModel.sierra1()),
};