import BwDither from '../webgl-bw-dither.js';

/**
 * @param {boolean} isWebglHighIntPrecisionSupported
 */
export const getBwWebglTranslator = (isWebglHighIntPrecisionSupported) => {
    const webglMap = new Map([
        ['threshold', BwDither.threshold],
        ['adaptive-threshold', BwDither.adaptiveThreshold],
        ['random', BwDither.randomThreshold],
        ['simplex', BwDither.simplexThreshold],
    ]);

    const arithmeticEntries = [
        ['xor--high', BwDither.aDitherXor1],
        ['xor--medium', BwDither.aDitherXor3],
        ['xor--low', BwDither.aDitherXor2],
        ['add--high', BwDither.aDitherAdd1],
        ['add--medium', BwDither.aDitherAdd3],
        ['add--low', BwDither.aDitherAdd2],
    ];

    if (isWebglHighIntPrecisionSupported) {
        arithmeticEntries.forEach(([key, value]) => webglMap.set(key, value));
    }

    return (algorithm) => {
        if (algorithm.orderedOpts) {
            const { pattern, dimensions, isRandom } = algorithm.orderedOpts;

            return BwDither.orderedDitherBuilder(pattern)(dimensions, isRandom);
        }

        return webglMap.get(algorithm.slug) || false;
    };
};
