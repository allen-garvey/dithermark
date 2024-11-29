import Image from '../image.js';
import { R_INDEX, G_INDEX, B_INDEX, A_INDEX } from '../../shared/pixel.js';
import PixelMath from '../../shared/pixel-math.js';
import DitherUtil from '../../shared/dither-util.js';
import ColorDitherModeFunctions from '../color-dither-mode-functions.js';
import ArrayUtil from '../../shared/array-util.js';
import Bayer from '../../shared/bayer-matrix.js';
import { createNoise2D } from './simplex.js';
import { ORDERED_DITHER_VARIANT_SIMPLEX, ORDERED_DITHER_VARIANT_RANDOM } from '../../shared/models/ordered-dither-variants.js';

const snoise = createNoise2D();

function createMatrix(dimensions, data) {
    return {
        dimensions: dimensions,
        data: data,
    };
}

function matrixIndexFor(matrix, x, y) {
    return matrix.dimensions * y + x;
}

function matrixValue(matrix, x, y) {
    if (x >= matrix.dimensions || y >= matrix.dimensions) {
        return 0;
    }
    const index = matrixIndexFor(matrix, x, y);
    return matrix.data[index];
}

const getMatrixAdjustmentFunc = (variant) => {
    switch (variant) {
        case ORDERED_DITHER_VARIANT_RANDOM:
            return () => Math.random();
        case ORDERED_DITHER_VARIANT_SIMPLEX:
            return snoise;
        default:
            return () => 1;
    }
};

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

function orderedDitherBuilder(bayerFuncName) {
    return function (dimensions, variant) {
        return createOrderedDitherBase(
            dimensions,
            Bayer[bayerFuncName],
            variant
        );
    };
}

/**
 * Color dither stuff
 */
function calculateFloatMatrixFraction(matrixLength) {
    return 1 / (matrixLength - 1);
}
function convertBayerToFloat(bayerMatrix, fullValue = 1) {
    const length = bayerMatrix.length;
    const fraction = calculateFloatMatrixFraction(length);

    return ArrayUtil.create(
        length,
        (i) => {
            return (fraction * bayerMatrix[i] - 0.5) * fullValue;
        },
        Float32Array
    );
}

function createColorOrderedDither(
    dimensions,
    bayerCreationFunc,
    isRandom,
    postscriptFuncBuilder = null
) {
    const matrix = createMatrix(
        dimensions,
        convertBayerToFloat(bayerCreationFunc(dimensions))
    );
    const postscriptFunc = postscriptFuncBuilder
        ? postscriptFuncBuilder(matrix)
        : null;
    const matrixValueAdjustmentFunc = isRandom
        ? Math.random
        : () => {
            return 1;
        };

    return (pixels, imageWidth, imageHeight, colorDitherModeId, colors) => {
        return Image.colorDither(
            pixels,
            imageWidth,
            imageHeight,
            colorDitherModeId,
            colors,
            (x, y) => {
                return (
                    matrixValue(
                        matrix,
                        x % matrix.dimensions,
                        y % matrix.dimensions
                    ) * matrixValueAdjustmentFunc()
                );
            },
            postscriptFunc
        );
    };
}

function colorOrderedDitherBuilder(
    bayerFuncName,
    postscriptFuncBuilder = null
) {
    return function (dimensions, isRandom = false) {
        return createColorOrderedDither(
            dimensions,
            Bayer[bayerFuncName],
            isRandom,
            postscriptFuncBuilder
        );
    };
}

function colorOrderedDitherBuilder2(postscriptFuncBuilder = null) {
    return (bayerFuncName, dimensions, isRandom = false) => {
        return createColorOrderedDither(
            dimensions,
            Bayer[bayerFuncName],
            isRandom,
            postscriptFuncBuilder
        );
    };
}

/**
 * Stark ordered dither
 */
function createStarkFloatMatrix(matrix, dimensions, ditherRCoefficient) {
    const length = matrix.length;
    const fraction = calculateFloatMatrixFraction(length);

    const matrixData = ArrayUtil.create(
        length,
        (i) => {
            return 1 - matrix[i] * fraction * ditherRCoefficient;
        },
        Float32Array
    );

    return createMatrix(dimensions, matrixData);
}

