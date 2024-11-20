import ColorDither from '../webgl-color-dither.js';

/**
 * @param {boolean} isWebglHighIntPrecisionSupported
 */
export const getColorWebglTranslator = (isWebglHighIntPrecisionSupported) => {
    const webglMap = new Map([
        ['closest-color', ColorDither.closestColor],
        ['random', ColorDither.randomClosestColor],
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

    const orderedDitherMap = new Map([
        ['bayer', ColorDither.createBayerColorDither],
        ['hatchHorizontal', ColorDither.createHatchHorizontalColorDither],
        ['hatchVertical', ColorDither.createHatchVerticalColorDither],
        ['hatchRight', ColorDither.createHatchRightColorDither],
        ['hatchLeft', ColorDither.createHatchLeftColorDither],
        [
            'crossHatchHorizontal',
            ColorDither.createCrossHatchHorizontalColorDither,
        ],
        ['crossHatchVertical', ColorDither.createCrossHatchVerticalColorDither],
        ['crossHatchRight', ColorDither.createCrossHatchRightColorDither],
        ['crossHatchLeft', ColorDither.createCrossHatchLeftColorDither],
        ['zigzagHorizontal', ColorDither.createZigzagHorizontalColorDither],
        ['zigzagVertical', ColorDither.createZigzagVerticalColorDither],
        ['checkerboard', ColorDither.createCheckerboardColorDither],
        ['cluster', ColorDither.createClusterColorDither],
        ['fishnet', ColorDither.createFishnetColorDither],
        ['dot', ColorDither.createDotColorDither],
        ['halftone', ColorDither.createHalftoneColorDither],
        ['square', ColorDither.createSquareColorDither],
    ]);

    return (algorithm) => {
        if (algorithm.orderedOpts) {
            const { pattern, dimensions, isRandom, type } =
                algorithm.orderedOpts;

            switch (type) {
                case 'hue-lightness':
                    return ColorDither.createHueLightnessOrderedDither(
                        dimensions,
                        pattern,
                        isRandom
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
                    return orderedDitherMap.get(pattern)(dimensions, isRandom);
            }
        }

        return webglMap.get(algorithm.slug) || false;
    };
};
