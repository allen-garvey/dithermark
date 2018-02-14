
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
    
    function fragmentShaderText(shaderBase, distanceFuncId){
        return shaderBase.replace('#{{lightnessFunction}}', fragmentShaderLightnessFuncText).replace('#{{hslFunctions}}', fragmentShaderHslFuncsText).replace('#{{distanceFunction}}', shaderText(distanceFuncId));
    }
    
    //reused webgl fragment shader functions
    var fragmentShaderLightnessFuncText = shaderText('webgl-fragment-shader-lightness-function');
    var fragmentShaderHslFuncsText = shaderText('webgl-hsl-functions');
    //vertex shader
    var vertexShaderText = shaderText('webgl-threshold-vertex-shader');
    //fragment shaders
    var closestColorShaderBase = shaderText('webgl-closest-color-fshader');
    var orderedDitherSharedBase = shaderText('webgl-ordered-dither-color-fshader');
    
    var closestColorShaderText = {};
    closestColorShaderText[ColorDitherModes.get('RGB').id] = fragmentShaderText(closestColorShaderBase, 'webgl-rgb-distance');
    closestColorShaderText[ColorDitherModes.get('HUE_LIGHTNESS').id] = fragmentShaderText(closestColorShaderBase, 'webgl-hue-lightness-distance');
    closestColorShaderText[ColorDitherModes.get('HSL').id] = fragmentShaderText(closestColorShaderBase, 'webgl-hue-saturation-lightness-distance');
    
    var orderedDitherShaderText = {};
    orderedDitherShaderText[ColorDitherModes.get('RGB').id] = fragmentShaderText(orderedDitherSharedBase, 'webgl-rgb-distance');
    orderedDitherShaderText[ColorDitherModes.get('HUE_LIGHTNESS').id] = fragmentShaderText(orderedDitherSharedBase, 'webgl-hue-lightness-distance');
    orderedDitherShaderText[ColorDitherModes.get('HSL').id] = fragmentShaderText(orderedDitherSharedBase, 'webgl-hue-saturation-lightness-distance');
    
    //draw image created functions
    var drawImageClosestColor = {};
    var drawImageOrderedDither = {};
    
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
    
    function orderedDither(gl, texture, imageWidth, imageHeight, colorDitherModeId, colorsArray, colorsArrayLength, bayerTexture, bayerDimensions){
        let drawImageFunc = drawImageOrderedDither[colorDitherModeId];
        if(!drawImageFunc){
            drawImageFunc = createWebGLDrawImageFunc(gl, orderedDitherShaderText[colorDitherModeId], ['u_bayer_texture_dimensions', 'u_bayer_texture']);
            drawImageOrderedDither[colorDitherModeId] = drawImageFunc;
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
    
    function createOrderedDither(dimensions){
        return (gl, texture, imageWidth, imageHeight, colorDitherModeId, colorsArray, colorsArrayLength)=>{
            let bayerTexture = bayerTextures[dimensions];
            if(!bayerTexture){
                bayerTexture = Bayer.createAndLoadTexture(gl, Bayer.create(dimensions), dimensions);
                bayerTextures[dimensions] = bayerTexture;
            }
            orderedDither(gl, texture, imageWidth, imageHeight, colorDitherModeId, colorsArray, colorsArrayLength, bayerTexture, dimensions);
        };
    }
    
    
    
    return {
        closestColor: closestColor,
        createOrderedDither: createOrderedDither,
    };    
})(App.WebGl, App.ColorDitherModes, App.BayerWebgl);