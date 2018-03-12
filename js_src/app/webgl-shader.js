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
    };
})();