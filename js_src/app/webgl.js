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

App.WebGl = (function(m4){
    /*
    * Shader and program creation
    */
    //based on: https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html
    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if(success){
            return shader;
        }
        //something went wrong
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
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if(success){
            return program;
        }
        //something went wrong
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }
    
    /*
    * Textures
    */
    function createAndLoadTexture(gl, imageData) {
        const texture = gl.createTexture();
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
    
        // let's assume all images are not a power of 2
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        
        return texture;
    }

    function createAndLoadTextureFromArray(gl, pixels, imageWidth, imageHeight) {
        const texture = gl.createTexture();
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, imageWidth, imageHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    
        // let's assume all images are not a power of 2
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        
        return texture;
    }
    
    /*
    * Actual webgl function creation
    */
    
    //multiple textures based on: https://webglfundamentals.org/webgl/lessons/webgl-2-textures.html
    function createWebGLDrawImageFunc(gl, vertexShaderText, fragmentShaderText, customUniformNames=[]){
        // setup GLSL program
        const program = createProgram(gl, createVertexShader(gl, vertexShaderText), createFragmentShader(gl, fragmentShaderText));
        //if program is string, that means there was an error compiling
        if(typeof program === 'string'){
            console.log(program);
            return;
        }
        
        // look up where the vertex data needs to go.
        const positionLocation = gl.getAttribLocation(program, 'a_position');
        const texcoordLocation = gl.getAttribLocation(program, 'a_texcoord');
        
        // lookup uniforms
        const matrixLocation = gl.getUniformLocation(program, 'u_matrix');
        const textureLocation = gl.getUniformLocation(program, 'u_texture');
        
        //lookup custom uniforms
        const customUniformLocations = {};
        customUniformNames.forEach((customUniformName)=>{
            customUniformLocations[customUniformName] = gl.getUniformLocation(program, customUniformName);
        });
        
        // Create a buffer.
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        
        // Put a unit quad in the buffer
        const positions = [
        0, 0,
        0, 1,
        1, 0,
        1, 0,
        0, 1,
        1, 1,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        
        // Create a buffer for texture coords
        const texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        
        // Put texcoords in the buffer
        const texcoords = [
        0, 0,
        0, 1,
        1, 0,
        1, 0,
        0, 1,
        1, 1,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
        
        return function(gl, tex, texWidth, texHeight, setCustomUniformsFunc=(gl, customUniformLocations)=>{}) {
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
            let matrix = m4.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
            
            // this matrix will translate our quad to dstX, dstY
            const dstX = 0; 
            const dstY = 0;
            matrix = m4.translate(matrix, dstX, dstY, 0);
            
            // this matrix will scale our 1 unit quad
            // from 1 unit to texWidth, texHeight units
            matrix = m4.scale(matrix, texWidth, texHeight, 1);
            
            // Set the matrix.
            gl.uniformMatrix4fv(matrixLocation, false, matrix);
            
            // Tell the shader to get the texture from texture unit 0
            gl.uniform1i(textureLocation, 0);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, tex);
            
            //set custom uniform values
            setCustomUniformsFunc(gl, customUniformLocations);
            
            // draw the quad (2 triangles, 6 vertices)
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        };
    }
    
    
    return {
        createAndLoadTexture,
        createAndLoadTextureFromArray,
        createDrawImageFunc: createWebGLDrawImageFunc,
    };    
})(App.M4);