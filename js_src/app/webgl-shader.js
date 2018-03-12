/*
* Module for shared functionality for generating vertex and fragment shaders
* used in both BW and Color webgl dithers
*/
App.WebGlShader = (function(){
    function shaderText(id){
        return document.getElementById(id).textContent;
    }
    
    function generateBitwiseFunctionsText(){
        function generateOperator(functionName, operation){
            return functionTemplate.replace('#{{functionName}}', functionName).replace('#{{operation}}', operation);
        }
        let functionTemplate = shaderText('webgl-bitwise-function-template');
        return generateOperator('AND', 'mod(v1, 2.0) > 0.0 && mod(v2, 2.0) > 0.0') + generateOperator('XOR', '(mod(v1, 2.0) > 0.0 || mod(v2, 2.0) > 0.0) && !(mod(v1, 2.0) > 0.0 && mod(v2, 2.0) > 0.0)');
    }
    
    
    return {
        shaderText: shaderText,
        vertexShaderText: shaderText('webgl-threshold-vertex-shader'),
        generateBitwiseFunctionsText: generateBitwiseFunctionsText,
        aDitherAdd1Return: 'aDitherMask3(x, y)',
        aDitherAdd2Return: '(aDitherMask4(x, y, 0) + aDitherMask4(x, y, 1) + aDitherMask4(x, y, 2)) / 3.0',
        aDitherAdd3Return: '(aDitherMask4(x, y, int(pixel.r * 255.)) + aDitherMask4(x, y, int(pixel.g * 255.)) + aDitherMask4(x, y, int(pixel.b * 255.))) / 3.0',
        aDitherXor1Return: 'aDitherMask1(x, y)',
        aDitherXor2Return: '(aDitherMask2(x, y, 0) + aDitherMask2(x, y, 1) + aDitherMask2(x, y, 2)) / 3.0',
        aDitherXor3Return: '(aDitherMask2(x, y, int(pixel.r * 255.)) + aDitherMask2(x, y, int(pixel.g * 255.)) + aDitherMask2(x, y, int(pixel.b * 255.))) / 3.0',
    };
})();