import WebGl from './webgl.js';
import Shader from './webgl-shader.js';
import ColorDitherModes from '../../shared/color-dither-modes.js';
import Bayer from '../../shared/bayer-matrix.js';
import BayerWebgl from './webgl-bayer.js';
import DitherUtil from '../../shared/dither-util.js';
import { generateRandomSeed } from './webgl-random.js';
import {
    ORDERED_DITHER_VARIANT_RANDOM,
    ORDERED_DITHER_VARIANT_SIMPLEX,
} from '../../shared/models/ordered-dither-variants.js';

// when adding algorithm key make sure to add to ALGO_KEYS array below
const CLOSEST_COLOR = 0;
const RANDOM_CLOSEST_COLOR = 1;
const SIMPLEX_CLOSEST_COLOR = 2;
const ORDERED_DITHER = 3;
const ORDERED_DITHER_RANDOM = 4;
const ORDERED_DITHER_SIMPLEX = 5;
const HUE_LIGHTNESS_ORDERED_DITHER = 6;
const HUE_LIGHTNESS_RANDOM_ORDERED_DITHER = 7;
const HUE_LIGHTNESS_SIMPLEX_ORDERED_DITHER = 8;
const ADITHER_ADD1 = 9;
const ADITHER_ADD2 = 10;
const ADITHER_ADD3 = 11;
const ADITHER_XOR1 = 12;
const ADITHER_XOR2 = 13;
const ADITHER_XOR3 = 14;
const YLILUOMA1 = 15;
const YLILUOMA2 = 16;
const STARK_ORDERED_DITHER = 17;

const ALGO_KEYS = [
    CLOSEST_COLOR,
    RANDOM_CLOSEST_COLOR,
    SIMPLEX_CLOSEST_COLOR,
    ORDERED_DITHER,
    ORDERED_DITHER_RANDOM,
    ORDERED_DITHER_SIMPLEX,
    HUE_LIGHTNESS_ORDERED_DITHER,
    HUE_LIGHTNESS_RANDOM_ORDERED_DITHER,
    HUE_LIGHTNESS_SIMPLEX_ORDERED_DITHER,
    ADITHER_ADD1,
    ADITHER_ADD2,
    ADITHER_ADD3,
    ADITHER_XOR1,
    ADITHER_XOR2,
    ADITHER_XOR3,
    YLILUOMA1,
    YLILUOMA2,
    STARK_ORDERED_DITHER,
];

const colorDitherModeTranslation = new Map();
colorDitherModeTranslation.set(ColorDitherModes.get('RGB').id, {
    distanceFunc: 'webgl-rgb-distance',
});
colorDitherModeTranslation.set(ColorDitherModes.get('LUMA').id, {
    distanceFunc: 'webgl-luma-distance',
});
colorDitherModeTranslation.set(ColorDitherModes.get('HUE_LIGHTNESS').id, {
    distanceFunc: 'webgl-hue-lightness-distance',
});
colorDitherModeTranslation.set(ColorDitherModes.get('HSL_WEIGHTED').id, {
    distanceFunc: 'webgl-hue-saturation-lightness-distance',
});
colorDitherModeTranslation.set(ColorDitherModes.get('LIGHTNESS').id, {
    distanceFunc: 'webgl-lightness-distance',
});
colorDitherModeTranslation.set(ColorDitherModes.get('HUE').id, {
    distanceFunc: 'webgl-hue-distance',
});
colorDitherModeTranslation.set(ColorDitherModes.get('OKLAB').id, {
    distanceFunc: 'webgl-oklab-distance',
});
colorDitherModeTranslation.set(ColorDitherModes.get('OKLAB_TAXI').id, {
    distanceFunc: 'webgl-oklab-taxi-distance',
});
colorDitherModeTranslation.set(ColorDitherModes.get('CIE_LAB').id, {
    distanceFunc: 'webgl-cie-lab-distance',
});
colorDitherModeTranslation.set(ColorDitherModes.get('CIE_LAB_TAXI').id, {
    distanceFunc: 'webgl-cie-lab-taxi-distance',
});

/*
 * Shader caching
 */
