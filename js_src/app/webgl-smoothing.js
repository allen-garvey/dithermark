import WebGl from './webgl.js';
import Shader from './webgl-shader.js';

function createSmoothingFunc(gl){
    const fragmentShaderText = Shader.shaderText('webgl-fragment-shader-smoothing').replace('#{{transparencyCheck}}', Shader.shaderText('webgl-transparency-check-fshader'));
    const drawFunc = WebGl.createDrawImageFunc(gl, Shader.vertexShaderText, fragmentShaderText, ['u_radius', 'u_image_dimensions']);
    
    return function(gl, tex, texWidth, texHeight, smoothingRadius){
        drawFunc(gl, tex, texWidth, texHeight, (gl, customUniformLocations)=>{
            //initialize uniforms
            gl.uniform1i(customUniformLocations['u_radius'], smoothingRadius);
            gl.uniform2f(customUniformLocations['u_image_dimensions'], texWidth, texHeight);
        });
    };
}

let smoothingFunc = null;

function smooth(gl, texture, imageWidth, imageHeight, smoothingRadius){
    smoothingFunc = smoothingFunc || createSmoothingFunc(gl);
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    smoothingFunc(gl, texture, imageWidth, imageHeight, smoothingRadius);
}



export default {
    smooth,
};
    