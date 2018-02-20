
App.WebGlColorDither = (function(WebGl, ColorDitherModes, Bayer){
    
    /*
    * Actual webgl function creation
    */
    function createWebGLDrawImageFunc(gl, fragmentShaderText, customUniformNames){
        customUniformNames = customUniformNames || [];
        customUniformNames = customUniformNames.concat(['u_colors_array', 'u_colors_array_length']);
        
        var drawFunc = WebGl.createDrawImageFunc(gl, vertexShaderText, fragmentShaderText, customUniformNames);
        
        return function(gl, tex, texWidth, texHeight, colorsArray, colorsArrayLength, setCustomUniformsFunc){
            drawFunc(gl, tex, texWidth, texHeight, (gl, customUniformLocations)=>{
                gl.uniform1i(customUniformLocations['u_colors_array_length'], colorsArrayLength);
            
                gl.uniform3fv(customUniformLocations['u_colors_array'], colorsArray);
                
                //set custom uniform values
                if(setCustomUniformsFunc){
                    setCustomUniformsFunc(gl, customUniformLocations);
                }
            });
        };
    }
    
    /*
    * Shader caching
    */
    
    function shaderText(id){
        return document.getElementById(id).textContent;
    }
    
    function compileColorDither(baseText, customDeclarationId, customBodyId){
        return baseText.replace('#{{customDeclaration}}', shaderText(customDeclarationId)).replace('#{{customBody}}', shaderText(customBodyId));
    }
    
    function fragmentShaderText(shaderBase, distanceFuncId){
        return shaderBase.replace('#{{lightnessFunction}}', fragmentShaderLightnessFuncText).replace('#{{hslFunctions}}', fragmentShaderHslFuncsText).replace('#{{distanceFunction}}', shaderText(distanceFuncId));
    }
    
    //reused webgl fragment shader texts
    var fragmentShaderBaseText = shaderText('webgl-color-dither-base-fshader');
    var fragmentShaderLightnessFuncText = shaderText('webgl-fragment-shader-lightness-function');
    var fragmentShaderHslFuncsText = shaderText('webgl-hsl-functions');
    //vertex shader
    var vertexShaderText = shaderText('webgl-threshold-vertex-shader');
    //fragment shaders
    var closestColorShaderBase = shaderText('webgl-closest-color-fshader');
    var orderedDitherSharedBase = compileColorDither(fragmentShaderBaseText, 'webgl-ordered-dither-color-declaration-fshader', 'webgl-ordered-dither-color-body-fshader');
    var hueLightnessOrderedDitherSharedBase = compileColorDither(fragmentShaderBaseText ,'webgl-hue-lightness-ordered-dither-color-declaration-fshader', 'webgl-hue-lightness-ordered-dither-color-body-fshader');
    var randomDitherShaderBase = compileColorDither(fragmentShaderBaseText, 'webgl-random-dither-color-declaration-fshader', 'webgl-random-dither-color-body-fshader');
    
    var closestColorShaderText = {};
    closestColorShaderText[ColorDitherModes.get('RGB').id] = fragmentShaderText(closestColorShaderBase, 'webgl-rgb-distance');
    closestColorShaderText[ColorDitherModes.get('HUE_LIGHTNESS').id] = fragmentShaderText(closestColorShaderBase, 'webgl-hue-lightness-distance');
    closestColorShaderText[ColorDitherModes.get('HSL').id] = fragmentShaderText(closestColorShaderBase, 'webgl-hue-saturation-lightness-distance');
    closestColorShaderText[ColorDitherModes.get('LIGHTNESS').id] = fragmentShaderText(closestColorShaderBase, 'webgl-lightness-distance');
    
    var orderedDitherShaderText = {};
    orderedDitherShaderText[ColorDitherModes.get('RGB').id] = fragmentShaderText(orderedDitherSharedBase, 'webgl-rgb-distance');
    orderedDitherShaderText[ColorDitherModes.get('HUE_LIGHTNESS').id] = fragmentShaderText(orderedDitherSharedBase, 'webgl-hue-lightness-distance');
    orderedDitherShaderText[ColorDitherModes.get('HSL').id] = fragmentShaderText(orderedDitherSharedBase, 'webgl-hue-saturation-lightness-distance');
    orderedDitherShaderText[ColorDitherModes.get('LIGHTNESS').id] = fragmentShaderText(orderedDitherSharedBase, 'webgl-lightness-distance');
    
    var hueLightnessOrderedDitherShaderText = {};
    hueLightnessOrderedDitherShaderText[ColorDitherModes.get('RGB').id] = fragmentShaderText(hueLightnessOrderedDitherSharedBase, 'webgl-rgb-distance');
    hueLightnessOrderedDitherShaderText[ColorDitherModes.get('HUE_LIGHTNESS').id] = fragmentShaderText(hueLightnessOrderedDitherSharedBase, 'webgl-hue-lightness-distance');
    hueLightnessOrderedDitherShaderText[ColorDitherModes.get('HSL').id] = fragmentShaderText(hueLightnessOrderedDitherSharedBase, 'webgl-hue-saturation-lightness-distance');
    hueLightnessOrderedDitherShaderText[ColorDitherModes.get('LIGHTNESS').id] = fragmentShaderText(hueLightnessOrderedDitherSharedBase, 'webgl-lightness-distance');
    
    var randomDitherShaderText = {};
    randomDitherShaderText[ColorDitherModes.get('RGB').id] = fragmentShaderText(randomDitherShaderBase, 'webgl-rgb-distance');
    randomDitherShaderText[ColorDitherModes.get('HUE_LIGHTNESS').id] = fragmentShaderText(randomDitherShaderBase, 'webgl-hue-lightness-distance');
    randomDitherShaderText[ColorDitherModes.get('HSL').id] = fragmentShaderText(randomDitherShaderBase, 'webgl-hue-saturation-lightness-distance');
    randomDitherShaderText[ColorDitherModes.get('LIGHTNESS').id] = fragmentShaderText(randomDitherShaderBase, 'webgl-lightness-distance');
    
    //draw image created functions
    var drawImageClosestColor = {};
    var drawImageOrderedDither = {};
    var drawImageHueLightnessOrderedDither = {};
    var drawImageRandomDither = {};
    
    //saved bayer textures
    var bayerTextures = {};
    
    
    function closestColor(gl, texture, imageWidth, imageHeight, colorDitherModeId, colorsArray, colorsArrayLength){
        let drawImageFunc = drawImageClosestColor[colorDitherModeId];
        if(!drawImageFunc){
            drawImageFunc = createWebGLDrawImageFunc(gl, closestColorShaderText[colorDitherModeId]);
            drawImageClosestColor[colorDitherModeId] = drawImageFunc;
        }
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawImageFunc(gl, texture, imageWidth, imageHeight, colorsArray, colorsArrayLength);
    }
    
    function randomDither(gl, texture, imageWidth, imageHeight, colorDitherModeId, colorsArray, colorsArrayLength){
        let drawImageFunc = drawImageRandomDither[colorDitherModeId];
        if(!drawImageFunc){
            drawImageFunc = createWebGLDrawImageFunc(gl, randomDitherShaderText[colorDitherModeId], ['u_random_seed']);
            drawImageRandomDither[colorDitherModeId] = drawImageFunc;
        }
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawImageFunc(gl, texture, imageWidth, imageHeight, colorsArray, colorsArrayLength, (gl, customUniformLocations)=>{
            //set random seed
            var randomSeed = new Float32Array(2);
            randomSeed[0] = Math.random();
            randomSeed[1] = Math.random();
            gl.uniform2fv(customUniformLocations['u_random_seed'], randomSeed);
        });
    }
    
    function orderedDither(shaderTextContainer, drawImageFuncContainer, gl, texture, imageWidth, imageHeight, colorDitherModeId, colorsArray, colorsArrayLength, bayerTexture, bayerDimensions){
        let drawImageFunc = drawImageFuncContainer[colorDitherModeId];
        if(!drawImageFunc){
            drawImageFunc = createWebGLDrawImageFunc(gl, shaderTextContainer[colorDitherModeId], ['u_bayer_texture_dimensions', 'u_bayer_texture']);
            drawImageFuncContainer[colorDitherModeId] = drawImageFunc;
        }
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawImageFunc(gl, texture, imageWidth, imageHeight, colorsArray, colorsArrayLength, (gl, customUniformLocations)=>{
            //bind bayer texture to second texture unit
            gl.uniform1i(customUniformLocations['u_bayer_texture'], 1);
          
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, bayerTexture);
            
            //set bayer texture dimensions
            gl.uniform1f(customUniformLocations['u_bayer_texture_dimensions'], bayerDimensions);
        });
    }
    
    function createOrderedDitherBase(dimensions, shaderTextContainer, drawImageFuncContainer){
        return (gl, texture, imageWidth, imageHeight, colorDitherModeId, colorsArray, colorsArrayLength)=>{
            let bayerTexture = bayerTextures[dimensions];
            if(!bayerTexture){
                bayerTexture = Bayer.createAndLoadTexture(gl, Bayer.create(dimensions), dimensions);
                bayerTextures[dimensions] = bayerTexture;
            }
            orderedDither(shaderTextContainer, drawImageFuncContainer, gl, texture, imageWidth, imageHeight, colorDitherModeId, colorsArray, colorsArrayLength, bayerTexture, dimensions);
        };
    }
    
    function createOrderedDither(dimensions){
        return createOrderedDitherBase(dimensions, orderedDitherShaderText, drawImageOrderedDither);
    }
    
    function createHueLightnessOrderedDither(dimensions){
        return createOrderedDitherBase(dimensions, hueLightnessOrderedDitherShaderText, drawImageHueLightnessOrderedDither);
    }
    
    return {
        closestColor: closestColor,
        randomClosestColor: randomDither,
        createOrderedDither: createOrderedDither,
        createHueLightnessOrderedDither: createHueLightnessOrderedDither,
    };    
})(App.WebGl, App.ColorDitherModes, App.BayerWebgl);