function createFragmentShaderTexts() {
    const shaderText = Shader.shaderText;

    //reused webgl fragment shader texts
    const fragmentShaderBaseText = shaderText(
        'webgl-color-dither-base-fshader'
    );
    const yliluoma1FragmentShaderBase = shaderText(
        'webgl-yliluoma1-color-fshader'
    );
    const yliluoma2FragmentShaderBase = shaderText(
        'webgl-yliluoma2-color-fshader'
    );
    const starkOrderedDitherFragmentShaderBase = shaderText(
        'webgl-stark-ordered-color-dither-fshader'
    );
    const aDitherDeclaration = shaderText(
        'webgl-arithmetic-dither-fshader-declaration'
    );
    const aDitherBody = shaderText('webgl-arithmetic-dither-color-body');
    const bitwiseFunctionsText = Shader.generateBitwiseFunctionsText();
    const fragmentShaderLightnessFuncText = shaderText(
        'webgl-fragment-shader-lightness-function'
    );
    const fragmentShaderHslFuncsText = shaderText('webgl-hsl-functions');
    const fragmentShaderLabFuncsText = shaderText('webgl-lab-functions');

    function generateFragmentShader(
        customDeclaration,
        customBody,
        optionalPostscript = ''
    ) {
        return fragmentShaderBaseText
            .replace('#{{customDeclaration}}', customDeclaration)
            .replace('#{{customBody}}', customBody)
            .replace('#{{optionalPostscript}}', optionalPostscript);
    }

    function generateADitherShader(aDitherReturnValue) {
        const declaration = aDitherDeclaration
            .replace('#{{arithmeticDitherReturn}}', aDitherReturnValue)
            .replace('#{{bitwiseFunctions}}', bitwiseFunctionsText);
        return generateFragmentShader(declaration, aDitherBody);
    }

    function shaderTextContainer(baseText) {
        function fragmentShaderText(shaderBase, distanceFuncId) {
            return shaderBase
                .replace(
                    '#{{lightnessFunction}}',
                    fragmentShaderLightnessFuncText
                )
                .replace('#{{hslFunctions}}', fragmentShaderHslFuncsText)
                .replace('#{{labFunctions}}', fragmentShaderLabFuncsText)
                .replace('#{{distanceFunction}}', shaderText(distanceFuncId));
        }

        const ret = {};

        for (let [
            colorDitherModeId,
            colorDitherModeOptions,
        ] of colorDitherModeTranslation) {
            ret[colorDitherModeId] = fragmentShaderText(
                baseText,
                colorDitherModeOptions.distanceFunc
            );
        }

        return ret;
    }

    //shader declarations and bodies
    const orderedDitherDeclarationText = shaderText(
        'webgl-ordered-dither-color-declaration-fshader'
    );
    const orderedDitherBodyText = shaderText(
        'webgl-ordered-dither-color-body-fshader'
    );
    const orderedDitherVanillaBodyText = orderedDitherBodyText.replace(
        '#{{bayerValueAdjustment}}',
        ''
    );
    const orderedDitherRandomBodyText = orderedDitherBodyText.replace(
        '#{{bayerValueAdjustment}}',
        shaderText('webgl-random-ordered-dither-adjustment-fshader')
    );
    const orderedDitherSimplexBodyText = orderedDitherBodyText.replace(
        '#{{bayerValueAdjustment}}',
        shaderText('webgl-simplex-ordered-dither-adjustment-fshader')
    );
    const randomDitherDeclarationText = shaderText(
        'webgl-random-dither-declaration-fshader'
    );
    const randomDitherBodyText = shaderText(
        'webgl-random-dither-color-body-fshader'
    );
    const hueLightnessPostscriptText = shaderText(
        'webgl-hue-lightness-ordered-dither-color-postscript-fshader'
    );
    const hueLightnessDeclarationText =
        orderedDitherDeclarationText +
        shaderText(
            'webgl-hue-lightness-ordered-dither-color-declaration-fshader'
        );
    const simplexDitherBodyText = shaderText(
        'webgl-simplex-dither-color-body-fshader'
    );
    const simplexDitherDeclarationText = shaderText(
        'webgl-simplex-declaration-fshader'
    );
    //shader source code
    const closestColorShaderBase = generateFragmentShader('', '');
    const orderedDitherBase = generateFragmentShader(
        orderedDitherDeclarationText,
        orderedDitherVanillaBodyText
    );
    const orderedDitherRandomBase = generateFragmentShader(
        orderedDitherDeclarationText + randomDitherDeclarationText,
        orderedDitherRandomBodyText
    );
    const orderedDitherSimplexBase = generateFragmentShader(
        orderedDitherDeclarationText + simplexDitherDeclarationText,
        orderedDitherSimplexBodyText
    );
    const hueLightnessOrderedDitherBase = generateFragmentShader(
        hueLightnessDeclarationText,
        orderedDitherVanillaBodyText,
        hueLightnessPostscriptText
    );
    const hueLightnessRandomOrderedDitherBase = generateFragmentShader(
        hueLightnessDeclarationText + randomDitherDeclarationText,
        orderedDitherRandomBodyText,
        hueLightnessPostscriptText
    );
    const hueLightnessSimplexOrderedDitherBase = generateFragmentShader(
        hueLightnessDeclarationText + simplexDitherDeclarationText,
        orderedDitherSimplexBodyText,
        hueLightnessPostscriptText
    );
    const randomDitherShaderBase = generateFragmentShader(
        randomDitherDeclarationText,
        randomDitherBodyText
    );
    const simplexDitherShaderBase = generateFragmentShader(
        simplexDitherDeclarationText,
        simplexDitherBodyText
    );

    const fragmentShaderTexts = new Map([
        [CLOSEST_COLOR, shaderTextContainer(closestColorShaderBase)],
        [RANDOM_CLOSEST_COLOR, shaderTextContainer(randomDitherShaderBase)],
        [SIMPLEX_CLOSEST_COLOR, shaderTextContainer(simplexDitherShaderBase)],
        [ORDERED_DITHER, shaderTextContainer(orderedDitherBase)],
        [ORDERED_DITHER_RANDOM, shaderTextContainer(orderedDitherRandomBase)],
        [ORDERED_DITHER_SIMPLEX, shaderTextContainer(orderedDitherSimplexBase)],
        [
            HUE_LIGHTNESS_ORDERED_DITHER,
            shaderTextContainer(hueLightnessOrderedDitherBase),
        ],
        [
            HUE_LIGHTNESS_RANDOM_ORDERED_DITHER,
            shaderTextContainer(hueLightnessRandomOrderedDitherBase),
        ],
        [
            HUE_LIGHTNESS_SIMPLEX_ORDERED_DITHER,
            shaderTextContainer(hueLightnessSimplexOrderedDitherBase),
        ],
        [
            ADITHER_ADD1,
            shaderTextContainer(
                generateADitherShader(Shader.aDitherAdd1Return)
            ),
        ],
        [
            ADITHER_ADD2,
            shaderTextContainer(
                generateADitherShader(Shader.aDitherAdd2Return)
            ),
        ],
        [
            ADITHER_ADD3,
            shaderTextContainer(
                generateADitherShader(Shader.aDitherAdd3Return)
            ),
        ],
        [
            ADITHER_XOR1,
            shaderTextContainer(
                generateADitherShader(Shader.aDitherXor1Return)
            ),
        ],
        [
            ADITHER_XOR2,
            shaderTextContainer(
                generateADitherShader(Shader.aDitherXor2Return)
            ),
        ],
        [
            ADITHER_XOR3,
            shaderTextContainer(
                generateADitherShader(Shader.aDitherXor3Return)
            ),
        ],
        [YLILUOMA1, shaderTextContainer(yliluoma1FragmentShaderBase)],
        [YLILUOMA2, shaderTextContainer(yliluoma2FragmentShaderBase)],
        [
            STARK_ORDERED_DITHER,
            shaderTextContainer(starkOrderedDitherFragmentShaderBase),
        ],
    ]);

    return fragmentShaderTexts;
}

