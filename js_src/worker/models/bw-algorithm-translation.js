import Threshold from '../../worker/dither/threshold.js';
import AdaptiveThreshold from '../../worker/dither/adaptive-threshold.js';
import OrderedDither from '../../worker/dither/ordered.js';
import ErrorPropDither from '../../worker/dither/error-prop.js';

const algorithmMap = new Map([
    ['threshold', Threshold.image],
    ['adaptive-threshold', AdaptiveThreshold.image],
    ['random', Threshold.randomDither],
    ['simplex', Threshold.randomDither],
    ['xor--high', Threshold.aditherXor1],
    ['xor--medium', Threshold.aditherXor3],
    ['xor--low', Threshold.aditherXor2],
    ['add--high', Threshold.aditherAdd1],
    ['add--medium', Threshold.aditherAdd3],
    ['add--low', Threshold.aditherAdd2],
    ['floyd-steinberg', ErrorPropDither.floydSteinberg],
    ['javis-judice-ninke', ErrorPropDither.javisJudiceNinke],
    ['stucki', ErrorPropDither.stucki],
    ['burkes', ErrorPropDither.burkes],
    ['sierra-3', ErrorPropDither.sierra3],
    ['sierra-2', ErrorPropDither.sierra2],
    ['sierra-1', ErrorPropDither.sierra1],
    ['atkinson', ErrorPropDither.atkinson],
    ['reduced-atkinson', ErrorPropDither.reducedAtkinson],
]);

const orderedDitherMap = new Map([
    ['bayer', OrderedDither.createBayerDither],
    ['hatchHorizontal', OrderedDither.createHatchHorizontalDither],
    ['hatchVertical', OrderedDither.createHatchVerticalDither],
    ['hatchRight', OrderedDither.createHatchRightDither],
    ['hatchLeft', OrderedDither.createHatchLeftDither],
    ['crossHatchHorizontal', OrderedDither.createCrossHatchHorizontalDither],
    ['crossHatchVertical', OrderedDither.createCrossHatchVerticalDither],
    ['crossHatchRight', OrderedDither.createCrossHatchRightDither],
    ['crossHatchLeft', OrderedDither.createCrossHatchLeftDither],
    ['zigzagHorizontal', OrderedDither.createZigzagHorizontalDither],
    ['zigzagVertical', OrderedDither.createZigzagVerticalDither],
    ['checkerboard', OrderedDither.createCheckerboardDither],
    ['cluster', OrderedDither.createClusterDither],
    ['fishnet', OrderedDither.createFishnetDither],
    ['dot', OrderedDither.createDotDither],
    ['halftone', OrderedDither.createHalftoneDither],
    ['square', OrderedDither.createSquareDither],
]);

export const getBwDitherAlgorithmForItem = (algorithmModel) => {
    if (algorithmModel.orderedOpts) {
        const { pattern, dimensions, isRandom } = algorithmModel.orderedOpts;
        return orderedDitherMap.get(pattern)(dimensions, isRandom);
    }

    return algorithmMap.get(algorithmModel.slug);
};
