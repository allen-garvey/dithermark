import Threshold from '../dither/threshold.js';
import AdaptiveThreshold from '../dither/adaptive-threshold.js';
import OrderedDither from '../dither/ordered.js';
import ErrorPropDither from '../dither/error-prop.js';

const algorithmMap = new Map([
    ['threshold', Threshold.image],
    ['adaptive-threshold', AdaptiveThreshold.image],
    ['random', Threshold.randomDither],
    ['simplex', Threshold.simplexDither],
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

export const getBwDitherAlgorithmForItem = (algorithmModel) => {
    if (algorithmModel.orderedOpts) {
        const { pattern, dimensions, variant } = algorithmModel.orderedOpts;
        return OrderedDither.orderedDitherBuilder(pattern)(
            dimensions,
            variant
        );
    }

    return algorithmMap.get(algorithmModel.slug);
};
