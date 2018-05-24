
App.WebGlBilateralFilter = (function(WebGl, Shader){
    function createFilterFunc(gl){
        const fragmentShaderText = Shader.shaderText('webgl-fragment-shader-bilateral-filter');
        const drawFunc = WebGl.createDrawImageFunc(gl, Shader.vertexShaderText, fragmentShaderText, ['u_exponent', 'u_image_dimensions']);
        
        return function(gl, tex, texWidth, texHeight, filterExponent){
            drawFunc(gl, tex, texWidth, texHeight, (gl, customUniformLocations)=>{
                //initialize uniforms
                gl.uniform1f(customUniformLocations['u_exponent'], filterExponent);
                gl.uniform2f(customUniformLocations['u_image_dimensions'], texWidth, texHeight);
            });
        };
    }

    let filterFunc = null;

    //filterExponent recommended between 10-20 and bilateral filter should be run twice and fed into itself
    function filter(gl, texture, imageWidth, imageHeight, filterExponent){
        filterFunc = filterFunc || createFilterFunc(gl);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        filterFunc(gl, texture, imageWidth, imageHeight, filterExponent);
    }

    function filterImage(webGlCanvas, texture, imageWidth, imageHeight, filterExponent, outputCanvas){
        //do the filter twice for better results
        for(let i=0;i<2;i++){
            filter(webGlCanvas.gl, texture, imageWidth, imageHeight, filterExponent);
            outputCanvas.context.drawImage(webGlCanvas.canvas, 0, 0);
            webGlCanvas.gl.deleteTexture(texture);
            texture = WebGl.createAndLoadTexture(webGlCanvas.gl, outputCanvas.context.getImageData(0, 0, imageWidth, imageHeight));
        }

        return texture;
    }
    
    return {
        filterImage,
    };
    
})(App.WebGl, App.WebGlShader);