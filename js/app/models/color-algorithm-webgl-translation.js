import ColorDither from '../webgl/webgl-color-dither.js';

/**
 * @param {boolean} isWebglHighIntPrecisionSupported
 */
export const getColorWebglTranslator = isWebglHighIntPrecisionSupported => {
    const webglMap = new Map([
        ['closest-color', ColorDither.closestColor],
        ['random', ColorDither.randomClosestColor],
        ['simplex', ColorDither.simplexClosestColor],
    ]);

    const arithmeticEntries = [
        ['xor--high', ColorDither.aDitherXor1],
        ['xor--medium', ColorDither.aDitherXor3],
        ['xor--low', ColorDither.aDitherXor2],
        ['add--high', ColorDither.aDitherAdd1],
        ['add--medium', ColorDither.aDitherAdd3],
        ['add--low', ColorDither.aDitherAdd2],
    ];

    if (isWebglHighIntPrecisionSupported) {
        arithmeticEntries.forEach(([key, value]) => webglMap.set(key, value));
    }

    return algorithm => {
        if (algorithm.orderedOpts) {
            const { pattern, dimensions, variant, type } =
                algorithm.orderedOpts;

            switch (type) {
                case 'hue-lightness':
                    return ColorDither.createHueLightnessOrderedDither(
                        dimensions,
                        pattern,
                        variant
                    );
                case 'stark':
                    return ColorDither.createStarkOrderedDither(
                        dimensions,
                        pattern
                    );
                case 'yliluoma-1':
                    return ColorDither.createYliluoma1OrderedDither(
                        dimensions,
                        pattern
                    );
                case 'yliluoma-2':
                    return ColorDither.createYliluoma2OrderedDither(
                        dimensions,
                        pattern
                    );
                default:
                    return ColorDither.orderedDitherBuilder(pattern)(
                        dimensions,
                        variant
                    );
            }
        }

        return webglMap.get(algorithm.slug) || false;
    };
};