function createStarkColorOrderedDither(dimensions, bayerFuncName) {
    const baseMatrix = Bayer[bayerFuncName](dimensions);

    return (pixels, imageWidth, imageHeight, colorDitherModeId, colors) => {
        const matrix = createStarkFloatMatrix(
            baseMatrix,
            dimensions,
            DitherUtil.ditherRCoefficient(colors.length, true)
        );
        const colorDitherModeFuncs =
            ColorDitherModeFunctions[colorDitherModeId];
        const pixelValueFunc = colorDitherModeFuncs.pixelValue;
        const pixelDistanceFunc = colorDitherModeFuncs.distance;
        const colorValues = colors.map((color) => {
            return pixelValueFunc(color);
        });

        return Image.transform(
            pixels,
            imageWidth,
            imageHeight,
            (pixel, x, y) => {
                //transparent pixels are automatically ignored, so don't have to check
                const bayerValue = matrixValue(
                    matrix,
                    x % matrix.dimensions,
                    y % matrix.dimensions
                );
                const pixelValue = pixelValueFunc(pixel);

                let shortestDistance = Infinity;
                let shortestDistanceColorIndex = 0;

                //find color with shortest distance to pixel
                colorValues.forEach((colorValue, i) => {
                    const currentDistance = pixelDistanceFunc(
                        pixelValue,
                        colorValue
                    );
                    if (currentDistance < shortestDistance) {
                        shortestDistance = currentDistance;
                        shortestDistanceColorIndex = i;
                    }
                });
                let pixelMatchIndex = shortestDistanceColorIndex;

                //find greatest allowed distance
                //check for shortest distance being 0, so we don't divide by 0
                if (bayerValue < 1) {
                    let greatestAllowedDistance = -1;
                    let greatestAllowedDistanceIndex =
                        shortestDistanceColorIndex;
                    colorValues.forEach((colorValue, i) => {
                        const currentDistance = pixelDistanceFunc(
                            pixelValue,
                            colorValue
                        );
                        if (
                            currentDistance > greatestAllowedDistance &&
                            (currentDistance / shortestDistance) * bayerValue <
                            1
                        ) {
                            greatestAllowedDistance = currentDistance;
                            greatestAllowedDistanceIndex = i;
                        }
                    });
                    pixelMatchIndex = greatestAllowedDistanceIndex;
                }

                const pixelMatch = colors[pixelMatchIndex];
                //rgb only, preserve alpha
                for (let i = 0; i < 3; i++) {
                    pixel[i] = pixelMatch[i];
                }
                return pixel;
            }
        );
    };
}

/**
 * Yliluoma's ordered dithering
 * from: https://bisqwit.iki.fi/story/howto/dither/jy/
 * adaptation of Yliluoma's ordered dithering algorithm 1
 * Joel Yliluoma considers this algorithm released in the public domain
 */
