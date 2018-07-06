
App.WebGlImageOutline = (function(WebGl, Shader){
    function createOutlineFunc(gl, filterNumber){
        const fragmentShaderText = Shader.shaderText('webgl-fragment-image-outline-filter'+filterNumber);
        const drawFunc = WebGl.createDrawImageFunc(gl, Shader.vertexShaderText, fragmentShaderText, ['u_radius']);
        
        return function(gl, tex, texWidth, texHeight, radius){
            drawFunc(gl, tex, texWidth, texHeight, (gl, customUniformLocations)=>{
                //initialize uniforms
                gl.uniform1f(customUniformLocations['u_radius'], radius);
            });
        };
    }

    let cachedOutlineFuncs = new Array(2);

    function outlineImageBase(gl, texture, imageWidth, imageHeight, filterNumber, radius){
        const cacheIndex = filterNumber - 1;
        if(!cachedOutlineFuncs[cacheIndex]){
            cachedOutlineFuncs[cacheIndex] = createOutlineFunc(gl, filterNumber);
        }
        const outlineFunc = cachedOutlineFuncs[cacheIndex];
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        outlineFunc(gl, texture, imageWidth, imageHeight, radius);
    }

    function outlineImage1(gl, texture, imageWidth, imageHeight, radiusPercent){
        const radius = radiusPercent / imageWidth;
        outlineImageBase(gl, texture, imageWidth, imageHeight, 1, radius);
    }

    function outlineImage2(gl, texture, imageWidth, imageHeight, radiusPercent){
        const radius = radiusPercent / imageHeight;
        outlineImageBase(gl, texture, imageWidth, imageHeight, 2, radius);
    }
    
    return {
        outlineImage1,
        outlineImage2,
    };
    
})(App.WebGl, App.WebGlShader);