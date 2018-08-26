import WebGl from './webgl.js';
import Shader from './webgl-shader.js';
import ImageFiltersModel from './image-filters-model.js';


function sharedUniforms(){
    return ['u_strength', 'u_image_dimensions']
}

function prepareStrength(strength){
    return Math.pow(strength, 5) * 100000;
}

function getFragmentShaderText(edgeThickness, distanceFuncIdPrefix=null){
    const shaderText = Shader.shaderText;
    const shaderBase = shaderText('webgl-fragment-edge-filter-base').replace('#{{transparencyCheck}}', shaderText('webgl-transparency-check-fshader')).replace(/#\{\{edgeThickness\}\}/g, `${parseInt(edgeThickness)}.0`);
    //fixed outline color
    if(!distanceFuncIdPrefix){
        return shaderBase.replace('#{{customDeclaration}}', shaderText('webgl-fragment-edge-filter-declaration-fixed')).replace('#{{customOutlineColor}}', shaderText('webgl-fragment-edge-filter-color-fixed'));
    }
    //background outline color
    const customDeclaration = shaderText('webgl-fragment-edge-filter-declaration-background').replace('#{{lightnessFunction}}', Shader.shaderText('webgl-fragment-shader-lightness-function')).replace('#{{hslFunctions}}', Shader.shaderText('webgl-hsl-functions')).replace('#{{distanceFunction}}', Shader.shaderText(`webgl-${distanceFuncIdPrefix}-distance`));
    const customOutlineColor = shaderText('webgl-fragment-edge-filter-color-background');
    return shaderBase.replace('#{{customDeclaration}}', customDeclaration).replace('#{{customOutlineColor}}', customOutlineColor);
}

function createImageEdgeFixedColorFunc(gl, edgeThickness){
    const drawFunc = WebGl.createDrawImageFunc(gl, Shader.vertexShaderText, getFragmentShaderText(edgeThickness), sharedUniforms().concat(['u_outline_color']));
    
    return function(gl, tex, texWidth, texHeight, strength, outlineColorVec){
        drawFunc(gl, tex, texWidth, texHeight, (gl, customUniformLocations)=>{
            //initialize uniforms
            gl.uniform1f(customUniformLocations['u_strength'], strength);
            gl.uniform2f(customUniformLocations['u_image_dimensions'], texWidth, texHeight);
            gl.uniform3fv(customUniformLocations['u_outline_color'], outlineColorVec);
        });
    };
}

//distanceId is id prop from image-filters-model
function createEdgeBackgroundFunc(gl, edgeThickness, distanceFuncIdPrefix){
    const fragmentShaderText = getFragmentShaderText(edgeThickness, distanceFuncIdPrefix);
    const drawFunc = WebGl.createDrawImageFunc(gl, Shader.vertexShaderText, fragmentShaderText, sharedUniforms().concat(['u_colors_array_length', 'u_colors_array', 'u_background_texture']));
    
    return function(gl, tex, texWidth, texHeight, strength, colorsArray, backgroundTexture){
        drawFunc(gl, tex, texWidth, texHeight, (gl, customUniformLocations)=>{
            //initialize uniforms
            gl.uniform1f(customUniformLocations['u_strength'], strength);
            gl.uniform2f(customUniformLocations['u_image_dimensions'], texWidth, texHeight);
            gl.uniform1i(customUniformLocations['u_colors_array_length'], colorsArray.length / 3);
            gl.uniform3fv(customUniformLocations['u_colors_array'], colorsArray);

            //bind textures
            gl.activeTexture(gl.TEXTURE1);
            gl.uniform1i(customUniformLocations['u_background_texture'], 1);
            gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
        });
    };
}

const cachedEdgeFuncs = {};
const outlineColorModes = ImageFiltersModel.outlineColorModes();
const edgeThicknesses = ImageFiltersModel.outlineEdgeThicknesses();

function edgeFixed(gl, texture, imageWidth, imageHeight, strength, outlineThicknessIndex, outlineColorVec){
    const cacheIndex = -1 * outlineThicknessIndex - 1;
    if(!cachedEdgeFuncs[cacheIndex]){
        cachedEdgeFuncs[cacheIndex] = createImageEdgeFixedColorFunc(gl, edgeThicknesses[outlineThicknessIndex]);
    }
    const outlineFunc = cachedEdgeFuncs[cacheIndex];
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    outlineFunc(gl, texture, imageWidth, imageHeight, prepareStrength(strength), outlineColorVec);
}

function edgeBackground(gl, texture, imageWidth, imageHeight, strength, colorsArray, backgroundTexture, outlineThicknessIndex, colorModeIndex){
    const cacheIndex = (Math.max(outlineColorModes.length, edgeThicknesses.length) + 1) * colorModeIndex + outlineThicknessIndex;
    if(!cachedEdgeFuncs[cacheIndex]){;
        cachedEdgeFuncs[cacheIndex] = createEdgeBackgroundFunc(gl, edgeThicknesses[outlineThicknessIndex], outlineColorModes[colorModeIndex].distanceFuncPrefix);
    }
    const outlineFunc = cachedEdgeFuncs[cacheIndex];
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    outlineFunc(gl, texture, imageWidth, imageHeight, prepareStrength(strength), colorsArray, backgroundTexture);
}

export default {
    edgeFixed,
    edgeBackground,
};