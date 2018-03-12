
App.WebGlColorDither = (function(WebGl, ColorDitherModes, Bayer){
    const CLOSEST_COLOR = 0;
    const RANDOM_CLOSEST_COLOR = 1;
    const ORDERED_DITHER = 2;
    const HUE_LIGHTNESS_ORDERED_DITHER = 3;
    const ADITHER_ADD1 = 4;
    const ADITHER_ADD2 = 5;
    const ADITHER_ADD3 = 6;
    const ADITHER_XOR1 = 7;
    const ADITHER_XOR2 = 8;
    const ADITHER_XOR3 = 9;
    
    const ALGO_KEYS = [CLOSEST_COLOR, RANDOM_CLOSEST_COLOR, ORDERED_DITHER, HUE_LIGHTNESS_ORDERED_DITHER, ADITHER_ADD1, ADITHER_ADD2, ADITHER_ADD3, ADITHER_XOR1, ADITHER_XOR2, ADITHER_XOR3];
    
    //creates container to lookup something by algorithm and color mode
    function createLookupContainer(){
        return ALGO_KEYS.map(()=>{return {};});
    }
    
    
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
    
    function shaderTextContainer(baseText){
        let modeDistances = [
            {id: ColorDitherModes.get('RGB').id, distanceFunc: 'webgl-rgb-distance'},
            {id: ColorDitherModes.get('HUE_LIGHTNESS').id, distanceFunc: 'webgl-hue-lightness-distance'},
            {id: ColorDitherModes.get('HSL').id, distanceFunc: 'webgl-hue-saturation-lightness-distance'},
            {id: ColorDitherModes.get('LIGHTNESS').id, distanceFunc: 'webgl-lightness-distance'},
            {id: ColorDitherModes.get('HUE').id, distanceFunc: 'webgl-hue-distance'},
        ];
        let ret = {};
        
        modeDistances.forEach((item)=>{
            ret[item.id] = fragmentShaderText(baseText, item.distanceFunc);
        });
        
        return ret; 
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
    
    //maps containing program source code
    var closestColorShaderText = shaderTextContainer(closestColorShaderBase);
    var orderedDitherShaderText = shaderTextContainer(orderedDitherSharedBase);
    var hueLightnessOrderedDitherShaderText = shaderTextContainer(hueLightnessOrderedDitherSharedBase);
    var randomDitherShaderText = shaderTextContainer(randomDitherShaderBase);
    
    var fragmentShaderTexts = createLookupContainer();
    
    //draw image compiled functions
    var drawImageFuncs = createLookupContainer();
    
    //saved bayer textures
    var bayerTextures = {};
    
    
    function closestColor(gl, texture, imageWidth, imageHeight, colorDitherModeId, colorsArray, colorsArrayLength){
        let drawImageFunc = drawImageFuncs[CLOSEST_COLOR][colorDitherModeId];
        if(!drawImageFunc){
            drawImageFunc = createWebGLDrawImageFunc(gl, closestColorShaderText[colorDitherModeId]);
            drawImageFuncs[CLOSEST_COLOR][colorDitherModeId] = drawImageFunc;
        }
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawImageFunc(gl, texture, imageWidth, imageHeight, colorsArray, colorsArrayLength);
    }
    
    function randomDither(gl, texture, imageWidth, imageHeight, colorDitherModeId, colorsArray, colorsArrayLength){
        let drawImageFunc = drawImageFuncs[RANDOM_CLOSEST_COLOR][colorDitherModeId];
        if(!drawImageFunc){
            drawImageFunc = createWebGLDrawImageFunc(gl, randomDitherShaderText[colorDitherModeId], ['u_random_seed']);
            drawImageFuncs[RANDOM_CLOSEST_COLOR][colorDitherModeId] = drawImageFunc;
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
        return createOrderedDitherBase(dimensions, orderedDitherShaderText, drawImageFuncs[ORDERED_DITHER]);
    }
    
    function createHueLightnessOrderedDither(dimensions){
        return createOrderedDitherBase(dimensions, hueLightnessOrderedDitherShaderText, drawImageFuncs[HUE_LIGHTNESS_ORDERED_DITHER]);
    }
    
    return {
        closestColor: closestColor,
        randomClosestColor: randomDither,
        createOrderedDither: createOrderedDither,
        createHueLightnessOrderedDither: createHueLightnessOrderedDither,
    };    
})(App.WebGl, App.ColorDitherModes, App.BayerWebgl);