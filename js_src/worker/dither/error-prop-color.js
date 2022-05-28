import Image from '../image.js';
import ColorDitherModeFunctions from '../color-dither-mode-functions.js';
import ErrorPropModel from './error-prop-model.js';


/*
** Error propagation matrix stuff
*/
function createErrorMaxtrix(width, height, dimensions){
    return {
        width: width,
        trueWidth: width * dimensions,
        height: height,
        dimensions: dimensions,
        data: new Float32Array(width * height * dimensions),
    };
}

function errorMatrixIncrement(matrix, x, y, error, errorFraction){
    if(x >= matrix.width || y >= matrix.height){
        return;
    }
    let matrixValues = errorMatrixValue(matrix, x, y);
    for(let i=0;i<matrixValues.length;i++){
        matrixValues[i] = matrixValues[i] + (error[i] * errorFraction);
    }
}

function errorMatrixValue(matrix, x, y){
    const startIndex = (matrix.trueWidth * y) + x * matrix.dimensions;
    return matrix.data.subarray(startIndex, startIndex + matrix.dimensions);
}

/**
 * Propagate error functions
*/
function propagateError(propagationModel, errorPropMatrix, x, y, currentError){
    propagationModel.forEach((item)=>{
        errorMatrixIncrement(errorPropMatrix, x + item[1], y + item[2], currentError, item[0]);
    });
}


/**
 * Base error prop functions
*/
function errorPropDitherBase(pixels, imageWidth, imageHeight, colorDitherModeId, colors, propagateErrorModel){
    const colorDitherMode = ColorDitherModeFunctions[colorDitherModeId];
    const pixelValueFunc = colorDitherMode.pixelValue;
    const pixelDistanceFunc = colorDitherMode.distance;
    const modeDimensions = colorDitherMode.dimensions;
    const incrementValueFunc = colorDitherMode.incrementValue;
    const errorAmountFunc = colorDitherMode.errorAmount;

    const colorValues = colors.map(pixelValueFunc);
    let errorMatrix = createErrorMaxtrix(imageWidth, imageHeight, modeDimensions);
    //this is to avoid uncessesary creation and deletion of arrays during error propagation
    let currentErrorBuffer = new Float32Array(modeDimensions);

    Image.transform(pixels, imageWidth, imageHeight, (pixel, x, y)=>{
        let errorValue = errorMatrixValue(errorMatrix, x, y);
        const pixelAdjustedValue = incrementValueFunc(pixelValueFunc(pixel), errorValue);
        const closestColorIndex = Image.findClosestColorIndex(pixelAdjustedValue, colorValues, pixelDistanceFunc);
        
        const closestColorValue = colorValues[closestColorIndex];
        const currentError = errorAmountFunc(pixelAdjustedValue, closestColorValue, currentErrorBuffer);
        propagateError(propagateErrorModel.matrix, errorMatrix, x, y, currentError);

        pixel.set(colors[closestColorIndex]);
        return pixel;
    });
}

function errorPropBuilder(propagateErrorModel){
    return (pixels, imageWidth, imageHeight, colorDitherModeId, colors)=>{
        return errorPropDitherBase(pixels, imageWidth, imageHeight, colorDitherModeId, colors, propagateErrorModel);
    };
}

export default{
    floydSteinberg: errorPropBuilder(ErrorPropModel.floydSteinberg()),
    javisJudiceNinke: errorPropBuilder(ErrorPropModel.javisJudiceNinke()),
    stucki: errorPropBuilder(ErrorPropModel.stucki()),
    burkes: errorPropBuilder(ErrorPropModel.burkes()),
    sierra3: errorPropBuilder(ErrorPropModel.sierra3()),
    sierra2: errorPropBuilder(ErrorPropModel.sierra2()),
    sierra1: errorPropBuilder(ErrorPropModel.sierra1()),
    atkinson: errorPropBuilder(ErrorPropModel.atkinson()),
    reducedAtkinson: errorPropBuilder(ErrorPropModel.reducedAtkinson()),
    
};