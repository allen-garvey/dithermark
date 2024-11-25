import Image from '../image.js';
import Pixel from '../../shared/pixel.js';
import PixelMath from '../../shared/pixel-math.js';
import DitherUtil from '../../shared/dither-util.js';
import { createNoise2D } from './simplex.js';

const sNoise = createNoise2D();

/**
 * BW Dither stuff
 */
function thresholdGenerator(thresholdFunc) {
    //for some reason we need to use same coefficient as webgl for bw dithers
    const rCoefficient = DitherUtil.ditherRCoefficient(2, true);
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

                if (
                    lightness + rCoefficient * thresholdFunc(x, y, pixel) >=
                    threshold
                ) {
                    whitePixel[Pixel.A_INDEX] = pixel[Pixel.A_INDEX];
                    return whitePixel;
                }
                blackPixel[Pixel.A_INDEX] = pixel[Pixel.A_INDEX];
                return blackPixel;
            }
        );
    };
}

const randomThreshold = () => Math.random() * 255 - 127.5;

/**
 *
 * @param {number} x
 * @param {number} y
 * @returns {number}
 */
const simplexThreshold = (x, y) => sNoise(x, y) * 255 - 127.5;

//a_dither adapted from: http://pippin.gimp.org/a_dither/
function aDitherMask1(x, y) {
    return (((x ^ (y * 149)) * 1234) & 511) / 511.0;
}

function aDitherMask2(x, y, c) {
    return ((((x + c * 17) ^ (y * 149)) * 1234) & 511) / 511.0;
}

function aDitherMask3(x, y) {
    return (((x + y * 237) * 119) & 255) / 255.0;
}

function aDitherMask4(x, y, c) {
    return (((x + c * 67 + y * 236) * 119) & 255) / 255.0;
}

function aDitherXorFunc1(x, y) {
    return aDitherMask1(x, y);
}

function aDitherXorFunc2(x, y) {
    return (
        (aDitherMask2(x, y, 0) +
            aDitherMask2(x, y, 1) +
            aDitherMask2(x, y, 2)) /
        3
    );
}

function aDitherXorFunc3(x, y, pixel) {
    const coeficient = 3 / 255;
    return (
        (aDitherMask2(x, y, Math.floor(pixel[0] * coeficient)) +
            aDitherMask2(x, y, Math.floor(pixel[1] * coeficient)) +
            aDitherMask2(x, y, Math.floor(pixel[2] * coeficient))) /
        3
    );
}

function aDitherAddFunc1(x, y) {
    return aDitherMask3(x, y);
}

function aDitherAddFunc2(x, y) {
    return (
        (aDitherMask4(x, y, 0) +
            aDitherMask4(x, y, 1) +
            aDitherMask4(x, y, 2)) /
        3
    );
}

function aDitherAddFunc3(x, y, pixel) {
    const coeficient = 3 / 255;
    return (
        (aDitherMask4(x, y, Math.floor(pixel[0] * coeficient)) +
            aDitherMask4(x, y, Math.floor(pixel[1] * coeficient)) +
            aDitherMask4(x, y, Math.floor(pixel[2] * coeficient))) /
        3
    );
}

function aDitherThresholdFuncBuilder(aDitherFunc) {
    return (x, y, pixel) => {
        return aDitherFunc(x, y, pixel) * 255 - 127.5;
    };
}

/**
 * Color Dither stuff
 */
function colorDitherBuilder(pixelAdjustmentFunc) {
    return (pixels, imageWidth, imageHeight, colorDitherModeId, colors) => {
        return Image.colorDither(
            pixels,
            imageWidth,
            imageHeight,
            colorDitherModeId,
            colors,
            pixelAdjustmentFunc
        );
    };
}

function colorADitherFuncGenerator(aDitherFunc) {
    return (x, y, pixel) => {
        return aDitherFunc(x, y, pixel) - 0.5;
    };
}

export default {
    image: thresholdGenerator(() => {
        return 0;
    }),
    aditherXor1: thresholdGenerator(
        aDitherThresholdFuncBuilder(aDitherXorFunc1)
    ),
    aditherXor2: thresholdGenerator(
        aDitherThresholdFuncBuilder(aDitherXorFunc2)
    ),
    aditherXor3: thresholdGenerator(
        aDitherThresholdFuncBuilder(aDitherXorFunc3)
    ),
    aditherAdd1: thresholdGenerator(
        aDitherThresholdFuncBuilder(aDitherAddFunc1)
    ),
    aditherAdd2: thresholdGenerator(
        aDitherThresholdFuncBuilder(aDitherAddFunc2)
    ),
    aditherAdd3: thresholdGenerator(
        aDitherThresholdFuncBuilder(aDitherAddFunc3)
    ),
    randomDither: thresholdGenerator(randomThreshold),
    simplexDither: thresholdGenerator(simplexThreshold),
    //color dither functions
    closestColor: colorDitherBuilder(() => {
        return 0;
    }),
    randomClosestColor: colorDitherBuilder(() => {
        return Math.random() - 0.5;
    }),
    aditherXor1Color: colorDitherBuilder(
        colorADitherFuncGenerator(aDitherXorFunc1)
    ),
    aditherXor2Color: colorDitherBuilder(
        colorADitherFuncGenerator(aDitherXorFunc2)
    ),
    aditherXor3Color: colorDitherBuilder(
        colorADitherFuncGenerator(aDitherXorFunc3)
    ),
    aditherAdd1Color: colorDitherBuilder(
        colorADitherFuncGenerator(aDitherAddFunc1)
    ),
    aditherAdd2Color: colorDitherBuilder(
        colorADitherFuncGenerator(aDitherAddFunc2)
    ),
    aditherAdd3Color: colorDitherBuilder(
        colorADitherFuncGenerator(aDitherAddFunc3)
    ),
};
