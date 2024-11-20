import Threshold from '../../worker/dither/threshold.js';
import OrderedDither from '../../worker/dither/ordered.js';
import ErrorPropColorDither from '../../worker/dither/error-prop-color.js';

const algorithmMap = new Map([
    ['closest-color', Threshold.closestColor],
    ['random', Threshold.randomClosestColor],
    ['xor--high', Threshold.aditherXor1Color],
    ['xor--medium', Threshold.aditherXor3Color],
    ['xor--low', Threshold.aditherXor2Color],
    ['add--high', Threshold.aditherAdd1Color],
    ['add--medium', Threshold.aditherAdd3Color],
    ['add--low', Threshold.aditherAdd2Color],
    ['floyd-steinberg', ErrorPropColorDither.floydSteinberg],
    ['javis-judice-ninke', ErrorPropColorDither.javisJudiceNinke],
    ['stucki', ErrorPropColorDither.stucki],
    ['burkes', ErrorPropColorDither.burkes],
    ['sierra-3', ErrorPropColorDither.sierra3],
    ['sierra-2', ErrorPropColorDither.sierra2],
    ['sierra-1', ErrorPropColorDither.sierra1],
    ['atkinson', ErrorPropColorDither.atkinson],
    ['reduced-atkinson', ErrorPropColorDither.reducedAtkinson],
]);

const orderedDitherMap = new Map([
    ['bayer', OrderedDither.createBayerColorDither],
    ['hatchHorizontal', OrderedDither.createHatchHorizontalColorDither],
    ['hatchVertical', OrderedDither.createHatchVerticalColorDither],
    ['hatchRight', OrderedDither.createHatchRightColorDither],
    ['hatchLeft', OrderedDither.createHatchLeftColorDither],
    [
        'crossHatchHorizontal',
        OrderedDither.createCrossHatchHorizontalColorDither,
    ],
    ['crossHatchVertical', OrderedDither.createCrossHatchVerticalColorDither],
    ['crossHatchRight', OrderedDither.createCrossHatchRightColorDither],
    ['crossHatchLeft', OrderedDither.createCrossHatchLeftColorDither],
    ['zigzagHorizontal', OrderedDither.createZigzagHorizontalColorDither],
    ['zigzagVertical', OrderedDither.createZigzagVerticalColorDither],
    ['checkerboard', OrderedDither.createCheckerboardColorDither],
    ['cluster', OrderedDither.createClusterColorDither],
    ['fishnet', OrderedDither.createFishnetColorDither],
    ['dot', OrderedDither.createDotColorDither],
    ['halftone', OrderedDither.createHalftoneColorDither],
    ['square', OrderedDither.createSquareColorDither],
]);

export const getColorDitherAlgorithmForItem = (algorithmModel) => {
    if (algorithmModel.orderedOpts) {
        const { pattern, dimensions, isRandom, type } =
            algorithmModel.orderedOpts;

        switch (type) {
            case 'hue-lightness':
                return OrderedDither.createHueLightnessDither(
                    pattern,
                    dimensions,
                    isRandom
                );
            case 'stark':
                return OrderedDither.createStarkColorOrderedDither(
                    dimensions,
                    pattern
                );
            case 'yliluoma-1':
                return OrderedDither.createYliluoma1ColorDither(
                    dimensions,
                    pattern
                );
            case 'yliluoma-2':
                return OrderedDither.createYliluoma2ColorDither(
                    dimensions,
                    pattern
                );
            default:
                return orderedDitherMap.get(pattern)(dimensions, isRandom);
        }
    }

    return algorithmMap.get(algorithmModel.slug);
};
