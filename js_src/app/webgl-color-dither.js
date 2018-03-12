
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
    
    
    function createFragmentShaderTexts(){
        //reused webgl fragment shader texts
        let fragmentShaderBaseText = shaderText('webgl-color-dither-base-fshader');
        let fragmentShaderLightnessFuncText = shaderText('webgl-fragment-shader-lightness-function');
        let fragmentShaderHslFuncsText = shaderText('webgl-hsl-functions');
        
        function compileColorDither(baseText, customDeclarationId, customBodyId){
            return baseText.replace('#{{customDeclaration}}', shaderText(customDeclarationId)).replace('#{{customBody}}', shaderText(customBodyId));
        }
        
        function fragmentShaderText(shaderBase, distanceFuncId){
            return shaderBase.replace('#{{lightnessFunction}}', fragmentShaderLightnessFuncText).replace('#{{hslFunctions}}', fragmentShaderHslFuncsText).replace('#{{distanceFunction}}', shaderText(distanceFuncId));
        }
        
        function shaderTextContainer(baseText){
            let modeDistances = [
                {key: 'RGB', distanceFunc: 'webgl-rgb-distance'},
                {key: 'HUE_LIGHTNESS', distanceFunc: 'webgl-hue-lightness-distance'},
                {key: 'HSL', distanceFunc: 'webgl-hue-saturation-lightness-distance'},
                {key: 'LIGHTNESS', distanceFunc: 'webgl-lightness-distance'},
                {key: 'HUE', distanceFunc: 'webgl-hue-distance'},
            ];
            
            let ret = {};
            
            modeDistances.forEach((item)=>{
                ret[ColorDitherModes.get(item.key).id] = fragmentShaderText(baseText, item.distanceFunc);
            });
            
            return ret; 
        }
        
        let closestColorShaderBase = shaderText('webgl-closest-color-fshader');
        let orderedDitherSharedBase = compileColorDither(fragmentShaderBaseText, 'webgl-ordered-dither-color-declaration-fshader', 'webgl-ordered-dither-color-body-fshader');
        let hueLightnessOrderedDitherSharedBase = compileColorDither(fragmentShaderBaseText ,'webgl-hue-lightness-ordered-dither-color-declaration-fshader', 'webgl-hue-lightness-ordered-dither-color-body-fshader');
        let randomDitherShaderBase = compileColorDither(fragmentShaderBaseText, 'webgl-random-dither-color-declaration-fshader', 'webgl-random-dither-color-body-fshader');
        
        //map containing program source code
        let fragmentShaderTexts = createLookupContainer();
        fragmentShaderTexts[CLOSEST_COLOR] = shaderTextContainer(closestColorShaderBase);
        fragmentShaderTexts[RANDOM_CLOSEST_COLOR] = shaderTextContainer(randomDitherShaderBase);
        fragmentShaderTexts[ORDERED_DITHER] = shaderTextContainer(orderedDitherSharedBase);
        fragmentShaderTexts[HUE_LIGHTNESS_ORDERED_DITHER] = shaderTextContainer(hueLightnessOrderedDitherSharedBase);
        
        return fragmentShaderTexts;
    }
    
    //vertex shader
    var vertexShaderText = shaderText('webgl-threshold-vertex-shader');
    
    //map containing fragment shader source code
    var fragmentShaderTexts = createFragmentShaderTexts();
    
    //draw image compiled functions
    var drawImageFuncs = createLookupContainer();
    
    //saved bayer textures
    var bayerTextures = {};
    
    
    function closestColor(gl, texture, imageWidth, imageHeight, colorDitherModeId, colorsArray, colorsArrayLength){
        let drawImageFunc = drawImageFuncs[CLOSEST_COLOR][colorDitherModeId];
        if(!drawImageFunc){
            drawImageFunc = createWebGLDrawImageFunc(gl, fragmentShaderTexts[CLOSEST_COLOR][colorDitherModeId]);
            drawImageFuncs[CLOSEST_COLOR][colorDitherModeId] = drawImageFunc;
        }
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawImageFunc(gl, texture, imageWidth, imageHeight, colorsArray, colorsArrayLength);
    }
    
    function randomDither(gl, texture, imageWidth, imageHeight, colorDitherModeId, colorsArray, colorsArrayLength){
        let drawImageFunc = drawImageFuncs[RANDOM_CLOSEST_COLOR][colorDitherModeId];
        if(!drawImageFunc){
            drawImageFunc = createWebGLDrawImageFunc(gl, fragmentShaderTexts[RANDOM_CLOSEST_COLOR][colorDitherModeId], ['u_random_seed']);
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
    
    function orderedDither(algoKey, gl, texture, imageWidth, imageHeight, colorDitherModeId, colorsArray, colorsArrayLength, bayerTexture, bayerDimensions){
        let drawImageFunc = drawImageFuncs[algoKey][colorDitherModeId];
        if(!drawImageFunc){
            drawImageFunc = createWebGLDrawImageFunc(gl, fragmentShaderTexts[algoKey][colorDitherModeId], ['u_bayer_texture_dimensions', 'u_bayer_texture']);
            drawImageFuncs[algoKey][colorDitherModeId] = drawImageFunc;
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
    
    function createOrderedDitherBase(dimensions, algoKey){
        return (gl, texture, imageWidth, imageHeight, colorDitherModeId, colorsArray, colorsArrayLength)=>{
            let bayerTexture = bayerTextures[dimensions];
            if(!bayerTexture){
                bayerTexture = Bayer.createAndLoadTexture(gl, Bayer.create(dimensions), dimensions);
                bayerTextures[dimensions] = bayerTexture;
            }
            orderedDither(algoKey, gl, texture, imageWidth, imageHeight, colorDitherModeId, colorsArray, colorsArrayLength, bayerTexture, dimensions);
        };
    }
    
    function createOrderedDither(dimensions){
        return createOrderedDitherBase(dimensions, ORDERED_DITHER);
    }
    
    function createHueLightnessOrderedDither(dimensions){
        return createOrderedDitherBase(dimensions, HUE_LIGHTNESS_ORDERED_DITHER);
    }
    
    return {
        closestColor: closestColor,
        randomClosestColor: randomDither,
        createOrderedDither: createOrderedDither,
        createHueLightnessOrderedDither: createHueLightnessOrderedDither,
    };    
})(App.WebGl, App.ColorDitherModes, App.BayerWebgl);