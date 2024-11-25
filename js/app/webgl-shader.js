/*
 * Module for shared functionality for generating vertex and fragment shaders
 * used in both BW and Color webgl dithers
 */

const shaderTextMap = new Map([
    // edge filters
    [
        'webgl-fragment-edge-filter-declaration-fixed',
        'uniform vec3 u_outline_color;',
    ],
    ['webgl-fragment-edge-filter-color-fixed', 'vec4(u_outline_color, 1.0);'],
    [
        'webgl-fragment-edge-filter-color-background',
        'vec4(get_dark_outline_color(texture2D(u_background_texture, v_texcoord).rgb), 1.0);',
    ],
    // contour filters
    [
        'webgl-fragment-contour-filter2-declaration-fixed',
        'uniform vec3 u_outline_color;',
    ],
    [
        'webgl-fragment-contour-filter2-color-fixed',
        'vec4(u_outline_color, 1.0);',
    ],
    [
        'webgl-fragment-contour-filter2-color-background',
        'vec4(get_dark_outline_color(texture2D(u_background_texture, v_texcoord).rgb), 1.0);',
    ],
    // shared dither
    [
        //used to randomize ordered dither in bw and color dithers
        'webgl-random-ordered-dither-adjustment-fshader',
        'bayerValue = bayerValue * rand(v_texcoord.xy*u_random_seed.xy);',
    ],
]);

/**
 * @param {string} id
 */
function shaderText(id) {
    if (shaderTextMap.has(id)) {
        return shaderTextMap.get(id);
    }

    const shader = document.getElementById(id).textContent;
    shaderTextMap.set(id, shader);

    return shader;
}

function generateBitwiseFunctionsText() {
    function generateOperator(functionName, operation) {
        return functionTemplate
            .replace('#{{functionName}}', functionName)
            .replace('#{{operation}}', operation);
    }
    let functionTemplate = shaderText('webgl-bitwise-function-template');
    return (
        generateOperator('AND', 'bit1IsOdd && bit2IsOdd') +
        generateOperator(
            'XOR',
            '(bit1IsOdd || bit2IsOdd) && !(bit1IsOdd && bit2IsOdd)'
        )
    );
}

export default {
    shaderText,
    vertexShaderText: shaderText('webgl-vertex-shader'),
    generateBitwiseFunctionsText: generateBitwiseFunctionsText,
    aDitherAdd1Return: 'aDitherMask3(x, y)',
    aDitherAdd2Return:
        '(aDitherMask4(x, y, 0) + aDitherMask4(x, y, 1) + aDitherMask4(x, y, 2)) / 3.0',
    aDitherAdd3Return:
        '(aDitherMask4(x, y, int(pixel.r * 3.)) + aDitherMask4(x, y, int(pixel.g * 3.)) + aDitherMask4(x, y, int(pixel.b * 3.))) / 3.0',
    aDitherXor1Return: 'aDitherMask1(x, y)',
    aDitherXor2Return:
        '(aDitherMask2(x, y, 0) + aDitherMask2(x, y, 1) + aDitherMask2(x, y, 2)) / 3.0',
    aDitherXor3Return:
        '(aDitherMask2(x, y, int(pixel.r * 3.)) + aDitherMask2(x, y, int(pixel.g * 3.)) + aDitherMask2(x, y, int(pixel.b * 3.))) / 3.0',
};
