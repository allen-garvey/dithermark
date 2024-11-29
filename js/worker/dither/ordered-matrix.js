import { fillArray } from '../../shared/array-util.js';

/**
 * @typedef {Object} Matrix
 * @property {Float32Array} data
 * @property {number} dimensions
 */

/**
 * 
 * @param {number} dimensions 
 * @param {Float32Array} data 
 * @returns {Matrix}
 */
export const createMatrix = (dimensions, data) => ({
    dimensions,
    data,
});

/**
 * 
 * @param {Matrix} matrix 
 * @param {number} x 
 * @param {number} y 
 * @returns {number}
 */
const matrixIndexFor = (matrix, x, y) => matrix.dimensions * y + x;

/**
 * 
 * @param {Matrix} matrix 
 * @param {number} x 
 * @param {number} y 
 * @returns {number}
 */
export const matrixValue = (matrix, x, y) => {
    if (x >= matrix.dimensions || y >= matrix.dimensions) {
        return 0;
    }
    const index = matrixIndexFor(matrix, x, y);
    return matrix.data[index];
}

/**
 * 
 * @param {number} matrixLength 
 * @returns {number}
 */
export const calculateFloatMatrixFraction = (matrixLength) => 1 / (matrixLength - 1);

/**
 * 
 * @param {Uint8Array} bayerMatrix 
 * @param {number} fullValue 
 * @returns {Float32Array}
 */
export const convertBayerToFloat = (bayerMatrix, fullValue = 1) => {
    const length = bayerMatrix.length;
    const fraction = calculateFloatMatrixFraction(length);

    return fillArray(
        new Float32Array(length),
        (i) => (fraction * bayerMatrix[i] - 0.5) * fullValue
    );
}