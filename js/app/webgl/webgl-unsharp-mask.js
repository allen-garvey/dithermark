import WebGl from './webgl.js';
import Shader from './webgl-shader.js';

const createUnsharpMaskFunc = gl => {
    const fragmentShaderText = Shader.shaderText(
        'webgl-fragment-shader-unsharp-mask'
    );
    const drawFunc = WebGl.createDrawImageFunc(
        gl,
        Shader.vertexShaderText,
        fragmentShaderText,
        ['u_strength', 'u_radius']
    );

    return function (
        gl,
        tex,
        texWidth,
        texHeight,
        blurRadius,
        unsharpMaskStrength
    ) {
        drawFunc(gl, tex, texWidth, texHeight, (gl, customUniformLocations) => {
            gl.uniform1f(
                customUniformLocations.u_strength,
                unsharpMaskStrength
            );

            gl.uniform2f(
                customUniformLocations.u_radius,
                blurRadius / texWidth,
                blurRadius / texHeight
            );
        });
    };
};

let unsharpMaskFunc = null;

const unsharpMask = (
    gl,
    texture,
    imageWidth,
    imageHeight,
    blurRadius,
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
        blurRadius,
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
    unsharpMask(
        gl,
        texture,
        imageWidth,
        imageHeight,
        blurRadius,
        unsharpMaskStrength
    );
};
