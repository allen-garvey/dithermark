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

App.WebGl = (function(){
    //based on: https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html
    
    var m4 = {};
    
    /**
   * Multiply by a scaling matrix
   * @param {Matrix4} m matrix to multiply
   * @param {number} sx x scale.
   * @param {number} sy y scale.
   * @param {number} sz z scale.
   * @param {Matrix4} [dst] optional matrix to store result
   * @return {Matrix4} dst or a new matrix if none provided
   * @memberOf module:webgl-3d-math
   */
    m4.scale = function(m, sx, sy, sz, dst) {
        // This is the optimized verison of
        // return multiply(m, scaling(sx, sy, sz), dst);
        dst = dst || new Float32Array(16);
    
        dst[ 0] = sx * m[0 * 4 + 0];
        dst[ 1] = sx * m[0 * 4 + 1];
        dst[ 2] = sx * m[0 * 4 + 2];
        dst[ 3] = sx * m[0 * 4 + 3];
        dst[ 4] = sy * m[1 * 4 + 0];
        dst[ 5] = sy * m[1 * 4 + 1];
        dst[ 6] = sy * m[1 * 4 + 2];
        dst[ 7] = sy * m[1 * 4 + 3];
        dst[ 8] = sz * m[2 * 4 + 0];
        dst[ 9] = sz * m[2 * 4 + 1];
        dst[10] = sz * m[2 * 4 + 2];
        dst[11] = sz * m[2 * 4 + 3];
    
        if (m !== dst) {
          dst[12] = m[12];
          dst[13] = m[13];
          dst[14] = m[14];
          dst[15] = m[15];
        }
    
        return dst;
      };
      
      /**
   * Mutliply by translation matrix.
   * @param {Matrix4} m matrix to multiply
   * @param {number} tx x translation.
   * @param {number} ty y translation.
   * @param {number} tz z translation.
   * @param {Matrix4} [dst] optional matrix to store result
   * @return {Matrix4} dst or a new matrix if none provided
   * @memberOf module:webgl-3d-math
   */
      m4.translate = 
          function(m, tx, ty, tz, dst) {
            // This is the optimized version of
            // return multiply(m, translation(tx, ty, tz), dst);
            dst = dst || new Float32Array(16);
        
            var m00 = m[0];
            var m01 = m[1];
            var m02 = m[2];
            var m03 = m[3];
            var m10 = m[1 * 4 + 0];
            var m11 = m[1 * 4 + 1];
            var m12 = m[1 * 4 + 2];
            var m13 = m[1 * 4 + 3];
            var m20 = m[2 * 4 + 0];
            var m21 = m[2 * 4 + 1];
            var m22 = m[2 * 4 + 2];
            var m23 = m[2 * 4 + 3];
            var m30 = m[3 * 4 + 0];
            var m31 = m[3 * 4 + 1];
            var m32 = m[3 * 4 + 2];
            var m33 = m[3 * 4 + 3];
        
            if (m !== dst) {
              dst[ 0] = m00;
              dst[ 1] = m01;
              dst[ 2] = m02;
              dst[ 3] = m03;
              dst[ 4] = m10;
              dst[ 5] = m11;
              dst[ 6] = m12;
              dst[ 7] = m13;
              dst[ 8] = m20;
              dst[ 9] = m21;
              dst[10] = m22;
              dst[11] = m23;
            }
        
            dst[12] = m00 * tx + m10 * ty + m20 * tz + m30;
            dst[13] = m01 * tx + m11 * ty + m21 * tz + m31;
            dst[14] = m02 * tx + m12 * ty + m22 * tz + m32;
            dst[15] = m03 * tx + m13 * ty + m23 * tz + m33;
        
            return dst;
          }
    
    
    /**
   * Computes a 4-by-4 orthographic projection matrix given the coordinates of the
   * planes defining the axis-aligned, box-shaped viewing volume.  The matrix
   * generated sends that box to the unit box.  Note that although left and right
   * are x coordinates and bottom and top are y coordinates, near and far
   * are not z coordinates, but rather they are distances along the negative
   * z-axis.  We assume a unit box extending from -1 to 1 in the x and y
   * dimensions and from -1 to 1 in the z dimension.
   * @param {number} left The x coordinate of the left plane of the box.
   * @param {number} right The x coordinate of the right plane of the box.
   * @param {number} bottom The y coordinate of the bottom plane of the box.
   * @param {number} top The y coordinate of the right plane of the box.
   * @param {number} near The negative z coordinate of the near plane of the box.
   * @param {number} far The negative z coordinate of the far plane of the box.
   * @param {Matrix4} [dst] optional matrix to store result
   * @return {Matrix4} dst or a new matrix if none provided
   * @memberOf module:webgl-3d-math
   */      
    m4.orthographic = 
      function orthographic(left, right, bottom, top, near, far, dst) {
        dst = dst || new Float32Array(16);
    
        dst[ 0] = 2 / (right - left);
        dst[ 1] = 0;
        dst[ 2] = 0;
        dst[ 3] = 0;
        dst[ 4] = 0;
        dst[ 5] = 2 / (top - bottom);
        dst[ 6] = 0;
        dst[ 7] = 0;
        dst[ 8] = 0;
        dst[ 9] = 0;
        dst[10] = 2 / (near - far);
        dst[11] = 0;
        dst[12] = (left + right) / (left - right);
        dst[13] = (bottom + top) / (bottom - top);
        dst[14] = (near + far) / (near - far);
        dst[15] = 1;
    
        return dst;
      }
    
    
    
    
    
    function createCanvas(canvasId){
        var canvasObject = {
            canvas: document.getElementById(canvasId)
        };
        var gl = canvasObject.canvas.getContext('webgl');
        if (!gl) {
            gl = canvasObject.canvas.getContext('experimental-webgl');
        }
        if(!gl){
            console.log('WebGL not enabled!');
            return;
        }
        canvasObject.gl = gl;
        
        return canvasObject;
    }
    
    
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
    
    /*
    function getAttributeLocation(gl, program, attributeName){
        return gl.getAttribLocation(program, attributeName);
    }
    */
    
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
    
    
    function createDrawImage(gl){
        // setup GLSL program
        var program = createProgram(gl, createVertexShader(gl, thresholdVertexShaderText), createFragmentShader(gl, thresholdFragmentShaderText));
        
        // look up where the vertex data needs to go.
        var positionLocation = gl.getAttribLocation(program, 'a_position');
        var texcoordLocation = gl.getAttribLocation(program, 'a_texcoord');
        
        // lookup uniforms
        var matrixLocation = gl.getUniformLocation(program, 'u_matrix');
        var textureLocation = gl.getUniformLocation(program, 'u_texture');
        var thresholdLocation = gl.getUniformLocation(program, 'u_threshold');
        
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
        
        return function(gl, tex, texWidth, texHeight, threshold, dstX=0, dstY=0) {
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
         
          // draw the quad (2 triangles, 6 vertices)
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        };
        
    }
    
    
    var thresholdVertexShaderText = document.getElementById('webgl-threshold-vertex-shader').textContent;
    var thresholdFragmentShaderText = document.getElementById('webgl-threshold-fragment-shader').textContent;
    var drawImage;
    
    function webGLThreshold(gl, imageData, threshold){
        //convert threshold to float
        threshold = threshold / 255.0;
        
        drawImage = drawImage || createDrawImage(gl);
        var texture = createAndLoadTexture(gl, imageData);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawImage(gl, texture, imageData.width, imageData.height, threshold);
    }
    
    
    
    
    return {
        createCanvas: createCanvas,
        threshold: webGLThreshold,
    };    
})();