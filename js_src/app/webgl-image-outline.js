
App.WebGlImageOutline = (function(WebGl, Shader){
    function createOutlineFunc(gl, filterNumber){
        const fragmentShaderText = Shader.shaderText('webgl-fragment-image-outline-filter'+filterNumber);
        const customUniforms = ['u_radius'];
        if(filterNumber === 2){
            customUniforms.push('u_outline_color');
        }
        const drawFunc = WebGl.createDrawImageFunc(gl, Shader.vertexShaderText, fragmentShaderText, customUniforms);
        
        return function(gl, tex, texWidth, texHeight, radius, outlineColorVec){
            drawFunc(gl, tex, texWidth, texHeight, (gl, customUniformLocations)=>{
                //initialize uniforms
                gl.uniform1f(customUniformLocations['u_radius'], radius);
                if(outlineColorVec){
                    gl.uniform3fv(customUniformLocations['u_outline_color'], outlineColorVec);
                }
            });
        };
    }

    function createOutlineBackgroundFunc(gl, isRgbDistance){
        const distanceId = isRgbDistance ? 'rgb' : 'hsl2';
        const fragmentShaderText = Shader.shaderText('webgl-fragment-image-outline-filter2-background').replace('#{{lightnessFunction}}', Shader.shaderText('webgl-fragment-shader-lightness-function')).replace('#{{hslFunctions}}', Shader.shaderText('webgl-hsl-functions')).replace('#{{distanceFunction}}', Shader.shaderText(`webgl-${distanceId}-distance`));
        const drawFunc = WebGl.createDrawImageFunc(gl, Shader.vertexShaderText, fragmentShaderText, ['u_radius', 'u_colors_array_length', 'u_colors_array', 'u_background_texture']);
        
        return function(gl, tex, texWidth, texHeight, radius, colorsArray, backgroundTexture){
            drawFunc(gl, tex, texWidth, texHeight, (gl, customUniformLocations)=>{
                //initialize uniforms
                gl.uniform1f(customUniformLocations['u_radius'], radius);
                gl.uniform1i(customUniformLocations['u_colors_array_length'], colorsArray.length / 3);
                gl.uniform3fv(customUniformLocations['u_colors_array'], colorsArray);

                //bind textures
                gl.activeTexture(gl.TEXTURE1);
                gl.uniform1i(customUniformLocations['u_background_texture'], 1);
                gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
            });
        };
    }

    let cachedOutlineFuncs = new Array(4);

    function outlineImageBase(gl, texture, imageWidth, imageHeight, filterNumber, radius, outlineColorVec=null){
        const cacheIndex = filterNumber - 1;
        if(!cachedOutlineFuncs[cacheIndex]){
            cachedOutlineFuncs[cacheIndex] = createOutlineFunc(gl, filterNumber);
        }
        const outlineFunc = cachedOutlineFuncs[cacheIndex];
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        outlineFunc(gl, texture, imageWidth, imageHeight, radius, outlineColorVec);
    }

    function outlineImage1(gl, texture, imageWidth, imageHeight, radiusPercent){
        const radius = radiusPercent / imageWidth;
        outlineImageBase(gl, texture, imageWidth, imageHeight, 1, radius);
    }

    function outlineImage2(gl, texture, imageWidth, imageHeight, radiusPercent, outlineColorVec){
        const radius = radiusPercent / imageHeight;
        outlineImageBase(gl, texture, imageWidth, imageHeight, 2, radius, outlineColorVec);
    }

    function outlineImage2Background(gl, texture, imageWidth, imageHeight, radiusPercent, colorsArray, backgroundTexture, isRgbDistance){
        const radius = radiusPercent / imageHeight;
        const cacheIndex = isRgbDistance ? 2 : 3;
        if(!cachedOutlineFuncs[cacheIndex]){
            cachedOutlineFuncs[cacheIndex] = createOutlineBackgroundFunc(gl, isRgbDistance);
        }
        const outlineFunc = cachedOutlineFuncs[cacheIndex];
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        outlineFunc(gl, texture, imageWidth, imageHeight, radius, colorsArray, backgroundTexture);
    }
    
    return {
        outlineImage1,
        outlineImage2,
        outlineImage2Background,
    };
    
})(App.WebGl, App.WebGlShader);