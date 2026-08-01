import { createPixel } from '../../shared/pixel.js';
import PixelMath from '../../shared/pixel-math.js';
import ErrorPropModel from './error-prop-model.js';

/**
 * Error propagation matrix stuff
 * @returns {Float32Array[]}
 */
function createErrorMaxtrix(width, numRows, lengthOffset) {
    const rowLength = width + lengthOffset * 2;
    const ret = new Array(numRows);

    for (let i = 0; i < numRows; i++) {
        ret[i] = new Float32Array(rowLength);
    }

    return ret;
}

/**
 *
 * @param {Float32Array[]} matrix
 * @param {Number} x
 * @param {Number} y
 * @param {Number} error
 * @param {Number} errorFraction
 */
function errorMatrixIncrement(matrix, x, y, error, errorFraction) {
    matrix[y][x] = matrix[y][x] + error * errorFraction;
}

function errorMatrixValue(matrix, x, y) {
    return matrix[y][x];
}

/**
 * @param {Float32Array} propagationModel
 * @param {Float32Array[]} errorPropMatrix
 * @param {Number} x
 * @param {Number} currentError
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

/*
 ** Actual dithering
 */
function errorPropagationDither(
    pixels,
    imageWidth,
    imageHeight,
    threshold,
    blackPixel,
    whitePixel,
    errorPropagationModel
) {
    const errorPropMatrix = createErrorMaxtrix(
        imageWidth,
        errorPropagationModel.numRows,
        errorPropagationModel.lengthOffset
    );

    let errorMatrixIndex = errorPropagationModel.lengthOffset;

    const pixel = createPixel(0, 0, 0);

    for (let i = 0, y = 0; y < imageHeight; y++) {
        for (let x = 0; x < imageWidth; x++, i += 4) {
            pixel[0] = pixels[i];
            pixel[1] = pixels[i + 1];
            pixel[2] = pixels[i + 2];

            const lightness = PixelMath.lightness(pixel);
            const adjustedLightness =
                lightness +
                errorMatrixValue(errorPropMatrix, errorMatrixIndex, 0);

            let ret;
            let currentError = 0;

            if (adjustedLightness > threshold) {
                ret = whitePixel;
                currentError = adjustedLightness - 255;
            } else {
                ret = blackPixel;
                currentError = adjustedLightness;
            }
            propagateError(
                errorPropagationModel.matrix,
                errorPropMatrix,
                errorMatrixIndex,
                currentError
            );
            errorMatrixIndex++;

            pixels[i] = ret[0];
            pixels[i + 1] = ret[1];
            pixels[i + 2] = ret[2];
        }

        errorMatrixIndex = errorPropagationModel.lengthOffset;
        // fill first row of error prop model with zero,
        //move it to the end and move all other rows up one
        const temp = errorPropMatrix[0];
        temp.fill(0);
        const length = Object.keys(errorPropMatrix).length;

        for (let i = 1; i < length; i++) {
            errorPropMatrix[i - 1] = errorPropMatrix[i];
        }
        errorPropMatrix[length - 1] = temp;
    }
}

function errorPropagationDitherBuilder(errorPropagationModel) {
    return (
        pixels,
        imageWidth,
        imageHeight,
        threshold,
        blackPixel,
        whitePixel
    ) => {
        return errorPropagationDither(
            pixels,
            imageWidth,
            imageHeight,
            threshold,
            blackPixel,
            whitePixel,
            errorPropagationModel
        );
    };
}

export default {
    floydSteinberg: errorPropagationDitherBuilder(
        ErrorPropModel.floydSteinberg()
    ),
    atkinson: errorPropagationDitherBuilder(ErrorPropModel.atkinson()),
    reducedAtkinson: errorPropagationDitherBuilder(
        ErrorPropModel.reducedAtkinson()
    ),
    javisJudiceNinke: errorPropagationDitherBuilder(
        ErrorPropModel.javisJudiceNinke()
    ),
    stucki: errorPropagationDitherBuilder(ErrorPropModel.stucki()),
    burkes: errorPropagationDitherBuilder(ErrorPropModel.burkes()),
    sierra3: errorPropagationDitherBuilder(ErrorPropModel.sierra3()),
    sierra2: errorPropagationDitherBuilder(ErrorPropModel.sierra2()),
    sierra1: errorPropagationDitherBuilder(ErrorPropModel.sierra1()),
};
