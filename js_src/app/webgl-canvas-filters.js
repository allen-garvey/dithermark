/**
 * WebGl versions of canvas css filters for browsers that don't support them (Safari and Edge)
 * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter 
 */

import WebGl from './webgl.js';
import Shader from './webgl-shader.js';

function createFilterFunc(gl){
    const fragmentShaderText = Shader.shaderText('webgl-fragment-canvas-filters').replace('#{{transparencyCheck}}', Shader.shaderText('webgl-transparency-check-fshader')).replace('#{{hsvFunctions}}', Shader.shaderText('webgl-hsv-functions'));
    const drawFunc = WebGl.createDrawImageFunc(gl, Shader.vertexShaderText, fragmentShaderText, ['u_contrast', 'u_saturation', 'u_brightness', 'u_hue_rotation']);
    
    return function(gl, tex, texWidth, texHeight, contrastPercentage, saturationPercentage, brightnessPercentage, hueRotation){
        drawFunc(gl, tex, texWidth, texHeight, (gl, customUniformLocations)=>{
            //initialize uniforms
            gl.uniform1f(customUniformLocations['u_contrast'], contrastPercentage);
            gl.uniform1f(customUniformLocations['u_saturation'], saturationPercentage);
            gl.uniform1f(customUniformLocations['u_brightness'], brightnessPercentage);
            gl.uniform1f(customUniformLocations['u_hue_rotation'], hueRotation);
        });
    };
}

let filterFunc = null;

function filter(gl, texture, imageWidth, imageHeight, contrastPercentage=100, saturationPercentage=100, brightnessPercentage=100, hueRotation=0){
    //normalize arguments
    //contrast value of 1.5 correlates to 200% of native canvas filters
    contrastPercentage = contrastPercentage / 100 - 1;
    if(contrastPercentage > 0){
        contrastPercentage /= 2;
    }
    saturationPercentage = saturationPercentage / 100
    hueRotation = hueRotation / 360;
    brightnessPercentage /= 100;
    filterFunc = filterFunc || createFilterFunc(gl);
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    filterFunc(gl, texture, imageWidth, imageHeight, contrastPercentage, saturationPercentage, brightnessPercentage, hueRotation);
}



export default {
    filter,
};