function yliluoma1EvaluateMixingError(
    pixelValue,
    mixValue,
    color1Value,
    color2Value,
    ratioFraction,
    pixelDistanceFunc
) {
    return (
        pixelDistanceFunc(pixelValue, mixValue) +
        pixelDistanceFunc(color1Value, color2Value) *
        0.1 *
        (Math.abs(ratioFraction - 0.5) + 0.5)
    );
}
function yliluoma1DeviseMixingPlan(
    pixelValue,
    colors,
    colorValues,
    bayerValue,
    matrixLength,
    pixelValueFunc,
    pixelDistanceFunc,
    mixPixel
) {
    const colorsLength = colors.length;
    let colorIndex1 = 0;
    let colorIndex2 = 0;
    let lowestRatio = 0;
    let leastPenalty = Infinity;
    // Loop through every unique combination of two colors from the palette,
    // and through each possible way to mix those two colors. They can be
    // mixed in exactly 64 ways, when the threshold matrix is 8x8.
    for (let index1 = 0; index1 < colorsLength; index1++) {
        for (let index2 = index1; index2 < colorsLength; index2++) {
            for (let ratio = 0; ratio < matrixLength; ratio++) {
                if (index1 === index2 && ratio != 0) {
                    break;
                }
                // Determine the two component colors
                const color1 = colors[index1];
                const color2 = colors[index2];
                // Determine what mixing them in this proportion will produce
                mixPixel[R_INDEX] =
                    color1[R_INDEX] +
                    (ratio * (color2[R_INDEX] - color1[R_INDEX])) /
                    matrixLength;
                mixPixel[G_INDEX] =
                    color1[G_INDEX] +
                    (ratio * (color2[G_INDEX] - color1[G_INDEX])) /
                    matrixLength;
                mixPixel[B_INDEX] =
                    color1[B_INDEX] +
                    (ratio * (color2[B_INDEX] - color1[B_INDEX])) /
                    matrixLength;
                // Determine how well that matches what we want to accomplish
                const penalty = yliluoma1EvaluateMixingError(
                    pixelValue,
                    pixelValueFunc(mixPixel),
                    colorValues[index1],
                    colorValues[index2],
                    ratio / matrixLength,
                    pixelDistanceFunc
                );
                // Keep the result that has the smallest error
                if (penalty < leastPenalty) {
                    leastPenalty = penalty;
                    colorIndex1 = index1;
                    colorIndex2 = index2;
                    lowestRatio = ratio;
                }
            }
        }
    }
    if (bayerValue < lowestRatio) {
        return colorIndex2;
    }
    return colorIndex1;
}
function createYliluoma1ColorDither(dimensions, bayerFuncName) {
    const matrix = createMatrix(dimensions, Bayer[bayerFuncName](dimensions));
    const matrixLength = dimensions * dimensions;

    return (pixels, imageWidth, imageHeight, colorDitherModeId, colors) => {
        const colorDitherModeFuncs =
            ColorDitherModeFunctions[colorDitherModeId];
        const pixelValueFunc = colorDitherModeFuncs.pixelValue;
        const pixelDistanceFunc = colorDitherModeFuncs.distance;
        const colorValues = colors.map((color) => {
            return pixelValueFunc(color);
        });
        //to reduce allocations and deletions
        const mixPixel = new Uint8Array(3);

        return Image.transform(
            pixels,
            imageWidth,
            imageHeight,
            (pixel, x, y) => {
                //transparent pixels are automatically ignored, so don't have to check
                const bayerValue = matrixValue(
                    matrix,
                    x % matrix.dimensions,
                    y % matrix.dimensions
                );
                const planIndex = yliluoma1DeviseMixingPlan(
                    pixelValueFunc(pixel),
                    colors,
                    colorValues,
                    bayerValue,
                    matrixLength,
                    pixelValueFunc,
                    pixelDistanceFunc,
                    mixPixel
                );
                const bestPixelMatch = colors[planIndex];
                //rgb only, preserve alpha
                for (let i = 0; i < 3; i++) {
                    pixel[i] = bestPixelMatch[i];
                }
                return pixel;
            }
        );
    };
}

/*
 * adaptation of: Yliluoma's ordered dithering algorithm 2
 * Joel Yliluoma considers this algorithm released in the public domain
 */