//map containing fragment shader source code
const fragmentShaderTexts = createFragmentShaderTexts();

//draw image compiled functions
const drawImageFuncs = new Map(ALGO_KEYS.map(key => [key, new Map()]));

//saved bayer textures
const bayerTextures = new Map();

/**
 * Actual webgl function creation
 * @param {WebGL2RenderingContext} gl
 * @param {string} fragmentShaderText
 * @param {number} colorDitherModeId
 * @param {string[]} customUniformNames
 */
function createWebGLDrawImageFunc(
    gl,
    fragmentShaderText,
    colorDitherModeId,
    customUniformNames = []
) {
    customUniformNames = customUniformNames.concat([
        'u_colors_array',
        'u_colors_array_transformed',
        'u_colors_array_length',
        'u_dither_r_coefficient',
    ]);
    const drawFunc = WebGl.createDrawImageFunc(
        gl,
        Shader.vertexShaderText,
        fragmentShaderText,
        customUniformNames
    );

    return function (
        gl,
        tex,
        texWidth,
        texHeight,
        colorsArray,
        colorsArrayLength,
        setCustomUniformsFunc
    ) {
        drawFunc(gl, tex, texWidth, texHeight, (gl, customUniformLocations) => {
            gl.uniform1i(
                customUniformLocations['u_colors_array_length'],
                colorsArrayLength
            );
            gl.uniform3fv(
                customUniformLocations['u_colors_array'],
                colorsArray
            );
            gl.uniform1f(
                customUniformLocations['u_dither_r_coefficient'],
                DitherUtil.ditherRCoefficient(colorsArrayLength, true)
            );

            //set custom uniform values
            if (setCustomUniformsFunc) {
                setCustomUniformsFunc(gl, customUniformLocations);
            }
        });
    };
}

