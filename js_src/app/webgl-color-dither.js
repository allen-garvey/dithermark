
App.WebGlColorDither = (function(WebGl, ColorDitherModes, Bayer, Shader){
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
    
    //creates container to lookup something by algorithm and color mode
    function createLookupContainer(){
        //should be length of algorithm keys
        let ret = new Array(10);
        //need to do it like this, otherwise we will be passing a reference to the same object
        //https://stackoverflow.com/questions/35578478/array-prototype-fill-with-object-passes-reference-and-not-new-instance
        return ret.fill().map(()=>{return {};});
    }
    
    
    /*
    * Actual webgl function creation
    */
    function createWebGLDrawImageFunc(gl, fragmentShaderText, customUniformNames){
        customUniformNames = customUniformNames || [];
        customUniformNames = customUniformNames.concat(['u_colors_array', 'u_colors_array_length']);
        
        var drawFunc = WebGl.createDrawImageFunc(gl, Shader.vertexShaderText, fragmentShaderText, customUniformNames);
        
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
    function createFragmentShaderTexts(){
        let shaderText = Shader.shaderText;
        
        //reused webgl fragment shader texts
        let fragmentShaderBaseText = shaderText('webgl-color-dither-base-fshader');
        let aDitherDeclaration = shaderText('webgl-arithmetic-dither-fshader-declaration');
        let aDitherBody = shaderText('webgl-arithmetic-dither-color-body');
        let bitwiseFunctionsText = Shader.generateBitwiseFunctionsText();
        
        function generateFragmentShader(baseText, customDeclarationId, customBodyId){
            return generateFragmentShaderBase(baseText, shaderText(customDeclarationId), shaderText(customBodyId));
        }
        
        function generateFragmentShaderBase(baseText, customDeclaration, customBody){
            return baseText.replace('#{{customDeclaration}}', customDeclaration).replace('#{{customBody}}', customBody);
        }
        
        function generateADitherShader(aDitherReturnValue){
            let declaration = aDitherDeclaration.replace('#{{arithmeticDitherReturn}}', aDitherReturnValue).replace('#{{bitwiseFunctions}}', bitwiseFunctionsText);
            return generateFragmentShaderBase(fragmentShaderBaseText, declaration, aDitherBody);
        }
        
        function shaderTextContainer(baseText){
            let fragmentShaderLightnessFuncText = shaderText('webgl-fragment-shader-lightness-function');
            let fragmentShaderHslFuncsText = shaderText('webgl-hsl-functions');
            
            function fragmentShaderText(shaderBase, distanceFuncId){
                return shaderBase.replace('#{{lightnessFunction}}', fragmentShaderLightnessFuncText).replace('#{{hslFunctions}}', fragmentShaderHslFuncsText).replace('#{{distanceFunction}}', shaderText(distanceFuncId));
            }
            
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
        let orderedDitherSharedBase = generateFragmentShader(fragmentShaderBaseText, 'webgl-ordered-dither-color-declaration-fshader', 'webgl-ordered-dither-color-body-fshader');
        let hueLightnessOrderedDitherSharedBase = generateFragmentShader(fragmentShaderBaseText ,'webgl-hue-lightness-ordered-dither-color-declaration-fshader', 'webgl-hue-lightness-ordered-dither-color-body-fshader');
        let randomDitherShaderBase = generateFragmentShader(fragmentShaderBaseText, 'webgl-random-dither-color-declaration-fshader', 'webgl-random-dither-color-body-fshader');
        
        //map containing program source code
        let fragmentShaderTexts = createLookupContainer();
        fragmentShaderTexts[CLOSEST_COLOR] = shaderTextContainer(closestColorShaderBase);
        fragmentShaderTexts[RANDOM_CLOSEST_COLOR] = shaderTextContainer(randomDitherShaderBase);
        fragmentShaderTexts[ORDERED_DITHER] = shaderTextContainer(orderedDitherSharedBase);
        fragmentShaderTexts[HUE_LIGHTNESS_ORDERED_DITHER] = shaderTextContainer(hueLightnessOrderedDitherSharedBase);
        fragmentShaderTexts[ADITHER_ADD1] = shaderTextContainer(generateADitherShader(Shader.aDitherAdd1Return));
        fragmentShaderTexts[ADITHER_ADD2] = shaderTextContainer(generateADitherShader(Shader.aDitherAdd2Return));
        fragmentShaderTexts[ADITHER_ADD3] = shaderTextContainer(generateADitherShader(Shader.aDitherAdd3Return));
        fragmentShaderTexts[ADITHER_XOR1] = shaderTextContainer(generateADitherShader(Shader.aDitherXor1Return));
        fragmentShaderTexts[ADITHER_XOR2] = shaderTextContainer(generateADitherShader(Shader.aDitherXor2Return));
        fragmentShaderTexts[ADITHER_XOR3] = shaderTextContainer(generateADitherShader(Shader.aDitherXor3Return));
        
        return fragmentShaderTexts;
    }
    
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
            gl.uniform2f(customUniformLocations['u_random_seed'], Math.random(), Math.random());
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

    function createClusterOrderedDitherBase(dimensions, algoKey, textureKeyPrefix, clusterFunc){
        let bayerKey = `${textureKeyPrefix}_${dimensions}`;
        return (gl, texture, imageWidth, imageHeight, colorDitherModeId, colorsArray, colorsArrayLength)=>{
            let bayerTexture = bayerTextures[bayerKey];
            if(!bayerTexture){
                bayerTexture = Bayer.createAndLoadTexture(gl, Bayer[clusterFunc](dimensions), dimensions);
                bayerTextures[bayerKey] = bayerTexture;
            }
            orderedDither(algoKey, gl, texture, imageWidth, imageHeight, colorDitherModeId, colorsArray, colorsArrayLength, bayerTexture, dimensions);
        };
    }
    
    function createClusterOrderedDither(dimensions){
        return createClusterOrderedDitherBase(dimensions, ORDERED_DITHER, 'cluster', 'createCluster');
    }

    function createDotClusterOrderedDither(dimensions){
        return createClusterOrderedDitherBase(dimensions, ORDERED_DITHER, 'dot-cluster', 'createDotCluster');
    }
    
    function createHueLightnessOrderedDither(dimensions){
        return createOrderedDitherBase(dimensions, HUE_LIGHTNESS_ORDERED_DITHER);
    }
    
    function createArithmeticDither(key){
        return (gl, texture, imageWidth, imageHeight, colorDitherModeId, colorsArray, colorsArrayLength)=>{
            let drawImageFunc = drawImageFuncs[key][colorDitherModeId];
            if(!drawImageFunc){
                drawImageFunc = createWebGLDrawImageFunc(gl, fragmentShaderTexts[key][colorDitherModeId], ['u_image_width', 'u_image_height']);
                drawImageFuncs[key][colorDitherModeId] = drawImageFunc;
            }
            // Tell WebGL how to convert from clip space to pixels
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            drawImageFunc(gl, texture, imageWidth, imageHeight, colorsArray, colorsArrayLength, (gl, customUniformLocations)=>{
                gl.uniform1f(customUniformLocations['u_image_width'], imageWidth);
                gl.uniform1f(customUniformLocations['u_image_height'], imageHeight);
            });
        };
    }
    
    return {
        closestColor: closestColor,
        randomClosestColor: randomDither,
        createOrderedDither: createOrderedDither,
        createClusterOrderedDither: createClusterOrderedDither,
        createDotClusterOrderedDither: createDotClusterOrderedDither,
        createHueLightnessOrderedDither: createHueLightnessOrderedDither,
        aDitherAdd1: createArithmeticDither(ADITHER_ADD1),
        aDitherAdd2: createArithmeticDither(ADITHER_ADD2),
        aDitherAdd3: createArithmeticDither(ADITHER_ADD3),
        aDitherXor1: createArithmeticDither(ADITHER_XOR1),
        aDitherXor2: createArithmeticDither(ADITHER_XOR2),
        aDitherXor3: createArithmeticDither(ADITHER_XOR3),
    };    
})(App.WebGl, App.ColorDitherModes, App.BayerWebgl, App.WebGlShader);