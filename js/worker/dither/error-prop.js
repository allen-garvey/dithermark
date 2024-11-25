import Image from '../image.js';
import Pixel from '../../shared/pixel.js';
import PixelMath from '../../shared/pixel-math.js';
import ErrorPropModel from './error-prop-model.js';


/*
** Error propagation matrix stuff
*/
function createErrorMaxtrix(width, numRows, lengthOffset){
    const rowLength = width + (lengthOffset * 2);
    const ret = {};

    for(let i=0;i<numRows;i++){
        ret[i] = new Float32Array(rowLength);
    }

    return ret;
}

function errorMatrixIncrement(matrix, x, y, error, errorFraction){
    matrix[y][x] = matrix[y][x] + error * errorFraction;
}

function errorMatrixValue(matrix, x, y){
    return matrix[y][x];
}

/**
 * Propagate error functions
*/
function propagateError(propagationModel, errorPropMatrix, x, currentError){
    propagationModel.forEach((item)=>{
        errorMatrixIncrement(errorPropMatrix, x + item[1], item[2], currentError, item[0]);
    });
}

/*
** Actual dithering
*/
function errorPropagationDither(pixels, imageWidth, imageHeight, threshold, blackPixel, whitePixel, errorPropagationModel){
    const errorPropMatrix = createErrorMaxtrix(imageWidth, errorPropagationModel.numRows, errorPropagationModel.lengthOffset);

    let errorMatrixIndex = errorPropagationModel.lengthOffset;
    
    return Image.transform(pixels, imageWidth, imageHeight, (pixel, x, y)=>{
        const lightness = PixelMath.lightness(pixel);
        const adjustedLightness = lightness + errorMatrixValue(errorPropMatrix, errorMatrixIndex, 0);
        
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
        propagateError(errorPropagationModel.matrix, errorPropMatrix, errorMatrixIndex, currentError);
        errorMatrixIndex++;
        
        return ret; 
    }, () => {
        errorMatrixIndex = errorPropagationModel.lengthOffset;
        // fill first row of error prop model with zero, 
        //move it to the end and move all other rows up one
        const temp = errorPropMatrix[0];
        temp.fill(0);
        const length = Object.keys(errorPropMatrix).length;

        for(let i=1;i<length;i++){
            errorPropMatrix[i-1] = errorPropMatrix[i];
        }
        errorPropMatrix[length-1] = temp;
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