/**
 *
 * @param {number} algoKey
 * @param {number} colorDitherModeId
 * @param {Function} createDrawFunc
 * @returns {Function}
 */
const getCachedDrawImageFunc = (algoKey, colorDitherModeId, createDrawFunc) => {
    const algoFuncMap = drawImageFuncs.get(algoKey);
    let drawImageFunc = algoFuncMap.get(colorDitherModeId);
    if (!drawImageFunc) {
        drawImageFunc = createDrawFunc();
        algoFuncMap.set(colorDitherModeId, drawImageFunc);
    }
    return drawImageFunc;
};

function closestColor(
    gl,
    texture,
    imageWidth,
    imageHeight,
    colorDitherModeId,
    colorsArray,
    colorsArrayLength
) {
    const drawImageFunc = getCachedDrawImageFunc(
        CLOSEST_COLOR,
        colorDitherModeId,
        () =>
            createWebGLDrawImageFunc(
                gl,
                fragmentShaderTexts.get(CLOSEST_COLOR)[colorDitherModeId],
                colorDitherModeId
            )
    );
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    drawImageFunc(
        gl,
        texture,
        imageWidth,
        imageHeight,
        colorsArray,
        colorsArrayLength
    );
}

function simplexClosestColor(
    gl,
    texture,
    imageWidth,
    imageHeight,
    colorDitherModeId,
    colorsArray,
    colorsArrayLength
) {
    const drawImageFunc = getCachedDrawImageFunc(
        SIMPLEX_CLOSEST_COLOR,
        colorDitherModeId,
        () =>
            createWebGLDrawImageFunc(
                gl,
                fragmentShaderTexts.get(SIMPLEX_CLOSEST_COLOR)[
                    colorDitherModeId
                ],
                colorDitherModeId
            )
    );
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    drawImageFunc(
        gl,
        texture,
        imageWidth,
        imageHeight,
        colorsArray,
        colorsArrayLength
    );
}

function randomDither(
    gl,
    texture,
    imageWidth,
    imageHeight,
    colorDitherModeId,
    colorsArray,
    colorsArrayLength
) {
    const drawImageFunc = getCachedDrawImageFunc(
        RANDOM_CLOSEST_COLOR,
        colorDitherModeId,
        () =>
            createWebGLDrawImageFunc(
                gl,
                fragmentShaderTexts.get(RANDOM_CLOSEST_COLOR)[
                    colorDitherModeId
                ],
                colorDitherModeId,
                ['u_random_seed']
            )
    );

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    drawImageFunc(
        gl,
        texture,
        imageWidth,
        imageHeight,
        colorsArray,
        colorsArrayLength,
        (gl, customUniformLocations) => {
            gl.uniform2f(
                customUniformLocations['u_random_seed'],
                generateRandomSeed(),
                generateRandomSeed()
            );
        }
    );
}

function orderedDither(
    algoKey,
    gl,
    texture,
    imageWidth,
    imageHeight,
    colorDitherModeId,
    colorsArray,
    colorsArrayLength,
    bayerTexture,
    bayerDimensions,
    variant
) {
    const drawImageFunc = getCachedDrawImageFunc(
        algoKey,
        colorDitherModeId,
        () => {
            let customUniforms = [
                'u_bayer_texture_dimensions',
                'u_bayer_texture',
            ];
            if (variant === ORDERED_DITHER_VARIANT_RANDOM) {
                customUniforms = customUniforms.concat(['u_random_seed']);
            }
            return createWebGLDrawImageFunc(
                gl,
                fragmentShaderTexts.get(algoKey)[colorDitherModeId],
                colorDitherModeId,
                customUniforms
            );
        }
    );

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    drawImageFunc(
        gl,
        texture,
        imageWidth,
        imageHeight,
        colorsArray,
        colorsArrayLength,
        (gl, customUniformLocations) => {
            //bind bayer texture to second texture unit
            gl.uniform1i(customUniformLocations['u_bayer_texture'], 1);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, bayerTexture);

            //set bayer texture dimensions
            gl.uniform1f(
                customUniformLocations['u_bayer_texture_dimensions'],
                bayerDimensions
            );

            if (variant === ORDERED_DITHER_VARIANT_RANDOM) {
                gl.uniform2f(
                    customUniformLocations['u_random_seed'],
                    generateRandomSeed(),
                    generateRandomSeed()
                );
            }
        }
    );
}

