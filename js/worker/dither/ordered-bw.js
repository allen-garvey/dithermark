import Image from '../image.js';
import { A_INDEX } from '../../shared/pixel.js';
import PixelMath from '../../shared/pixel-math.js';
import DitherUtil from '../../shared/dither-util.js';
import Bayer from '../../shared/bayer-matrix.js';
import { createMatrix, matrixValue, convertBayerToFloat, getMatrixAdjustmentFunc } from './ordered-matrix.js';

function createOrderedDitherBase(dimensions, matrixCreationFunc, variant) {
    const matrix = createMatrix(
        dimensions,
        convertBayerToFloat(matrixCreationFunc(dimensions), 255)
    );
    //for some reason we need to use same coefficient as webgl for bw dithers
    const rCoefficient = DitherUtil.ditherRCoefficient(2, true);
    const matrixValueAdjustmentFunc = getMatrixAdjustmentFunc(variant);

    return function (
        pixels,
        imageWidth,
        imageHeight,
        threshold,
        blackPixel,
        whitePixel
    ) {
        return Image.transform(
            pixels,
            imageWidth,
            imageHeight,
            (pixel, x, y) => {
                const lightness = PixelMath.lightness(pixel);
                const matrixThreshold =
                    matrixValue(
                        matrix,
                        x % matrix.dimensions,
                        y % matrix.dimensions
                    ) * matrixValueAdjustmentFunc(x, y);

                if (lightness + rCoefficient * matrixThreshold >= threshold) {
                    whitePixel[A_INDEX] = pixel[A_INDEX];
                    return whitePixel;
                } else {
                    blackPixel[A_INDEX] = pixel[A_INDEX];
                    return blackPixel;
                }
            }
        );
    };
}

export const orderedDitherBwBuilder = (bayerFuncName) =>
    (dimensions, variant) => createOrderedDitherBase(
        dimensions,
        Bayer[bayerFuncName],
        variant
    );

