
App.WebGlImageEdge = (function(WebGl, Shader){
    function sharedUniforms(){
        return ['u_strength', 'u_image_dimensions']
    }

    function prepareStrength(strength){
        return Math.pow(strength, 5) * 100000;
    }

    function getFragmentShaderText(distanceFuncIdPrefix=null){
        const shaderText = Shader.shaderText;
        const shaderBase = shaderText('webgl-fragment-image-edge-filter-base').replace('#{{transparencyCheck}}', shaderText('webgl-transparency-check-fshader'));
        //fixed outline color
        if(!distanceFuncIdPrefix){
            return shaderBase.replace('#{{customDeclaration}}', shaderText('webgl-fragment-image-edge-filter-declaration-fixed')).replace('#{{customOutlineColor}}', shaderText('webgl-fragment-image-edge-filter-color-fixed'));
        }
        //background outline color
        const customDeclaration = shaderText('webgl-fragment-image-edge-filter-declaration-background').replace('#{{lightnessFunction}}', Shader.shaderText('webgl-fragment-shader-lightness-function')).replace('#{{hslFunctions}}', Shader.shaderText('webgl-hsl-functions')).replace('#{{distanceFunction}}', Shader.shaderText(`webgl-${distanceFuncIdPrefix}-distance`));
        const customOutlineColor = shaderText('webgl-fragment-image-edge-filter-color-background');
        return shaderBase.replace('#{{customDeclaration}}', customDeclaration).replace('#{{customOutlineColor}}', customOutlineColor);
    }

    function createImageEdgeFixedColorFunc(gl){
        const drawFunc = WebGl.createDrawImageFunc(gl, Shader.vertexShaderText, getFragmentShaderText(), sharedUniforms().concat(['u_outline_color']));
        
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
    function createEdgeBackgroundFunc(gl, distanceId){
        const distanceFuncIdPrefixes = ['hsl2', 'rgb', 'hsl2-complementary'];

        const distanceFuncIdPrefix = distanceFuncIdPrefixes[distanceId-2];
        const fragmentShaderText = getFragmentShaderText(distanceFuncIdPrefix);
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

    let cachedEdgeFuncs = new Array(4);

    function edgeFixed(gl, texture, imageWidth, imageHeight, strength, outlineColorVec){
        const cacheIndex = 0;
        if(!cachedEdgeFuncs[cacheIndex]){
            cachedEdgeFuncs[cacheIndex] = createImageEdgeFixedColorFunc(gl);
        }
        const outlineFunc = cachedEdgeFuncs[cacheIndex];
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        outlineFunc(gl, texture, imageWidth, imageHeight, prepareStrength(strength), outlineColorVec);
    }

    function edgeBackground(gl, texture, imageWidth, imageHeight, strength, colorsArray, backgroundTexture, distanceId){
        const cacheIndex = distanceId;
        if(!cachedEdgeFuncs[cacheIndex]){
            cachedEdgeFuncs[cacheIndex] = createEdgeBackgroundFunc(gl, distanceId);
        }
        const outlineFunc = cachedEdgeFuncs[cacheIndex];
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        outlineFunc(gl, texture, imageWidth, imageHeight, prepareStrength(strength), colorsArray, backgroundTexture);
    }
    
    return {
        edgeFixed,
        edgeBackground,
    };
    
})(App.WebGl, App.WebGlShader);