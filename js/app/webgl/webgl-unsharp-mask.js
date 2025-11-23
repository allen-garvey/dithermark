import WebGl from './webgl.js';
import Shader from './webgl-shader.js';

const createBlurFunc = gl => {
    const fragmentShaderText = Shader.shaderText(
        'webgl-fragment-shader-triangle-blur'
    );
    const drawFunc = WebGl.createDrawImageFunc(
        gl,
        Shader.vertexShaderText,
        fragmentShaderText,
        ['u_radius']
    );

    return function (gl, tex, texWidth, texHeight, blurRadius) {
        drawFunc(gl, tex, texWidth, texHeight, (gl, customUniformLocations) => {
            gl.uniform2f(
                customUniformLocations.u_radius,
                blurRadius / texWidth,
                blurRadius / texHeight
            );
        });
    };
};

let blurFunc = null;

const blur = (gl, texture, imageWidth, imageHeight, blurRadius) => {
    blurFunc = blurFunc || createBlurFunc(gl);
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    blurFunc(gl, texture, imageWidth, imageHeight, blurRadius);
};

const createUnsharpMaskFunc = gl => {
    const fragmentShaderText = Shader.shaderText(
        'webgl-fragment-shader-unsharp-mask'
    );
    const drawFunc = WebGl.createDrawImageFunc(
        gl,
        Shader.vertexShaderText,
        fragmentShaderText,
        ['u_strength', 'u_blurred_texture']
    );

    return function (
        gl,
        tex,
        texWidth,
        texHeight,
        blurTexture,
        unsharpMaskStrength
    ) {
        drawFunc(gl, tex, texWidth, texHeight, (gl, customUniformLocations) => {
            gl.uniform1f(
                customUniformLocations.u_strength,
                unsharpMaskStrength
            );

            gl.uniform1i(customUniformLocations.u_blurred_texture, 1);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, blurTexture);
        });
    };
};

let unsharpMaskFunc = null;

const unsharpMask = (
    gl,
    texture,
    imageWidth,
    imageHeight,
    blurTexture,
    unsharpMaskStrength
) => {
    unsharpMaskFunc = unsharpMaskFunc || createUnsharpMaskFunc(gl);
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    unsharpMaskFunc(
        gl,
        texture,
        imageWidth,
        imageHeight,
        blurTexture,
        unsharpMaskStrength
    );
};

export const webglUnsharpMask = (
    gl,
    texture,
    imageWidth,
    imageHeight,
    blurRadius,
    unsharpMaskStrength
) => {
    blur(gl, texture, imageWidth, imageHeight, blurRadius);
    const blurTexture = WebGl.createAndLoadTextureFromCanvas(gl, gl.canvas);
    unsharpMask(
        gl,
        texture,
        imageWidth,
        imageHeight,
        blurTexture,
        unsharpMaskStrength
    );
    gl.deleteTexture(blurTexture);
};
