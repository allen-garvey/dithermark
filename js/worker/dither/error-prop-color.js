import Image from '../image.js';
import ColorDitherModeFunctions from '../color-dither-mode-functions.js';
import ErrorPropModel from './error-prop-model.js';

/*
 ** Error propagation matrix stuff
 */
function createErrorMaxtrix(width, numRows, lengthOffset, dimensions) {
    const rowWidth = (width + lengthOffset * 2) * dimensions;
    const rowWidthBytes = rowWidth * 4;
    const buffer = new ArrayBuffer(rowWidthBytes * numRows);
    const data = new Array(numRows);

    for (let i = 0; i < numRows; i++) {
        data[i] = new Float32Array(buffer, rowWidthBytes * i, rowWidth);
    }

    return {
        dimensions,
        data,
    };
}

/**
 * @param {Number} x
 * @param {Number} y
 * @param {Number} errorFraction
 * @param {Float32Array} error
 */
function errorMatrixIncrement(matrix, x, y, error, errorFraction) {
    const matrixValues = errorMatrixValue(matrix, x, y);

    for (let i = 0; i < matrixValues.length; i++) {
        matrixValues[i] = matrixValues[i] + error[i] * errorFraction;
    }
}

function errorMatrixValue(matrix, x, y) {
    const normalizedX = x * matrix.dimensions;
    return matrix.data[y].subarray(
        normalizedX,
        normalizedX + matrix.dimensions
    );
}

/**
 * @param {Float32Array} propagationModel
 * @param {Number} x
 * @param {Float32Array} currentError
 */
function propagateError(propagationModel, errorPropMatrix, x, currentError) {
    for (let i = 0; i < propagationModel.length; i += 3) {
        errorMatrixIncrement(
            errorPropMatrix,
            propagationModel[i] + x,
            propagationModel[i + 1],
            currentError,
            propagationModel[i + 2]
        );
    }
}

/**
 * Base error prop functions
 */
function errorPropDitherBase(
    pixels,
    imageWidth,
    imageHeight,
    colorDitherModeId,
    colors,
    errorPropagationModel
) {
    const colorDitherMode = ColorDitherModeFunctions[colorDitherModeId];
    const pixelValueFunc = colorDitherMode.pixelValue;
    const pixelDistanceFunc = colorDitherMode.distance;
    const modeDimensions = colorDitherMode.dimensions;
    const incrementValueFunc = colorDitherMode.incrementValue;
    const errorAmountFunc = colorDitherMode.errorAmount;
    const transformedPixelBuffer = colorDitherMode.createBuffer();

    const colorValues = colorDitherMode.createTransformedColors(colors);
    const errorMatrix = createErrorMaxtrix(
        imageWidth,
        errorPropagationModel.numRows,
        errorPropagationModel.lengthOffset,
        modeDimensions
    );
    //this is to avoid uncessesary creation and deletion of arrays during error propagation
    const currentErrorBuffer = new Float32Array(modeDimensions);
    let errorMatrixIndex = errorPropagationModel.lengthOffset;

    Image.transform(
        pixels,
        imageWidth,
        imageHeight,
        (pixel, x, y) => {
            const errorValue = errorMatrixValue(
                errorMatrix,
                errorMatrixIndex,
                0
            );
            const pixelAdjustedValue = incrementValueFunc(
                pixelValueFunc(pixel, transformedPixelBuffer),
                errorValue
            );
            const closestColorIndex = Image.findClosestColorIndex(
                pixelAdjustedValue,
                colorValues,
                pixelDistanceFunc
            );

            const closestColorValue = colorValues[closestColorIndex];
            const currentError = errorAmountFunc(
                pixelAdjustedValue,
                closestColorValue,
                currentErrorBuffer
            );
            propagateError(
                errorPropagationModel.matrix,
                errorMatrix,
                errorMatrixIndex,
                currentError
            );

            errorMatrixIndex++;
            pixel.set(colors[closestColorIndex]);
            return pixel;
        },
        () => {
            errorMatrixIndex = errorPropagationModel.lengthOffset;
            // fill first row of error prop model with zero,
            //move it to the end and move all other rows up one
            const temp = errorMatrix.data[0];
            temp.fill(0);
            const length = errorMatrix.data.length;

            for (let i = 1; i < length; i++) {
                errorMatrix.data[i - 1] = errorMatrix.data[i];
            }
            errorMatrix.data[length - 1] = temp;
        }
    );
}

function errorPropBuilder(propagateErrorModel) {
    return (pixels, imageWidth, imageHeight, colorDitherModeId, colors) => {
        return errorPropDitherBase(
            pixels,
            imageWidth,
            imageHeight,
            colorDitherModeId,
            colors,
            propagateErrorModel
        );
    };
}

export default {
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
