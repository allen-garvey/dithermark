/*
 * Copyright 2014, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

App.WebGl = (function(m4, Bayer){
    
    function createCanvas(canvasId){
        var canvasObject = {
            canvas: document.getElementById(canvasId)
        };
        var gl = canvasObject.canvas.getContext('webgl');
        if (!gl) {
            gl = canvasObject.canvas.getContext('experimental-webgl');
        }
        canvasObject.gl = gl;
        
        return canvasObject;
    }
    
    //based on: https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html
    function createShader(gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
        
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }
    
    function createVertexShader(gl, vertexShaderSource){
        return createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    }
    
    function createFragmentShader(gl, fragmentShaderSource){
        return createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    }
    
    
    
    function createProgram(gl, vertexShader, fragmentShader) {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }
        
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }
    
    function createAndLoadTexture(gl, imageData) {
        var texture = gl.createTexture();
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
    
        // let's assume all images are not a power of 2
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        
        return texture;
    }
    
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
    * Pixel stuff
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
    * Actual webgl function creation
    */

    function createDrawImageThreshold(gl){
        // setup GLSL program
        var program = createProgram(gl, createVertexShader(gl, thresholdVertexShaderText), createFragmentShader(gl, thresholdFragmentShaderText));
        
        // look up where the vertex data needs to go.
        var positionLocation = gl.getAttribLocation(program, 'a_position');
        var texcoordLocation = gl.getAttribLocation(program, 'a_texcoord');
        
        // lookup uniforms
        var matrixLocation = gl.getUniformLocation(program, 'u_matrix');
        var textureLocation = gl.getUniformLocation(program, 'u_texture');
        var thresholdLocation = gl.getUniformLocation(program, 'u_threshold');
        var blackPixelLocation = gl.getUniformLocation(program, 'u_black_pixel');
        var whitePixelLocation = gl.getUniformLocation(program, 'u_white_pixel');
        
        // Create a buffer.
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        
        // Put a unit quad in the buffer
        var positions = [
        0, 0,
        0, 1,
        1, 0,
        1, 0,
        0, 1,
        1, 1,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        
        // Create a buffer for texture coords
        var texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        
        // Put texcoords in the buffer
        var texcoords = [
        0, 0,
        0, 1,
        1, 0,
        1, 0,
        0, 1,
        1, 1,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
        
        return function(gl, tex, texWidth, texHeight, threshold, blackPixel, whitePixel, dstX=0, dstY=0) {
          gl.bindTexture(gl.TEXTURE_2D, tex);
         
          // Tell WebGL to use our shader program pair
          gl.useProgram(program);
         
          // Setup the attributes to pull data from our buffers
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.enableVertexAttribArray(positionLocation);
          gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
          gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
          gl.enableVertexAttribArray(texcoordLocation);
          gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);
         
          // this matrix will convert from pixels to clip space
          var matrix = m4.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
         
          // this matrix will translate our quad to dstX, dstY
          matrix = m4.translate(matrix, dstX, dstY, 0);
         
          // this matrix will scale our 1 unit quad
          // from 1 unit to texWidth, texHeight units
          matrix = m4.scale(matrix, texWidth, texHeight, 1);
         
          // Set the matrix.
          gl.uniformMatrix4fv(matrixLocation, false, matrix);
         
          // Tell the shader to get the texture from texture unit 0
          gl.uniform1i(textureLocation, 0);
          
          //set threshold
          gl.uniform1f(thresholdLocation, threshold);
          
          //set pixels
          gl.uniform3fv(blackPixelLocation, pixelToVec(blackPixel));
          gl.uniform3fv(whitePixelLocation, pixelToVec(whitePixel));
         
          // draw the quad (2 triangles, 6 vertices)
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        };
    }
    
    function createDrawImageRandomThreshold(gl){
        // setup GLSL program
        var program = createProgram(gl, createVertexShader(gl, thresholdVertexShaderText), createFragmentShader(gl, randomThresholdFragmentShaderText));
        
        // look up where the vertex data needs to go.
        var positionLocation = gl.getAttribLocation(program, 'a_position');
        var texcoordLocation = gl.getAttribLocation(program, 'a_texcoord');
        
        // lookup uniforms
        var matrixLocation = gl.getUniformLocation(program, 'u_matrix');
        var textureLocation = gl.getUniformLocation(program, 'u_texture');
        var thresholdLocation = gl.getUniformLocation(program, 'u_threshold');
        var randomSeedLocation = gl.getUniformLocation(program, 'u_random_seed');
        var blackPixelLocation = gl.getUniformLocation(program, 'u_black_pixel');
        var whitePixelLocation = gl.getUniformLocation(program, 'u_white_pixel');
        
        // Create a buffer.
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        
        // Put a unit quad in the buffer
        var positions = [
        0, 0,
        0, 1,
        1, 0,
        1, 0,
        0, 1,
        1, 1,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        
        // Create a buffer for texture coords
        var texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        
        // Put texcoords in the buffer
        var texcoords = [
        0, 0,
        0, 1,
        1, 0,
        1, 0,
        0, 1,
        1, 1,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
        
        return function(gl, tex, texWidth, texHeight, threshold, blackPixel, whitePixel, dstX=0, dstY=0) {
          gl.bindTexture(gl.TEXTURE_2D, tex);
         
          // Tell WebGL to use our shader program pair
          gl.useProgram(program);
         
          // Setup the attributes to pull data from our buffers
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.enableVertexAttribArray(positionLocation);
          gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
          gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
          gl.enableVertexAttribArray(texcoordLocation);
          gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);
         
          // this matrix will convert from pixels to clip space
          var matrix = m4.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
         
          // this matrix will translate our quad to dstX, dstY
          matrix = m4.translate(matrix, dstX, dstY, 0);
         
          // this matrix will scale our 1 unit quad
          // from 1 unit to texWidth, texHeight units
          matrix = m4.scale(matrix, texWidth, texHeight, 1);
         
          // Set the matrix.
          gl.uniformMatrix4fv(matrixLocation, false, matrix);
         
          // Tell the shader to get the texture from texture unit 0
          gl.uniform1i(textureLocation, 0);
          
          //set threshold
          gl.uniform1f(thresholdLocation, threshold);
          
          //set pixels
          gl.uniform3fv(blackPixelLocation, pixelToVec(blackPixel));
          gl.uniform3fv(whitePixelLocation, pixelToVec(whitePixel));
          
          //set random seed
          var randomSeed = new Float32Array(2);
          randomSeed[0] = Math.random();
          randomSeed[1] = Math.random();
          gl.uniform2fv(randomSeedLocation, randomSeed);
         
          // draw the quad (2 triangles, 6 vertices)
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        };
    }
    
    //multiple textures based on: https://webglfundamentals.org/webgl/lessons/webgl-2-textures.html
    function createDrawImageOrderedDither(gl){
        var fragmentShaderSource = orderedDitherFragmentShaderText;
        // setup GLSL program
        var program = createProgram(gl, createVertexShader(gl, thresholdVertexShaderText), createFragmentShader(gl, fragmentShaderSource));
        
        // look up where the vertex data needs to go.
        var positionLocation = gl.getAttribLocation(program, 'a_position');
        var texcoordLocation = gl.getAttribLocation(program, 'a_texcoord');
        
        // lookup uniforms
        var matrixLocation = gl.getUniformLocation(program, 'u_matrix');
        var textureLocation = gl.getUniformLocation(program, 'u_texture');
        var thresholdLocation = gl.getUniformLocation(program, 'u_threshold');
        var blackPixelLocation = gl.getUniformLocation(program, 'u_black_pixel');
        var whitePixelLocation = gl.getUniformLocation(program, 'u_white_pixel');
        var bayerTextureDimensionsLocation = gl.getUniformLocation(program, 'u_bayer_texture_dimensions');
        var bayerTextureLocation = gl.getUniformLocation(program, 'u_bayer_texture');
        // Create a buffer.
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        
        // Put a unit quad in the buffer
        var positions = [
        0, 0,
        0, 1,
        1, 0,
        1, 0,
        0, 1,
        1, 1,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        
        // Create a buffer for texture coords
        var texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        
        // Put texcoords in the buffer
        var texcoords = [
        0, 0,
        0, 1,
        1, 0,
        1, 0,
        0, 1,
        1, 1,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
        
        return function(gl, tex, texWidth, texHeight, threshold, blackPixel, whitePixel, bayerTex, bayerArrayDimensions, dstX=0, dstY=0) {
         
          // Tell WebGL to use our shader program pair
          gl.useProgram(program);
         
          // Setup the attributes to pull data from our buffers
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.enableVertexAttribArray(positionLocation);
          gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
          gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
          gl.enableVertexAttribArray(texcoordLocation);
          gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);
         
          // this matrix will convert from pixels to clip space
          var matrix = m4.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
         
          // this matrix will translate our quad to dstX, dstY
          matrix = m4.translate(matrix, dstX, dstY, 0);
         
          // this matrix will scale our 1 unit quad
          // from 1 unit to texWidth, texHeight units
          matrix = m4.scale(matrix, texWidth, texHeight, 1);
         
          // Set the matrix.
          gl.uniformMatrix4fv(matrixLocation, false, matrix);
         
          // Tell the shader to get the texture from texture unit 0
          gl.uniform1i(textureLocation, 0);
          gl.uniform1i(bayerTextureLocation, 1);
          
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, bayerTex);
          
          //set threshold
          gl.uniform1f(thresholdLocation, threshold);
          
          //set pixels
          gl.uniform3fv(blackPixelLocation, pixelToVec(blackPixel));
          gl.uniform3fv(whitePixelLocation, pixelToVec(whitePixel));
          
          //set bayer texture dimensions
          gl.uniform1f(bayerTextureDimensionsLocation, bayerArrayDimensions);
          
          //set bayer matrix
        //   gl.uniform1fv(bayerMatrixLocation, bayerMatrix);
         
          // draw the quad (2 triangles, 6 vertices)
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        };
    }
    
    function getShaderScriptText(id){
        return document.getElementById(id).textContent;
    }
    
    //vertex shader
    var thresholdVertexShaderText = getShaderScriptText('webgl-threshold-vertex-shader');
    //fragment shaders
    var fragmentLightnessFunctionText = getShaderScriptText('webgl-fragment-shader-lightness-function');
    var fragmentShaderTemplate = getShaderScriptText('webgl-fragment-shader-template').replace('#{{lightnessFunction}}', fragmentLightnessFunctionText);
    
    var thresholdFragmentShaderText = fragmentShaderTemplate.replace('#{{customDeclaration}}', '').replace('#{{adjustedThreshold}}', getShaderScriptText('webgl-threshold-fragment-shader-adjusted-threshold'));
    var randomThresholdFragmentShaderText = fragmentShaderTemplate.replace('#{{customDeclaration}}', getShaderScriptText('webgl-random-threshold-fragment-shader-declaration')).replace('#{{adjustedThreshold}}', getShaderScriptText('webgl-random-threshold-fragment-shader-adjusted-threshold'));
    var orderedDitherFragmentShaderText = fragmentShaderTemplate.replace('#{{customDeclaration}}', getShaderScriptText('webgl-ordered-dither-fragment-shader-declaration')).replace('#{{adjustedThreshold}}', getShaderScriptText('webgl-ordered-dither-fragment-shader-adjusted-threshold'));
    
    //draw image created functions
    var drawImageThreshold;
    var drawImageRandomThreshold;
    var drawImageOrderedDither;
    
    function webGLThreshold(gl, imageData, threshold, blackPixel, whitePixel){
        //convert threshold to float
        threshold = threshold / 255.0;
        
        drawImageThreshold = drawImageThreshold || createDrawImageThreshold(gl);
        var texture = createAndLoadTexture(gl, imageData);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawImageThreshold(gl, texture, imageData.width, imageData.height, threshold, blackPixel, whitePixel);
    }
    
    function webGLRandomThreshold(gl, imageData, threshold, blackPixel, whitePixel){
        //convert threshold to float
        threshold = threshold / 255.0;
        
        drawImageRandomThreshold = drawImageRandomThreshold || createDrawImageRandomThreshold(gl);
        var texture = createAndLoadTexture(gl, imageData);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawImageRandomThreshold(gl, texture, imageData.width, imageData.height, threshold, blackPixel, whitePixel);
    }
    
    function webGLOrderedDither(gl, imageData, threshold, blackPixel, whitePixel, bayerArray, bayerArrayDimensions){
        //convert threshold to float
        threshold = threshold / 255.0;
        //4 UInts per pixel * 2 dimensions = 8
        
        drawImageOrderedDither = drawImageOrderedDither || createDrawImageOrderedDither(gl);
        var texture = createAndLoadTexture(gl, imageData);
        var bayerTexture = createAndLoadBayerTexture(gl, bayerArray, bayerArrayDimensions);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawImageOrderedDither(gl, texture, imageData.width, imageData.height, threshold, blackPixel, whitePixel, bayerTexture, bayerArrayDimensions);
    }
    
    
     function webGLOrderedDither2(gl, imageData, threshold, blackPixel, whitePixel){
        webGLOrderedDither(gl, imageData, threshold, blackPixel, whitePixel, Bayer.create(2), 2);
    }
    
    function webGLOrderedDither4(gl, imageData, threshold, blackPixel, whitePixel){
       webGLOrderedDither(gl, imageData, threshold, blackPixel, whitePixel, Bayer.create(4), 4);
    }
    
    function webGLOrderedDither8(gl, imageData, threshold, blackPixel, whitePixel){
       webGLOrderedDither(gl, imageData, threshold, blackPixel, whitePixel, Bayer.create(8), 8);
    }
    
    function webGLOrderedDither16(gl, imageData, threshold, blackPixel, whitePixel){
       webGLOrderedDither(gl, imageData, threshold, blackPixel, whitePixel, Bayer.create(16), 16);
    }
    
    
    console.log(Bayer.create2(16));
    
    return {
        createCanvas: createCanvas,
        threshold: webGLThreshold,
        randomThreshold: webGLRandomThreshold,
        orderedDither2: webGLOrderedDither2,
        orderedDither4: webGLOrderedDither4,
        orderedDither8: webGLOrderedDither8,
        orderedDither16: webGLOrderedDither16,
    };    
})(App.M4, App.BayerMatrix);