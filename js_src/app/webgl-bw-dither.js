
App.WebGlBwDither = (function(BayerWebgl, WebGl, Shader, Bayer, Util, DitherUtil){
    const THRESHOLD = 1;
    const RANDOM_THRESHOLD = 2;
    const ORDERED_DITHER = 3;
    const COLOR_REPLACE = 4;
    const TEXTURE_COMBINE = 5;
    const ADITHER_ADD1 = 6;
    const ADITHER_ADD2 = 7;
    const ADITHER_ADD3 = 8;
    const ADITHER_XOR1 = 9;
    const ADITHER_XOR2 = 10;
    const ADITHER_XOR3 = 11;
    
    
    /*
    * Actual webgl function creation
    */
    function createWebGLDrawImageFunc(gl, fragmentShaderText, customUniformNames = []){
        customUniformNames = customUniformNames.concat(['u_threshold', 'u_black_pixel', 'u_white_pixel', 'u_dither_r_coefficient']);
        
        var drawFunc = WebGl.createDrawImageFunc(gl, Shader.vertexShaderText, fragmentShaderText, customUniformNames);
        
        return function(gl, tex, texWidth, texHeight, threshold, blackPixel, whitePixel, setCustomUniformsFunc){
            drawFunc(gl, tex, texWidth, texHeight, (gl, customUniformLocations)=>{
                //initialize uniforms
                gl.uniform1f(customUniformLocations['u_threshold'], threshold / 255);
                gl.uniform3fv(customUniformLocations['u_black_pixel'], pixelToVec(blackPixel));
                gl.uniform3fv(customUniformLocations['u_white_pixel'], pixelToVec(whitePixel));
                gl.uniform1f(customUniformLocations['u_dither_r_coefficient'], DitherUtil.ditherRCoefficient(2, true));
                
                //set custom uniform values
                if(setCustomUniformsFunc){
                    setCustomUniformsFunc(gl, customUniformLocations);
                }
            });
        };
    }
    
    function getDrawFunc(typeEnum, gl, fragmentShaderArgs, customUniformNames = []){
        let drawFunc = drawImageFuncs[typeEnum];
        if(!drawFunc){
            fragmentShaderArgs.unshift(fragmentShaderTemplate);
            let fragmentShaderText = generateFragmentShader(...fragmentShaderArgs);
            drawFunc = createWebGLDrawImageFunc(gl, fragmentShaderText, customUniformNames);
            drawImageFuncs[typeEnum] = drawFunc;
        }
        return drawFunc;
    }

    /*
    * Pixel utility stuff
    */
    function pixelToVec(pixel, rgbOnly=true){
        let length = rgbOnly ? 3 : pixel.length;
        let vec = new Float32Array(length);
        
        for(let i=0;i<length;i++){
            vec[i] = pixel[i] / 255.0;
        }
        return vec;
    }


    /*
    * Shader caching
    */
    
    function generateFragmentShader(fragmentShaderTemplate, customDeclarationId, customBodyId, customDeclarationReplacements = []){
        let customDeclaration = customDeclarationId ? Shader.shaderText(customDeclarationId) : '';
        let customBody = customBodyId ? Shader.shaderText(customBodyId) : '';
        
        customDeclarationReplacements.forEach((replacement)=>{
            customDeclaration = customDeclaration.replace(replacement.find, replacement.replace);
        });
        
        return fragmentShaderTemplate.replace('#{{customDeclaration}}', customDeclaration).replace('#{{customBody}}', customBody);
    }
    
    //fragment shaders
    var fragmentLightnessFunctionText = Shader.shaderText('webgl-fragment-shader-lightness-function');
    var fragmentShaderTemplate = Shader.shaderText('webgl-fragment-shader-template').replace('#{{lightnessFunction}}', fragmentLightnessFunctionText);
    var bitwiseFunctionsText = Shader.generateBitwiseFunctionsText(); 
    
    //draw image created functions
    var drawImageFuncs = {};
    
    //saved bayer textures
    var bayerTextures = {};
    
    function webGLThreshold(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel){
        let drawFunc = getDrawFunc(THRESHOLD, gl, [null, 'webgl-threshold-fshader-body']);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawFunc(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel);
    }
    
    function webGLRandomThreshold(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel){
        let drawFunc = getDrawFunc(RANDOM_THRESHOLD, gl, ['webgl-random-threshold-fshader-declaration', 'webgl-random-threshold-fshader-body'], ['u_random_seed']);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawFunc(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel, (gl, customUniformLocations)=>{
            gl.uniform2f(customUniformLocations['u_random_seed'], Util.generateRandomSeed(), Util.generateRandomSeed());
        });
    }
    
    function createArithmeticDither(ditherKey, customDeclarationReplace){
        let customDeclarationReplacements = [{find: '#{{arithmeticDitherReturn}}', replace: customDeclarationReplace}, {find: '#{{bitwiseFunctions}}', replace: bitwiseFunctionsText}];
        
        return (gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel)=>{
            let drawFunc = getDrawFunc(ditherKey, gl, ['webgl-arithmetic-dither-fshader-declaration', 'webgl-arithmetic-dither-fshader-body', customDeclarationReplacements]);
            // Tell WebGL how to convert from clip space to pixels
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            drawFunc(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel);
        };   
    }
    
    function webGLOrderedDither(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel, bayerTexture, bayerArrayDimensions){
        let drawFunc = getDrawFunc(ORDERED_DITHER, gl, ['webgl-ordered-dither-fshader-declaration', 'webgl-ordered-dither-fshader-body'], ['u_bayer_texture_dimensions', 'u_bayer_texture']);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawFunc(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel, (gl, customUniformLocations)=>{
            //bind bayer texture to second texture unit
            gl.uniform1i(customUniformLocations['u_bayer_texture'], 1);
          
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, bayerTexture);
            
            //set bayer texture dimensions
            gl.uniform1f(customUniformLocations['u_bayer_texture_dimensions'], bayerArrayDimensions);
        });
    }

    function createOrderedDitherBase(keyPrefix, bayerFuncName){
        return function(dimensions){
            return function(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel){
                const key = `${keyPrefix}-${dimensions}`;
                let bayerTexture = bayerTextures[key];
                if(!bayerTexture){
                    bayerTexture = BayerWebgl.createAndLoadTexture(gl, Bayer[bayerFuncName](dimensions), dimensions);
                    bayerTextures[key] = bayerTexture;
                }
                webGLOrderedDither(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel, bayerTexture, dimensions);
            };
        };
    };

    function webGLColorReplace(gl, texture, imageWidth, imageHeight, blackPixel, whitePixel){
        let drawFunc = getDrawFunc(COLOR_REPLACE, gl, [null, 'webgl-color-replace-fshader-body']);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawFunc(gl, texture, imageWidth, imageHeight, 0, blackPixel, whitePixel);
    }
    
    function webGL3TextureCombine(gl, imageWidth, imageHeight, blackPixel, whitePixel, textures){
        let drawFunc = getDrawFunc(TEXTURE_COMBINE, gl, ['webgl-combine-dither-fshader-declaration', 'webgl-combine-dither-fshader-body'], ['u_texture_2', 'u_texture_3']);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        
        let threshold = 0.0;
        drawFunc(gl, textures[0], imageWidth, imageHeight, threshold, blackPixel, whitePixel, (gl, customUniformLocations)=>{
            //bind textures
            gl.activeTexture(gl.TEXTURE1);
            gl.uniform1i(customUniformLocations['u_texture_2'], 1);
            gl.bindTexture(gl.TEXTURE_2D, textures[1]);
            
            gl.activeTexture(gl.TEXTURE2);
            gl.uniform1i(customUniformLocations['u_texture_3'], 2);
            gl.bindTexture(gl.TEXTURE_2D, textures[2]);
        });
    }

    const exports = {
        threshold: webGLThreshold,
        randomThreshold: webGLRandomThreshold,
        aDitherAdd1: createArithmeticDither(ADITHER_ADD1, Shader.aDitherAdd1Return),
        aDitherAdd2: createArithmeticDither(ADITHER_ADD2, Shader.aDitherAdd2Return),
        aDitherAdd3: createArithmeticDither(ADITHER_ADD3, Shader.aDitherAdd3Return),
        aDitherXor1: createArithmeticDither(ADITHER_XOR1, Shader.aDitherXor1Return),
        aDitherXor2: createArithmeticDither(ADITHER_XOR2, Shader.aDitherXor2Return),
        aDitherXor3: createArithmeticDither(ADITHER_XOR3, Shader.aDitherXor3Return),
        colorReplace: webGLColorReplace,
        textureCombine: webGL3TextureCombine,
    };

    DitherUtil.generateBayerKeys((orderedDitherKey, bwDitherKey)=>{
        exports[bwDitherKey] = createOrderedDitherBase(orderedDitherKey, orderedDitherKey);
    });

    return exports;
    
})(App.BayerWebgl, App.WebGl, App.WebGlShader, App.BayerMatrix, App.WebGlUtil, App.DitherUtil);