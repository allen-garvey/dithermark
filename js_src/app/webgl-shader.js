/*
 * Module for shared functionality for generating vertex and fragment shaders
 * used in both BW and Color webgl dithers
 */

const shaderTextMap = new Map();

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
