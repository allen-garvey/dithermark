
App.WebGlBwDither = (function(Bayer, WebGl){
    
    /*
    * Actual webgl function creation
    */
    function createWebGLDrawImageFunc(gl, fragmentShaderText, customUniformNames){
        customUniformNames = customUniformNames || [];
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
        
        drawImageThreshold = drawImageThreshold || createWebGLDrawImageFunc(gl, thresholdFragmentShaderText);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawImageThreshold(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel);
    }
    
    function webGLRandomThreshold(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel){
        
        drawImageRandomThreshold = drawImageRandomThreshold || createWebGLDrawImageFunc(gl, randomThresholdFragmentShaderText, ['u_random_seed']);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawImageRandomThreshold(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel, (gl, customUniformLocations)=>{
            gl.uniform2f(customUniformLocations['u_random_seed'], Math.random(), Math.random());
        });
    }
    
    function webGLOrderedDither(gl, texture, imageWidth, imageHeight, threshold, blackPixel, whitePixel, bayerTexture, bayerArrayDimensions){
        
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
                bayerTexture = Bayer.createAndLoadTexture(gl, Bayer.create(dimensions), dimensions);
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
    
    return {
        threshold: webGLThreshold,
        randomThreshold: webGLRandomThreshold,
        createOrderedDither: createWebGLOrderedDither,
        colorReplace: webGLColorReplace,
        textureCombine: webGL3TextureCombine,
    };    
})(App.BayerWebgl, App.WebGl);