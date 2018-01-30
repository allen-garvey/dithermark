
App.WebGlBwDither = (function(m4, Bayer, WebGl){
    
    /*
    * Ordered dither stuff
    */
    //bayer array should be Uint8Array
    //based on: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
    function createAndLoadBayerTexture(gl, bayerArray, bayerArrayDimensions){
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = bayerArrayDimensions;
        const height = bayerArrayDimensions;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, bayerArray);
        // gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        
        return texture;
    }
    
    /*
    * Actual webgl function creation
    */
    function createWebGLDrawImageFunc(gl, fragmentShaderText, customUniformNames){
        customUniformNames = customUniformNames || [];
        customUniformNames = customUniformNames.concat(['u_threshold', 'u_black_pixel', 'u_white_pixel']);
        
        var drawFunc = WebGl.createDrawImageFunc(gl, thresholdVertexShaderText, fragmentShaderText, customUniformNames);
        
        return function(gl, tex, texWidth, texHeight, threshold, blackPixel, whitePixel, setCustomUniformsFunc){
            drawFunc(gl, tex, texWidth, texHeight, (gl, customUniformLocations)=>{
                //set threshold
                gl.uniform1f(customUniformLocations['u_threshold'], threshold);
            
                //set pixels
                gl.uniform3fv(customUniformLocations['u_black_pixel'], WebGl.pixelToVec(blackPixel));
                gl.uniform3fv(customUniformLocations['u_white_pixel'], WebGl.pixelToVec(whitePixel));
                
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
    
    function getShaderScriptText(id){
        return document.getElementById(id).textContent;
    }
    
    function generateFragmentShader(fragmentShaderTemplate, customDeclarationId, customBodyId){
        var customDeclaration = '';
        if(customDeclarationId){
            customDeclaration = getShaderScriptText(customDeclarationId);
        }
        var customBody = '';
        if(customBodyId){
            customBody = getShaderScriptText(customBodyId);
        }
        return fragmentShaderTemplate.replace('#{{customDeclaration}}', customDeclaration).replace('#{{customBody}}', customBody);
    }
    
    //vertex shader
    var thresholdVertexShaderText = getShaderScriptText('webgl-threshold-vertex-shader');
    //fragment shaders
    var fragmentLightnessFunctionText = getShaderScriptText('webgl-fragment-shader-lightness-function');
    var fragmentShaderTemplate = getShaderScriptText('webgl-fragment-shader-template').replace('#{{lightnessFunction}}', fragmentLightnessFunctionText);
    
    var thresholdFragmentShaderText = generateFragmentShader(fragmentShaderTemplate, null, 'webgl-threshold-fshader-body');
    var randomThresholdFragmentShaderText = generateFragmentShader(fragmentShaderTemplate, 'webgl-random-threshold-fshader-declaration', 'webgl-random-threshold-fshader-body');
    var orderedDitherFragmentShaderText = generateFragmentShader(fragmentShaderTemplate, 'webgl-ordered-dither-fshader-declaration', 'webgl-ordered-dither-fshader-body');
    var colorReplaceFragmentShaderText = generateFragmentShader(fragmentShaderTemplate, null, 'webgl-color-replace-fshader-body');
    var textureCombineFragmentShaderText = generateFragmentShader(fragmentShaderTemplate, 'webgl-combine-dither-fshader-declaration', 'webgl-combine-dither-fshader-body');
    
    //draw image created functions
    var drawImageThreshold;
    var drawImageRandomThreshold;
    var drawImageOrderedDither;
    var drawImageColorReplace;
    var drawImage3TextureCombine;
    
    //saved bayer textures
    var bayerTextures = {};
    
    function webGLThreshold(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel){
        //convert threshold to float
        threshold = threshold / 255.0;
        
        drawImageThreshold = drawImageThreshold || createWebGLDrawImageFunc(gl, thresholdFragmentShaderText);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawImageThreshold(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel);
    }
    
    function webGLRandomThreshold(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel){
        //convert threshold to float
        threshold = threshold / 255.0;
        
        drawImageRandomThreshold = drawImageRandomThreshold || createWebGLDrawImageFunc(gl, randomThresholdFragmentShaderText, ['u_random_seed']);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawImageRandomThreshold(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel, (gl, customUniformLocations)=>{
            //set random seed
            var randomSeed = new Float32Array(2);
            randomSeed[0] = Math.random();
            randomSeed[1] = Math.random();
            gl.uniform2fv(customUniformLocations['u_random_seed'], randomSeed);
        });
    }
    
    function webGLOrderedDither(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel, bayerTexture, bayerArrayDimensions){
        //convert threshold to float
        threshold = threshold / 255.0;
        //4 UInts per pixel * 2 dimensions = 8
        
        drawImageOrderedDither = drawImageOrderedDither || createWebGLDrawImageFunc(gl, orderedDitherFragmentShaderText, ['u_bayer_texture_dimensions', 'u_bayer_texture']);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawImageOrderedDither(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel, (gl, customUniformLocations)=>{
            //bind bayer texture to second texture unit
            gl.uniform1i(customUniformLocations['u_bayer_texture'], 1);
          
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, bayerTexture);
            
            //set bayer texture dimensions
            gl.uniform1f(customUniformLocations['u_bayer_texture_dimensions'], bayerArrayDimensions);
        });
    }
    
    function createWebGLOrderedDither(dimensions){
        return (gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel)=>{
            let bayerTexture = bayerTextures[dimensions];
            if(!bayerTexture){
                bayerTexture = createAndLoadBayerTexture(gl, Bayer.create(dimensions), dimensions);
                bayerTextures[dimensions] = bayerTexture;
            }
            webGLOrderedDither(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel, bayerTexture, dimensions);
        };
    }
    
    function webGLColorReplace(gl, texture, imageWidth, imageHeight, blackPixel, whitePixel){
        
        drawImageColorReplace = drawImageColorReplace || createWebGLDrawImageFunc(gl, colorReplaceFragmentShaderText);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawImageColorReplace(gl, texture, imageWidth, imageHeight, 0, blackPixel, whitePixel);
    }
    
    function webGL3TextureCombine(gl, imageWidth, imageHeight, blackPixel, whitePixel, textures){
        let threshold = 0.0;
        drawImage3TextureCombine = drawImage3TextureCombine || createWebGLDrawImageFunc(gl, textureCombineFragmentShaderText, ['u_texture_2', 'u_texture_3']);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawImage3TextureCombine(gl, textures[0], imageWidth, imageHeight, threshold, blackPixel, whitePixel, (gl, customUniformLocations)=>{
            //bind textures
            gl.activeTexture(gl.TEXTURE1);
            gl.uniform1i(customUniformLocations['u_texture_2'], 1);
            gl.bindTexture(gl.TEXTURE_2D, textures[1]);
            
            gl.activeTexture(gl.TEXTURE2);
            gl.uniform1i(customUniformLocations['u_texture_3'], 2);
            gl.bindTexture(gl.TEXTURE_2D, textures[2]);
        });
    }
    
    
    // console.log(Bayer.create2(16));
    
    return {
        threshold: webGLThreshold,
        randomThreshold: webGLRandomThreshold,
        creatOrderedDither: createWebGLOrderedDither,
        colorReplace: webGLColorReplace,
        textureCombine: webGL3TextureCombine,
    };    
})(App.M4, App.BayerWebgl, App.WebGl);