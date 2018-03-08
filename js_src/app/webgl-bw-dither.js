
App.WebGlBwDither = (function(Bayer, WebGl){
    const THRESHOLD = 1;
    const RANDOM_THRESHOLD = 2;
    const ORDERED_DITHER = 3;
    const COLOR_REPLACE = 4;
    const TEXTURE_COMBINE = 5;
    
    
    /*
    * Actual webgl function creation
    */
    function createWebGLDrawImageFunc(gl, fragmentShaderText, customUniformNames = []){
        customUniformNames = customUniformNames.concat(['u_threshold', 'u_black_pixel', 'u_white_pixel']);
        
        var drawFunc = WebGl.createDrawImageFunc(gl, thresholdVertexShaderText, fragmentShaderText, customUniformNames);
        
        return function(gl, tex, texWidth, texHeight, threshold, blackPixel, whitePixel, setCustomUniformsFunc){
            drawFunc(gl, tex, texWidth, texHeight, (gl, customUniformLocations)=>{
                //set threshold after converting to float
                gl.uniform1f(customUniformLocations['u_threshold'], threshold / 255);
            
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
    
    //draw image created functions
    var drawImageFuncs = {};
    
    //saved bayer textures
    var bayerTextures = {};
    
    function webGLThreshold(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel){
        let drawFunc = drawImageFuncs[THRESHOLD];
        if(!drawFunc){
            let fragmentShaderText = generateFragmentShader(fragmentShaderTemplate, null, 'webgl-threshold-fshader-body');
            drawFunc = createWebGLDrawImageFunc(gl, fragmentShaderText);
            drawImageFuncs[THRESHOLD] = drawFunc;
        }
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawFunc(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel);
    }
    
    function webGLRandomThreshold(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel){
        let drawFunc = drawImageFuncs[RANDOM_THRESHOLD];
        if(!drawFunc){
            let fragmentShaderText = generateFragmentShader(fragmentShaderTemplate, 'webgl-random-threshold-fshader-declaration', 'webgl-random-threshold-fshader-body');
            drawFunc = createWebGLDrawImageFunc(gl, fragmentShaderText, ['u_random_seed']);
            drawImageFuncs[RANDOM_THRESHOLD] = drawFunc;
        }
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawFunc(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel, (gl, customUniformLocations)=>{
            gl.uniform2f(customUniformLocations['u_random_seed'], Math.random(), Math.random());
        });
    }
    
    function webGLOrderedDither(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel, bayerTexture, bayerArrayDimensions){
        let drawFunc = drawImageFuncs[ORDERED_DITHER];
        if(!drawFunc){
            let fragmentShaderText = generateFragmentShader(fragmentShaderTemplate, 'webgl-ordered-dither-fshader-declaration', 'webgl-ordered-dither-fshader-body');
            drawFunc = createWebGLDrawImageFunc(gl, fragmentShaderText, ['u_bayer_texture_dimensions', 'u_bayer_texture']);
            drawImageFuncs[ORDERED_DITHER] = drawFunc;
        }
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
    
    function createWebGLOrderedDither(dimensions){
        return (gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel)=>{
            let bayerTexture = bayerTextures[dimensions];
            if(!bayerTexture){
                bayerTexture = Bayer.createAndLoadTexture(gl, Bayer.create(dimensions), dimensions);
                bayerTextures[dimensions] = bayerTexture;
            }
            webGLOrderedDither(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel, bayerTexture, dimensions);
        };
    }
    
    function webGLColorReplace(gl, texture, imageWidth, imageHeight, blackPixel, whitePixel){
        let drawFunc = drawImageFuncs[COLOR_REPLACE];
        if(!drawFunc){
            let fragmentShaderText = generateFragmentShader(fragmentShaderTemplate, null, 'webgl-color-replace-fshader-body');
            drawFunc = createWebGLDrawImageFunc(gl, fragmentShaderText);
            drawImageFuncs[COLOR_REPLACE] = drawFunc;
        }
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawFunc(gl, texture, imageWidth, imageHeight, 0, blackPixel, whitePixel);
    }
    
    function webGL3TextureCombine(gl, imageWidth, imageHeight, blackPixel, whitePixel, textures){
        let drawFunc = drawImageFuncs[TEXTURE_COMBINE];
        if(!drawFunc){
            let fragmentShaderText = generateFragmentShader(fragmentShaderTemplate, 'webgl-combine-dither-fshader-declaration', 'webgl-combine-dither-fshader-body');
            drawFunc = createWebGLDrawImageFunc(gl, fragmentShaderText, ['u_texture_2', 'u_texture_3']);
            drawImageFuncs[TEXTURE_COMBINE] = drawFunc;
        }
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
    
    return {
        threshold: webGLThreshold,
        randomThreshold: webGLRandomThreshold,
        createOrderedDither: createWebGLOrderedDither,
        colorReplace: webGLColorReplace,
        textureCombine: webGL3TextureCombine,
    };    
})(App.BayerWebgl, App.WebGl);