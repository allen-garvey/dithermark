import Threshold from '../dither/threshold.js';
import OrderedDither from '../dither/ordered-color.js';
import ErrorPropColorDither from '../dither/error-prop-color.js';

const algorithmMap = new Map([
    ['closest-color', Threshold.closestColor],
    ['random', Threshold.randomClosestColor],
    ['simplex', Threshold.simplexClosestColor],
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
                return OrderedDither.colorOrderedDitherBuilder(pattern)(
                    dimensions,
                    isRandom
                );
        }
    }

    return algorithmMap.get(algorithmModel.slug);
};
