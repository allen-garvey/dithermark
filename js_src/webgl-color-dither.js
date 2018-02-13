
App.WebGlColorDither = (function(WebGl){
    
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
    
    function getShaderScriptText(id){
        return document.getElementById(id).textContent;
    }
    
    //vertex shader
    var vertexShaderText = getShaderScriptText('webgl-threshold-vertex-shader');
    //fragment shaders
    var closestColorShaderText = getShaderScriptText('webgl-closest-color-fshader');
    
    
    //draw image created functions
    var drawImageClosestColor;
    
    
    function closestColor(gl, texture, imageWidth, imageHeight, colorsArray, colorsArrayLength){
        
        drawImageClosestColor = drawImageClosestColor || createWebGLDrawImageFunc(gl, closestColorShaderText);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawImageClosestColor(gl, texture, imageWidth, imageHeight, colorsArray, colorsArrayLength);
    }
    
    
    
    return {
        closestColor: closestColor,
    };    
})(App.WebGl);