function yliluoma2DeviseMixingPlan(
    pixel,
    colors,
    paletteValues,
    planBuffer,
    pixelValueFunc,
    pixelDistanceFunc
) {
    const colorsLength = colors.length;
    const pixelValue = pixelValueFunc(pixel);
    let proportionTotal = 0;
    const soFar = new Uint32Array(3);
    const sum = new Uint32Array(3);
    const add = new Uint32Array(3);
    const test = new Uint32Array(3);
    while (proportionTotal < colorsLength) {
        let chosenAmount = 1;
        let chosen = 0;
        const maxTestCount = Math.max(1, proportionTotal);
        let leastPenalty = Infinity;
        for (let index = 0; index < colorsLength; ++index) {
            const color = colors[index];
            sum.set(soFar);
            add.set(color);
            for (let p = 1; p <= maxTestCount; p *= 2) {
                for (let c = 0; c < 3; ++c) {
                    sum[c] += add[c];
                    add[c] += add[c];
                }
                const t = proportionTotal + p;
                test.set([sum[0] / t, sum[1] / t, sum[2] / t]);
                const penalty = pixelDistanceFunc(
                    pixelValue,
                    pixelValueFunc(test)
                );
                if (penalty < leastPenalty) {
                    leastPenalty = penalty;
                    chosen = index;
                    chosenAmount = p;
                }
            }
        }
        for (let p = 0; p < chosenAmount; ++p) {
            if (proportionTotal >= colorsLength) {
                break;
            }
            planBuffer[proportionTotal++] = chosen;
        }

        const color = colors[chosen];
        for (let c = 0; c < 3; ++c) {
            soFar[c] += color[c] * chosenAmount;
        }
    }
    return planBuffer.sort((a, b) => {
        return paletteValues[a] - paletteValues[b];
    });
}
function pixelLuma(pixel) {
    return pixel[0] * 299 + pixel[1] * 587 + pixel[2] * 114;
}
function createYliluoma2ColorDither(dimensions, bayerFuncName) {
    const matrix = createMatrix(dimensions, Bayer[bayerFuncName](dimensions));
    const matrixLength = dimensions * dimensions;

    return (pixels, imageWidth, imageHeight, colorDitherModeId, colors) => {
        const colorsLength = colors.length;
        const colorDitherModeFuncs =
            ColorDitherModeFunctions[colorDitherModeId];
        const pixelValueFunc = colorDitherModeFuncs.pixelValue;
        const pixelDistanceFunc = colorDitherModeFuncs.distance;
        const paletteValues = new Uint32Array(colorsLength);
        colors.forEach((color, i) => {
            paletteValues[i] = pixelLuma(color);
        });
        const planBuffer =
            colorsLength < 256
                ? new Uint8Array(colorsLength)
                : new Uint16Array(colorsLength);

        return Image.transform(
            pixels,
            imageWidth,
            imageHeight,
            (pixel, x, y) => {
                //transparent pixels are automatically ignored, so don't have to check
                const bayerValue = matrixValue(
                    matrix,
                    x % matrix.dimensions,
                    y % matrix.dimensions
                );
                const planIndex = Math.floor(
                    (bayerValue * colorsLength) / matrixLength
                );
                const plan = yliluoma2DeviseMixingPlan(
                    pixel,
                    colors,
                    paletteValues,
                    planBuffer,
                    pixelValueFunc,
                    pixelDistanceFunc
                );
                const bestPixelMatch = colors[plan[planIndex]];
                //rgb only, preserve alpha
                for (let i = 0; i < 3; i++) {
                    pixel[i] = bestPixelMatch[i];
                }
                return pixel;
            }
        );
    };
}

/**
 * Hue lightness ordered dither stuff
 * based on: http://alex-charlton.com/posts/Dithering_on_the_GPU/
 * Alex Charlton considers this algorithm released in the public domain
 */

function lightnessStep(l) {
    const lightnessSteps = 4;
    //Quantize the lightness to one of `lightnessSteps` values
    return Math.floor(0.5 + l * lightnessSteps) / lightnessSteps;
}

function hueLightnessPostscriptFuncBuilder(matrix) {
    const hslColor = new Uint16Array(3);
    return (color, x, y, pixel) => {
        //have to add 0.5 back to matrix value, since we subtracted 0.5 when we converted the bayer matrix to float
        const matrixFraction =
            matrixValue(matrix, x % matrix.dimensions, y % matrix.dimensions) +
            0.5;
        hslColor[0] = PixelMath.hue(color);
        hslColor[1] = PixelMath.saturation(color);
        const pixelLightness = PixelMath.lightness(color) / 255;

        const l1 = lightnessStep(Math.max(pixelLightness - 0.125, 0));
        const l2 = lightnessStep(Math.min(pixelLightness + 0.124, 1));
        const lightnessDiff = (pixelLightness - l1) / (l2 - l1);

        const adjustedLightness = lightnessDiff < matrixFraction ? l1 : l2;
        hslColor[2] = Math.round(adjustedLightness * 255);
        return PixelMath.hslToPixel(hslColor, pixel);
    };
}

export default {
    createHueLightnessDither: colorOrderedDitherBuilder2(
        hueLightnessPostscriptFuncBuilder
    ),
    createYliluoma2ColorDither,
    createYliluoma1ColorDither,
    createStarkColorOrderedDither,
    orderedDitherBuilder,
    colorOrderedDitherBuilder,
};
