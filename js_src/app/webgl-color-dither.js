
App.WebGlColorDither = (function(WebGl, ColorDitherModes, BayerWebgl, Shader, Bayer, Util, ArrayUtil, DitherUtil){
    const CLOSEST_COLOR = 0;
    const RANDOM_CLOSEST_COLOR = 1;
    const ORDERED_DITHER = 2;
    const ORDERED_DITHER_RANDOM = 3;
    const HUE_LIGHTNESS_ORDERED_DITHER = 4;
    const HUE_LIGHTNESS_RANDOM_ORDERED_DITHER = 5;
    const ADITHER_ADD1 = 6;
    const ADITHER_ADD2 = 7;
    const ADITHER_ADD3 = 8;
    const ADITHER_XOR1 = 9;
    const ADITHER_XOR2 = 10;
    const ADITHER_XOR3 = 11;
    const YLILUOMA2 = 12;
    //should be length of algorithm keys above
    const numAlgoKeys = 13;
    
    //creates container to lookup something by algorithm and color mode
    function createLookupContainer(){
        return ArrayUtil.create(numAlgoKeys, ()=>{return {};});
    }
    
    
    /*
    * Actual webgl function creation
    */
    function createWebGLDrawImageFunc(gl, fragmentShaderText, customUniformNames=[]){
        customUniformNames = customUniformNames.concat(['u_colors_array', 'u_colors_array_length', 'u_dither_r_coefficient']);
        const drawFunc = WebGl.createDrawImageFunc(gl, Shader.vertexShaderText, fragmentShaderText, customUniformNames);
        
        return function(gl, tex, texWidth, texHeight, colorsArray, colorsArrayLength, setCustomUniformsFunc){
            drawFunc(gl, tex, texWidth, texHeight, (gl, customUniformLocations)=>{
                gl.uniform1i(customUniformLocations['u_colors_array_length'], colorsArrayLength);
                gl.uniform3fv(customUniformLocations['u_colors_array'], colorsArray);
                gl.uniform1f(customUniformLocations['u_dither_r_coefficient'], DitherUtil.ditherRCoefficient(colorsArrayLength, true));
                
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
        const shaderText = Shader.shaderText;
        
        //reused webgl fragment shader texts
        const fragmentShaderBaseText = shaderText('webgl-color-dither-base-fshader').replace('#{{transparencyCheck}}', Shader.shaderText('webgl-transparency-check-fshader'));
        const yliluoma2FragmentShaderBase = shaderText('webgl-yliluoma2-color-fshader').replace('#{{transparencyCheck}}', Shader.shaderText('webgl-transparency-check-fshader'));
        const aDitherDeclaration = shaderText('webgl-arithmetic-dither-fshader-declaration');
        const aDitherBody = shaderText('webgl-arithmetic-dither-color-body');
        const bitwiseFunctionsText = Shader.generateBitwiseFunctionsText();
        const fragmentShaderLightnessFuncText = shaderText('webgl-fragment-shader-lightness-function');
        const fragmentShaderHslFuncsText = shaderText('webgl-hsl-functions');
        
        function generateFragmentShader(customDeclaration, customBody, optionalPostscript=''){
            return fragmentShaderBaseText.replace('#{{customDeclaration}}', customDeclaration).replace('#{{customBody}}', customBody).replace('#{{optionalPostscript}}', optionalPostscript);
        }
        
        function generateADitherShader(aDitherReturnValue){
            const declaration = aDitherDeclaration.replace('#{{arithmeticDitherReturn}}', aDitherReturnValue).replace('#{{bitwiseFunctions}}', bitwiseFunctionsText);
            return generateFragmentShader(declaration, aDitherBody);
        }
        
        function shaderTextContainer(baseText){
            function fragmentShaderText(shaderBase, distanceFuncId){
                return shaderBase.replace('#{{lightnessFunction}}', fragmentShaderLightnessFuncText).replace('#{{hslFunctions}}', fragmentShaderHslFuncsText).replace('#{{distanceFunction}}', shaderText(distanceFuncId));
            }
            
            let modeDistances = [
                {key: 'RGB', distanceFunc: 'webgl-rgb-distance'},
                {key: 'LUMA', distanceFunc: 'webgl-luma-distance'},
                {key: 'HUE_LIGHTNESS', distanceFunc: 'webgl-hue-lightness-distance'},
                {key: 'HSL_WEIGHTED', distanceFunc: 'webgl-hue-saturation-lightness-distance'},
                {key: 'LIGHTNESS', distanceFunc: 'webgl-lightness-distance'},
                {key: 'HUE', distanceFunc: 'webgl-hue-distance'},
            ];
            
            let ret = {};
            
            modeDistances.forEach((item)=>{
                ret[ColorDitherModes.get(item.key).id] = fragmentShaderText(baseText, item.distanceFunc);
            });
            
            return ret; 
        }
        
        //shader declarations and bodies
        const orderedDitherDeclarationText = shaderText('webgl-ordered-dither-color-declaration-fshader');
        const orderedDitherBodyText = shaderText('webgl-ordered-dither-color-body-fshader');
        const orderedDitherVanillaBodyText = orderedDitherBodyText.replace('#{{bayerValueAdjustment}}', '');
        const orderedDitherRandomBodyText = orderedDitherBodyText.replace('#{{bayerValueAdjustment}}', shaderText('webgl-random-ordered-dither-adjustment-fshader'));
        const randomDitherDeclarationText = shaderText('webgl-random-dither-declaration-fshader');
        const randomDitherBodyText = shaderText('webgl-random-dither-color-body-fshader');
        const hueLightnessPostscriptText = shaderText('webgl-hue-lightness-ordered-dither-color-postscript-fshader');
        const hueLightnessDeclarationText = orderedDitherDeclarationText + shaderText('webgl-hue-lightness-ordered-dither-color-declaration-fshader');
        //shader source code
        const closestColorShaderBase = generateFragmentShader('', '');
        const orderedDitherBase = generateFragmentShader(orderedDitherDeclarationText, orderedDitherVanillaBodyText);
        const orderedDitherRandomBase = generateFragmentShader(orderedDitherDeclarationText + randomDitherDeclarationText, orderedDitherRandomBodyText);
        const hueLightnessOrderedDitherBase = generateFragmentShader(hueLightnessDeclarationText, orderedDitherVanillaBodyText, hueLightnessPostscriptText);
        const hueLightnessRandomOrderedDitherBase = generateFragmentShader(hueLightnessDeclarationText + randomDitherDeclarationText, orderedDitherRandomBodyText, hueLightnessPostscriptText);
        const randomDitherShaderBase = generateFragmentShader(randomDitherDeclarationText, randomDitherBodyText);
        
        //map containing program source code
        const fragmentShaderTexts = createLookupContainer();
        fragmentShaderTexts[CLOSEST_COLOR] = shaderTextContainer(closestColorShaderBase);
        fragmentShaderTexts[RANDOM_CLOSEST_COLOR] = shaderTextContainer(randomDitherShaderBase);
        fragmentShaderTexts[ORDERED_DITHER] = shaderTextContainer(orderedDitherBase);
        fragmentShaderTexts[ORDERED_DITHER_RANDOM] = shaderTextContainer(orderedDitherRandomBase);
        fragmentShaderTexts[HUE_LIGHTNESS_ORDERED_DITHER] = shaderTextContainer(hueLightnessOrderedDitherBase);
        fragmentShaderTexts[HUE_LIGHTNESS_RANDOM_ORDERED_DITHER] = shaderTextContainer(hueLightnessRandomOrderedDitherBase);
        fragmentShaderTexts[ADITHER_ADD1] = shaderTextContainer(generateADitherShader(Shader.aDitherAdd1Return));
        fragmentShaderTexts[ADITHER_ADD2] = shaderTextContainer(generateADitherShader(Shader.aDitherAdd2Return));
        fragmentShaderTexts[ADITHER_ADD3] = shaderTextContainer(generateADitherShader(Shader.aDitherAdd3Return));
        fragmentShaderTexts[ADITHER_XOR1] = shaderTextContainer(generateADitherShader(Shader.aDitherXor1Return));
        fragmentShaderTexts[ADITHER_XOR2] = shaderTextContainer(generateADitherShader(Shader.aDitherXor2Return));
        fragmentShaderTexts[ADITHER_XOR3] = shaderTextContainer(generateADitherShader(Shader.aDitherXor3Return));
        fragmentShaderTexts[YLILUOMA2] = shaderTextContainer(yliluoma2FragmentShaderBase);
        
        return fragmentShaderTexts;
    }
    
    //map containing fragment shader source code
    const fragmentShaderTexts = createFragmentShaderTexts();
    
    //draw image compiled functions
    const drawImageFuncs = createLookupContainer();
    
    //saved bayer textures
    const bayerTextures = {};
    
    
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
            gl.uniform2f(customUniformLocations['u_random_seed'], Util.generateRandomSeed(), Util.generateRandomSeed());
        });
    }
    
    function orderedDither(algoKey, gl, texture, imageWidth, imageHeight, colorDitherModeId, colorsArray, colorsArrayLength, bayerTexture, bayerDimensions, isRandom){
        let drawImageFunc = drawImageFuncs[algoKey][colorDitherModeId];
        if(!drawImageFunc){
            let customUniforms = ['u_bayer_texture_dimensions', 'u_bayer_texture'];
            if(isRandom){
                customUniforms = customUniforms.concat(['u_random_seed']);
            }
            drawImageFunc = createWebGLDrawImageFunc(gl, fragmentShaderTexts[algoKey][colorDitherModeId], customUniforms);
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

            if(isRandom){
                gl.uniform2f(customUniformLocations['u_random_seed'], Util.generateRandomSeed(), Util.generateRandomSeed());
            }
        });
    }

    function createOrderedDitherBase(dimensions, algoKey, textureKeyPrefix, bayerFuncName, isRandom){
        let bayerKey = `${textureKeyPrefix}-${dimensions}`;
        return (gl, texture, imageWidth, imageHeight, colorDitherModeId, colorsArray, colorsArrayLength)=>{
            let bayerTexture = bayerTextures[bayerKey];
            if(!bayerTexture){
                bayerTexture = BayerWebgl.createAndLoadTexture(gl, Bayer[bayerFuncName](dimensions), dimensions);
                bayerTextures[bayerKey] = bayerTexture;
            }
            orderedDither(algoKey, gl, texture, imageWidth, imageHeight, colorDitherModeId, colorsArray, colorsArrayLength, bayerTexture, dimensions, isRandom);
        };
    }

    function orderedDitherBuilder(textureKeyPrefix, bayerFuncName, algoKey=ORDERED_DITHER){
        return function(dimensions, isRandom=false){
            let adjustedAlgoKey = algoKey;
            if(isRandom){
                adjustedAlgoKey = algoKey === ORDERED_DITHER ? ORDERED_DITHER_RANDOM : HUE_LIGHTNESS_RANDOM_ORDERED_DITHER; 
            }
            return createOrderedDitherBase(dimensions, adjustedAlgoKey, textureKeyPrefix, bayerFuncName, isRandom);
        };
    }

    function orderedDitherBuilder2(algoKey=ORDERED_DITHER){
        return function(dimensions, bayerFuncName, isRandom=false){
            let adjustedAlgoKey = algoKey;
            if(isRandom){
                adjustedAlgoKey = algoKey === ORDERED_DITHER ? ORDERED_DITHER_RANDOM : HUE_LIGHTNESS_RANDOM_ORDERED_DITHER; 
            }
            return createOrderedDitherBase(dimensions, adjustedAlgoKey, bayerFuncName, bayerFuncName, isRandom);
        };
    }
    
    function createArithmeticDither(key){
        return (gl, texture, imageWidth, imageHeight, colorDitherModeId, colorsArray, colorsArrayLength)=>{
            let drawImageFunc = drawImageFuncs[key][colorDitherModeId];
            if(!drawImageFunc){
                drawImageFunc = createWebGLDrawImageFunc(gl, fragmentShaderTexts[key][colorDitherModeId]);
                drawImageFuncs[key][colorDitherModeId] = drawImageFunc;
            }
            // Tell WebGL how to convert from clip space to pixels
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            drawImageFunc(gl, texture, imageWidth, imageHeight, colorsArray, colorsArrayLength);
        };
    }

    const exports = {
        closestColor: closestColor,
        randomClosestColor: randomDither,
        aDitherAdd1: createArithmeticDither(ADITHER_ADD1),
        aDitherAdd2: createArithmeticDither(ADITHER_ADD2),
        aDitherAdd3: createArithmeticDither(ADITHER_ADD3),
        aDitherXor1: createArithmeticDither(ADITHER_XOR1),
        aDitherXor2: createArithmeticDither(ADITHER_XOR2),
        aDitherXor3: createArithmeticDither(ADITHER_XOR3),
        createHueLightnessOrderedDither: orderedDitherBuilder('bayer', 'bayer', HUE_LIGHTNESS_ORDERED_DITHER),
        createYliluoma2OrderedDither: orderedDitherBuilder2(YLILUOMA2),
    };

    DitherUtil.generateBayerKeys((orderedDitherKey, bwDitherKey, colorDitherKey)=>{
        exports[colorDitherKey] = orderedDitherBuilder(orderedDitherKey, orderedDitherKey);
    });


    return exports;
        
})(App.WebGl, App.ColorDitherModes, App.WebglBayer, App.WebGlShader, App.BayerMatrix, App.WebGlUtil, App.ArrayUtil, App.DitherUtil);