function createOrderedDitherBase(dimensions, algoKey, bayerFuncName, variant) {
    let bayerKey = `${bayerFuncName}-${dimensions}`;
    return (
        gl,
        texture,
        imageWidth,
        imageHeight,
        colorDitherModeId,
        colorsArray,
        colorsArrayLength
    ) => {
        let bayerTexture = bayerTextures.get(bayerKey);
        if (!bayerTexture) {
            bayerTexture = BayerWebgl.createAndLoadTexture(
                gl,
                Bayer[bayerFuncName](dimensions),
                dimensions
            );
            bayerTextures.set(bayerKey, bayerTexture);
        }
        orderedDither(
            algoKey,
            gl,
            texture,
            imageWidth,
            imageHeight,
            colorDitherModeId,
            colorsArray,
            colorsArrayLength,
            bayerTexture,
            dimensions,
            variant
        );
    };
}

const getAlgoKey = (algoKey, variant) => {
    if (variant === undefined) {
        return algoKey;
    }
    if (algoKey === ORDERED_DITHER) {
        switch (variant) {
            case ORDERED_DITHER_VARIANT_RANDOM:
                return ORDERED_DITHER_RANDOM;
            case ORDERED_DITHER_VARIANT_SIMPLEX:
                return ORDERED_DITHER_SIMPLEX;
            default:
                return ORDERED_DITHER;
        }
    }
    switch (variant) {
        case ORDERED_DITHER_VARIANT_RANDOM:
            return HUE_LIGHTNESS_RANDOM_ORDERED_DITHER;
        case ORDERED_DITHER_VARIANT_SIMPLEX:
            return HUE_LIGHTNESS_SIMPLEX_ORDERED_DITHER;
        default:
            return HUE_LIGHTNESS_ORDERED_DITHER;
    }
};

function orderedDitherBuilder(bayerFuncName, algoKey = ORDERED_DITHER) {
    return function (dimensions, variant) {
        const adjustedAlgoKey = getAlgoKey(algoKey, variant);
        return createOrderedDitherBase(
            dimensions,
            adjustedAlgoKey,
            bayerFuncName,
            variant
        );
    };
}

function orderedDitherBuilder2(algoKey = ORDERED_DITHER) {
    return function (dimensions, bayerFuncName, variant) {
        const adjustedAlgoKey = getAlgoKey(algoKey, variant);
        return createOrderedDitherBase(
            dimensions,
            adjustedAlgoKey,
            bayerFuncName,
            variant
        );
    };
}

function createArithmeticDither(key) {
    return (
        gl,
        texture,
        imageWidth,
        imageHeight,
        colorDitherModeId,
        colorsArray,
        colorsArrayLength
    ) => {
        const drawImageFunc = getCachedDrawImageFunc(
            key,
            colorDitherModeId,
            () =>
                createWebGLDrawImageFunc(
                    gl,
                    fragmentShaderTexts.get(key)[colorDitherModeId],
                    colorDitherModeId
                )
        );

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawImageFunc(
            gl,
            texture,
            imageWidth,
            imageHeight,
            colorsArray,
            colorsArrayLength
        );
    };
}

export default {
    closestColor,
    randomClosestColor: randomDither,
    simplexClosestColor,
    aDitherAdd1: createArithmeticDither(ADITHER_ADD1),
    aDitherAdd2: createArithmeticDither(ADITHER_ADD2),
    aDitherAdd3: createArithmeticDither(ADITHER_ADD3),
    aDitherXor1: createArithmeticDither(ADITHER_XOR1),
    aDitherXor2: createArithmeticDither(ADITHER_XOR2),
    aDitherXor3: createArithmeticDither(ADITHER_XOR3),
    createHueLightnessOrderedDither: orderedDitherBuilder2(
        HUE_LIGHTNESS_ORDERED_DITHER
    ),
    createYliluoma1OrderedDither: orderedDitherBuilder2(YLILUOMA1),
    createYliluoma2OrderedDither: orderedDitherBuilder2(YLILUOMA2),
    createStarkOrderedDither: orderedDitherBuilder2(STARK_ORDERED_DITHER),
    orderedDitherBuilder,
};
