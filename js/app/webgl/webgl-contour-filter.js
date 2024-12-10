import WebGl from './webgl.js';
import Shader from './webgl-shader.js';
import ImageFiltersModel from '../models/image-filters.js';

function createOutlineFunc(gl, filterNumber) {
    const customUniforms = ['u_radius'];
    let fragmentShaderText;
    if (filterNumber === 2) {
        fragmentShaderText = getOutline2ShaderText();
        customUniforms.push('u_outline_color');
    } else {
        const shaderText = Shader.shaderText;
        fragmentShaderText = shaderText('webgl-fragment-contour-filter1');
    }
    const drawFunc = WebGl.createDrawImageFunc(
        gl,
        Shader.vertexShaderText,
        fragmentShaderText,
        customUniforms
    );

    return function (gl, tex, texWidth, texHeight, radius, outlineColorVec) {
        drawFunc(gl, tex, texWidth, texHeight, (gl, customUniformLocations) => {
            //initialize uniforms
            gl.uniform1f(customUniformLocations['u_radius'], radius);
            if (outlineColorVec) {
                gl.uniform3fv(
                    customUniformLocations['u_outline_color'],
                    outlineColorVec
                );
            }
        });
    };
}

function getOutline2ShaderText(distanceFuncIdPrefix = null) {
    const shaderText = Shader.shaderText;
    const shaderBase = shaderText('webgl-fragment-contour-filter2-base');
    //fixed outline color
    if (!distanceFuncIdPrefix) {
        return shaderBase
            .replace(
                '#{{customDeclaration}}',
                shaderText('webgl-fragment-contour-filter2-declaration-fixed')
            )
            .replace(
                '#{{customOutlineColor}}',
                shaderText('webgl-fragment-contour-filter2-color-fixed')
            );
    }
    //background outline color
    const customDeclaration = shaderText(
        'webgl-fragment-contour-filter2-declaration-background'
    )
        .replace(
            '#{{lightnessFunction}}',
            Shader.shaderText('webgl-fragment-shader-lightness-function')
        )
        .replace('#{{hslFunctions}}', Shader.shaderText('webgl-hsl-functions'))
        .replace(
            '#{{distanceFunction}}',
            Shader.shaderText(`webgl-${distanceFuncIdPrefix}-distance`)
        );
    const customOutlineColor = shaderText(
        'webgl-fragment-contour-filter2-color-background'
    );
    return shaderBase
        .replace('#{{customDeclaration}}', customDeclaration)
        .replace('#{{customOutlineColor}}', customOutlineColor);
}

//distanceId is id prop from image-filters-model
function createOutlineBackgroundFunc(gl, distanceFuncIdPrefix) {
    const fragmentShaderText = getOutline2ShaderText(distanceFuncIdPrefix);
    const drawFunc = WebGl.createDrawImageFunc(
        gl,
        Shader.vertexShaderText,
        fragmentShaderText,
        [
            'u_radius',
            'u_colors_array_length',
            'u_colors_array',
            'u_background_texture',
        ]
    );

    return function (
        gl,
        tex,
        texWidth,
        texHeight,
        radius,
        colorsArray,
        backgroundTexture
    ) {
        drawFunc(gl, tex, texWidth, texHeight, (gl, customUniformLocations) => {
            //initialize uniforms
            gl.uniform1f(customUniformLocations['u_radius'], radius);
            gl.uniform1i(
                customUniformLocations['u_colors_array_length'],
                colorsArray.length / 3
            );
            gl.uniform3fv(
                customUniformLocations['u_colors_array'],
                colorsArray
            );

            //bind textures
            gl.activeTexture(gl.TEXTURE1);
            gl.uniform1i(customUniformLocations['u_background_texture'], 1);
            gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
        });
    };
}

const cachedOutlineFuncs = {};
const outlineColorModes = ImageFiltersModel.outlineColorModes();

function outlineImageBase(
    gl,
    texture,
    imageWidth,
    imageHeight,
    filterNumber,
    radius,
    outlineColorVec = null
) {
    const cacheIndex = -1 * filterNumber;
    if (!cachedOutlineFuncs[cacheIndex]) {
        cachedOutlineFuncs[cacheIndex] = createOutlineFunc(gl, filterNumber);
    }
    const outlineFunc = cachedOutlineFuncs[cacheIndex];
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    outlineFunc(gl, texture, imageWidth, imageHeight, radius, outlineColorVec);
}

function outlineImage1(gl, texture, imageWidth, imageHeight, radiusPercent) {
    const radius = radiusPercent / imageWidth;
    outlineImageBase(gl, texture, imageWidth, imageHeight, 1, radius);
}

function outlineImage2(
    gl,
    texture,
    imageWidth,
    imageHeight,
    radiusPercent,
    outlineColorVec
) {
    const radius = radiusPercent / imageHeight;
    outlineImageBase(
        gl,
        texture,
        imageWidth,
        imageHeight,
        2,
        radius,
        outlineColorVec
    );
}

function outlineImage2Background(
    gl,
    texture,
    imageWidth,
    imageHeight,
    radiusPercent,
    colorsArray,
    backgroundTexture,
    colorModeIndex
) {
    const radius = radiusPercent / imageHeight;
    const cacheIndex = colorModeIndex;
    if (!cachedOutlineFuncs[cacheIndex]) {
        cachedOutlineFuncs[cacheIndex] = createOutlineBackgroundFunc(
            gl,
            outlineColorModes[colorModeIndex].distanceFuncPrefix
        );
    }
    const outlineFunc = cachedOutlineFuncs[cacheIndex];
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    outlineFunc(
        gl,
        texture,
        imageWidth,
        imageHeight,
        radius,
        colorsArray,
        backgroundTexture
    );
}

export default {
    outlineImage1,
    outlineImage2,
    outlineImage2Background,
};
