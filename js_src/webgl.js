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
    * Ordered dither matrix stuff
    */
    
    function createOrderedBayer2(){
        var bayer = new Uint8Array(16);
        bayer[0] = 0;
        bayer[1] = 0;
        bayer[2] = 0;
        bayer[3] = 0;
        bayer[4] = 192;
        bayer[5] = 0;
        bayer[6] = 0;
        bayer[7] = 0;
        bayer[8] = 128;
        bayer[9] = 0;
        bayer[10] = 0;
        bayer[11] = 0;
        bayer[12] = 64;
        bayer[13] = 0;
        bayer[14] = 0;
        bayer[15] = 0;
        
        return bayer;
    }
    
    function createOrderedBayer4(){
        var bayer = new Uint8Array(64);
        bayer[0] = 0;
        bayer[1] = 0;
        bayer[2] = 0;
        bayer[3] = 0;
        bayer[4] = 128;
        bayer[5] = 0;
        bayer[6] = 0;
        bayer[7] = 0;
        bayer[8] = 32;
        bayer[9] = 0;
        bayer[10] = 0;
        bayer[11] = 0;
        bayer[12] = 160;
        bayer[13] = 0;
        bayer[14] = 0;
        bayer[15] = 0;
        bayer[16] = 192;
        bayer[17] = 0;
        bayer[18] = 0;
        bayer[19] = 0;
        bayer[20] = 64;
        bayer[21] = 0;
        bayer[22] = 0;
        bayer[23] = 0;
        bayer[24] = 224;
        bayer[25] = 0;
        bayer[26] = 0;
        bayer[27] = 0;
        bayer[28] = 96;
        bayer[29] = 0;
        bayer[30] = 0;
        bayer[31] = 0;
        bayer[32] = 48;
        bayer[33] = 0;
        bayer[34] = 0;
        bayer[35] = 0;
        bayer[36] = 176;
        bayer[37] = 0;
        bayer[38] = 0;
        bayer[39] = 0;
        bayer[40] = 16;
        bayer[41] = 0;
        bayer[42] = 0;
        bayer[43] = 0;
        bayer[44] = 144;
        bayer[45] = 0;
        bayer[46] = 0;
        bayer[47] = 0;
        bayer[48] = 240;
        bayer[49] = 0;
        bayer[50] = 0;
        bayer[51] = 0;
        bayer[52] = 112;
        bayer[53] = 0;
        bayer[54] = 0;
        bayer[55] = 0;
        bayer[56] = 208;
        bayer[57] = 0;
        bayer[58] = 0;
        bayer[59] = 0;
        bayer[60] = 80;
        bayer[61] = 0;
        bayer[62] = 0;
        bayer[63] = 0;
        
        return bayer;
    }
    
    function createOrderedBayer8(){
        var bayer = new Uint8Array(256);
        bayer[0] = 0;
        bayer[1] = 0;
        bayer[2] = 0;
        bayer[3] = 0;
        bayer[4] = 192;
        bayer[5] = 0;
        bayer[6] = 0;
        bayer[7] = 0;
        bayer[8] = 48;
        bayer[9] = 0;
        bayer[10] = 0;
        bayer[11] = 0;
        bayer[12] = 240;
        bayer[13] = 0;
        bayer[14] = 0;
        bayer[15] = 0;
        bayer[16] = 12;
        bayer[17] = 0;
        bayer[18] = 0;
        bayer[19] = 0;
        bayer[20] = 204;
        bayer[21] = 0;
        bayer[22] = 0;
        bayer[23] = 0;
        bayer[24] = 60;
        bayer[25] = 0;
        bayer[26] = 0;
        bayer[27] = 0;
        bayer[28] = 252;
        bayer[29] = 0;
        bayer[30] = 0;
        bayer[31] = 0;
        bayer[32] = 128;
        bayer[33] = 0;
        bayer[34] = 0;
        bayer[35] = 0;
        bayer[36] = 64;
        bayer[37] = 0;
        bayer[38] = 0;
        bayer[39] = 0;
        bayer[40] = 176;
        bayer[41] = 0;
        bayer[42] = 0;
        bayer[43] = 0;
        bayer[44] = 112;
        bayer[45] = 0;
        bayer[46] = 0;
        bayer[47] = 0;
        bayer[48] = 140;
        bayer[49] = 0;
        bayer[50] = 0;
        bayer[51] = 0;
        bayer[52] = 76;
        bayer[53] = 0;
        bayer[54] = 0;
        bayer[55] = 0;
        bayer[56] = 188;
        bayer[57] = 0;
        bayer[58] = 0;
        bayer[59] = 0;
        bayer[60] = 124;
        bayer[61] = 0;
        bayer[62] = 0;
        bayer[63] = 0;
        bayer[64] = 32;
        bayer[65] = 0;
        bayer[66] = 0;
        bayer[67] = 0;
        bayer[68] = 224;
        bayer[69] = 0;
        bayer[70] = 0;
        bayer[71] = 0;
        bayer[72] = 16;
        bayer[73] = 0;
        bayer[74] = 0;
        bayer[75] = 0;
        bayer[76] = 208;
        bayer[77] = 0;
        bayer[78] = 0;
        bayer[79] = 0;
        bayer[80] = 44;
        bayer[81] = 0;
        bayer[82] = 0;
        bayer[83] = 0;
        bayer[84] = 236;
        bayer[85] = 0;
        bayer[86] = 0;
        bayer[87] = 0;
        bayer[88] = 28;
        bayer[89] = 0;
        bayer[90] = 0;
        bayer[91] = 0;
        bayer[92] = 220;
        bayer[93] = 0;
        bayer[94] = 0;
        bayer[95] = 0;
        bayer[96] = 160;
        bayer[97] = 0;
        bayer[98] = 0;
        bayer[99] = 0;
        bayer[100] = 96;
        bayer[101] = 0;
        bayer[102] = 0;
        bayer[103] = 0;
        bayer[104] = 144;
        bayer[105] = 0;
        bayer[106] = 0;
        bayer[107] = 0;
        bayer[108] = 80;
        bayer[109] = 0;
        bayer[110] = 0;
        bayer[111] = 0;
        bayer[112] = 172;
        bayer[113] = 0;
        bayer[114] = 0;
        bayer[115] = 0;
        bayer[116] = 108;
        bayer[117] = 0;
        bayer[118] = 0;
        bayer[119] = 0;
        bayer[120] = 156;
        bayer[121] = 0;
        bayer[122] = 0;
        bayer[123] = 0;
        bayer[124] = 92;
        bayer[125] = 0;
        bayer[126] = 0;
        bayer[127] = 0;
        bayer[128] = 8;
        bayer[129] = 0;
        bayer[130] = 0;
        bayer[131] = 0;
        bayer[132] = 200;
        bayer[133] = 0;
        bayer[134] = 0;
        bayer[135] = 0;
        bayer[136] = 56;
        bayer[137] = 0;
        bayer[138] = 0;
        bayer[139] = 0;
        bayer[140] = 248;
        bayer[141] = 0;
        bayer[142] = 0;
        bayer[143] = 0;
        bayer[144] = 4;
        bayer[145] = 0;
        bayer[146] = 0;
        bayer[147] = 0;
        bayer[148] = 196;
        bayer[149] = 0;
        bayer[150] = 0;
        bayer[151] = 0;
        bayer[152] = 52;
        bayer[153] = 0;
        bayer[154] = 0;
        bayer[155] = 0;
        bayer[156] = 244;
        bayer[157] = 0;
        bayer[158] = 0;
        bayer[159] = 0;
        bayer[160] = 136;
        bayer[161] = 0;
        bayer[162] = 0;
        bayer[163] = 0;
        bayer[164] = 72;
        bayer[165] = 0;
        bayer[166] = 0;
        bayer[167] = 0;
        bayer[168] = 184;
        bayer[169] = 0;
        bayer[170] = 0;
        bayer[171] = 0;
        bayer[172] = 120;
        bayer[173] = 0;
        bayer[174] = 0;
        bayer[175] = 0;
        bayer[176] = 132;
        bayer[177] = 0;
        bayer[178] = 0;
        bayer[179] = 0;
        bayer[180] = 68;
        bayer[181] = 0;
        bayer[182] = 0;
        bayer[183] = 0;
        bayer[184] = 180;
        bayer[185] = 0;
        bayer[186] = 0;
        bayer[187] = 0;
        bayer[188] = 116;
        bayer[189] = 0;
        bayer[190] = 0;
        bayer[191] = 0;
        bayer[192] = 40;
        bayer[193] = 0;
        bayer[194] = 0;
        bayer[195] = 0;
        bayer[196] = 232;
        bayer[197] = 0;
        bayer[198] = 0;
        bayer[199] = 0;
        bayer[200] = 24;
        bayer[201] = 0;
        bayer[202] = 0;
        bayer[203] = 0;
        bayer[204] = 216;
        bayer[205] = 0;
        bayer[206] = 0;
        bayer[207] = 0;
        bayer[208] = 36;
        bayer[209] = 0;
        bayer[210] = 0;
        bayer[211] = 0;
        bayer[212] = 228;
        bayer[213] = 0;
        bayer[214] = 0;
        bayer[215] = 0;
        bayer[216] = 20;
        bayer[217] = 0;
        bayer[218] = 0;
        bayer[219] = 0;
        bayer[220] = 212;
        bayer[221] = 0;
        bayer[222] = 0;
        bayer[223] = 0;
        bayer[224] = 168;
        bayer[225] = 0;
        bayer[226] = 0;
        bayer[227] = 0;
        bayer[228] = 104;
        bayer[229] = 0;
        bayer[230] = 0;
        bayer[231] = 0;
        bayer[232] = 152;
        bayer[233] = 0;
        bayer[234] = 0;
        bayer[235] = 0;
        bayer[236] = 88;
        bayer[237] = 0;
        bayer[238] = 0;
        bayer[239] = 0;
        bayer[240] = 164;
        bayer[241] = 0;
        bayer[242] = 0;
        bayer[243] = 0;
        bayer[244] = 100;
        bayer[245] = 0;
        bayer[246] = 0;
        bayer[247] = 0;
        bayer[248] = 148;
        bayer[249] = 0;
        bayer[250] = 0;
        bayer[251] = 0;
        bayer[252] = 84;
        bayer[253] = 0;
        bayer[254] = 0;
        bayer[255] = 0;
        
        return bayer;
    }
    
    function createOrderedBayer16(){
        var bayer = new Uint8Array(1024);
        bayer[0] = 0;
        bayer[1] = 0;
        bayer[2] = 0;
        bayer[3] = 0;
        bayer[4] = 128;
        bayer[5] = 0;
        bayer[6] = 0;
        bayer[7] = 0;
        bayer[8] = 32;
        bayer[9] = 0;
        bayer[10] = 0;
        bayer[11] = 0;
        bayer[12] = 160;
        bayer[13] = 0;
        bayer[14] = 0;
        bayer[15] = 0;
        bayer[16] = 8;
        bayer[17] = 0;
        bayer[18] = 0;
        bayer[19] = 0;
        bayer[20] = 136;
        bayer[21] = 0;
        bayer[22] = 0;
        bayer[23] = 0;
        bayer[24] = 40;
        bayer[25] = 0;
        bayer[26] = 0;
        bayer[27] = 0;
        bayer[28] = 168;
        bayer[29] = 0;
        bayer[30] = 0;
        bayer[31] = 0;
        bayer[32] = 2;
        bayer[33] = 0;
        bayer[34] = 0;
        bayer[35] = 0;
        bayer[36] = 130;
        bayer[37] = 0;
        bayer[38] = 0;
        bayer[39] = 0;
        bayer[40] = 34;
        bayer[41] = 0;
        bayer[42] = 0;
        bayer[43] = 0;
        bayer[44] = 162;
        bayer[45] = 0;
        bayer[46] = 0;
        bayer[47] = 0;
        bayer[48] = 10;
        bayer[49] = 0;
        bayer[50] = 0;
        bayer[51] = 0;
        bayer[52] = 138;
        bayer[53] = 0;
        bayer[54] = 0;
        bayer[55] = 0;
        bayer[56] = 42;
        bayer[57] = 0;
        bayer[58] = 0;
        bayer[59] = 0;
        bayer[60] = 170;
        bayer[61] = 0;
        bayer[62] = 0;
        bayer[63] = 0;
        bayer[64] = 192;
        bayer[65] = 0;
        bayer[66] = 0;
        bayer[67] = 0;
        bayer[68] = 64;
        bayer[69] = 0;
        bayer[70] = 0;
        bayer[71] = 0;
        bayer[72] = 224;
        bayer[73] = 0;
        bayer[74] = 0;
        bayer[75] = 0;
        bayer[76] = 96;
        bayer[77] = 0;
        bayer[78] = 0;
        bayer[79] = 0;
        bayer[80] = 200;
        bayer[81] = 0;
        bayer[82] = 0;
        bayer[83] = 0;
        bayer[84] = 72;
        bayer[85] = 0;
        bayer[86] = 0;
        bayer[87] = 0;
        bayer[88] = 232;
        bayer[89] = 0;
        bayer[90] = 0;
        bayer[91] = 0;
        bayer[92] = 104;
        bayer[93] = 0;
        bayer[94] = 0;
        bayer[95] = 0;
        bayer[96] = 194;
        bayer[97] = 0;
        bayer[98] = 0;
        bayer[99] = 0;
        bayer[100] = 66;
        bayer[101] = 0;
        bayer[102] = 0;
        bayer[103] = 0;
        bayer[104] = 226;
        bayer[105] = 0;
        bayer[106] = 0;
        bayer[107] = 0;
        bayer[108] = 98;
        bayer[109] = 0;
        bayer[110] = 0;
        bayer[111] = 0;
        bayer[112] = 202;
        bayer[113] = 0;
        bayer[114] = 0;
        bayer[115] = 0;
        bayer[116] = 74;
        bayer[117] = 0;
        bayer[118] = 0;
        bayer[119] = 0;
        bayer[120] = 234;
        bayer[121] = 0;
        bayer[122] = 0;
        bayer[123] = 0;
        bayer[124] = 106;
        bayer[125] = 0;
        bayer[126] = 0;
        bayer[127] = 0;
        bayer[128] = 48;
        bayer[129] = 0;
        bayer[130] = 0;
        bayer[131] = 0;
        bayer[132] = 176;
        bayer[133] = 0;
        bayer[134] = 0;
        bayer[135] = 0;
        bayer[136] = 16;
        bayer[137] = 0;
        bayer[138] = 0;
        bayer[139] = 0;
        bayer[140] = 144;
        bayer[141] = 0;
        bayer[142] = 0;
        bayer[143] = 0;
        bayer[144] = 56;
        bayer[145] = 0;
        bayer[146] = 0;
        bayer[147] = 0;
        bayer[148] = 184;
        bayer[149] = 0;
        bayer[150] = 0;
        bayer[151] = 0;
        bayer[152] = 24;
        bayer[153] = 0;
        bayer[154] = 0;
        bayer[155] = 0;
        bayer[156] = 152;
        bayer[157] = 0;
        bayer[158] = 0;
        bayer[159] = 0;
        bayer[160] = 50;
        bayer[161] = 0;
        bayer[162] = 0;
        bayer[163] = 0;
        bayer[164] = 178;
        bayer[165] = 0;
        bayer[166] = 0;
        bayer[167] = 0;
        bayer[168] = 18;
        bayer[169] = 0;
        bayer[170] = 0;
        bayer[171] = 0;
        bayer[172] = 146;
        bayer[173] = 0;
        bayer[174] = 0;
        bayer[175] = 0;
        bayer[176] = 58;
        bayer[177] = 0;
        bayer[178] = 0;
        bayer[179] = 0;
        bayer[180] = 186;
        bayer[181] = 0;
        bayer[182] = 0;
        bayer[183] = 0;
        bayer[184] = 26;
        bayer[185] = 0;
        bayer[186] = 0;
        bayer[187] = 0;
        bayer[188] = 154;
        bayer[189] = 0;
        bayer[190] = 0;
        bayer[191] = 0;
        bayer[192] = 240;
        bayer[193] = 0;
        bayer[194] = 0;
        bayer[195] = 0;
        bayer[196] = 112;
        bayer[197] = 0;
        bayer[198] = 0;
        bayer[199] = 0;
        bayer[200] = 208;
        bayer[201] = 0;
        bayer[202] = 0;
        bayer[203] = 0;
        bayer[204] = 80;
        bayer[205] = 0;
        bayer[206] = 0;
        bayer[207] = 0;
        bayer[208] = 248;
        bayer[209] = 0;
        bayer[210] = 0;
        bayer[211] = 0;
        bayer[212] = 120;
        bayer[213] = 0;
        bayer[214] = 0;
        bayer[215] = 0;
        bayer[216] = 216;
        bayer[217] = 0;
        bayer[218] = 0;
        bayer[219] = 0;
        bayer[220] = 88;
        bayer[221] = 0;
        bayer[222] = 0;
        bayer[223] = 0;
        bayer[224] = 242;
        bayer[225] = 0;
        bayer[226] = 0;
        bayer[227] = 0;
        bayer[228] = 114;
        bayer[229] = 0;
        bayer[230] = 0;
        bayer[231] = 0;
        bayer[232] = 210;
        bayer[233] = 0;
        bayer[234] = 0;
        bayer[235] = 0;
        bayer[236] = 82;
        bayer[237] = 0;
        bayer[238] = 0;
        bayer[239] = 0;
        bayer[240] = 250;
        bayer[241] = 0;
        bayer[242] = 0;
        bayer[243] = 0;
        bayer[244] = 122;
        bayer[245] = 0;
        bayer[246] = 0;
        bayer[247] = 0;
        bayer[248] = 218;
        bayer[249] = 0;
        bayer[250] = 0;
        bayer[251] = 0;
        bayer[252] = 90;
        bayer[253] = 0;
        bayer[254] = 0;
        bayer[255] = 0;
        bayer[256] = 12;
        bayer[257] = 0;
        bayer[258] = 0;
        bayer[259] = 0;
        bayer[260] = 140;
        bayer[261] = 0;
        bayer[262] = 0;
        bayer[263] = 0;
        bayer[264] = 44;
        bayer[265] = 0;
        bayer[266] = 0;
        bayer[267] = 0;
        bayer[268] = 172;
        bayer[269] = 0;
        bayer[270] = 0;
        bayer[271] = 0;
        bayer[272] = 4;
        bayer[273] = 0;
        bayer[274] = 0;
        bayer[275] = 0;
        bayer[276] = 132;
        bayer[277] = 0;
        bayer[278] = 0;
        bayer[279] = 0;
        bayer[280] = 36;
        bayer[281] = 0;
        bayer[282] = 0;
        bayer[283] = 0;
        bayer[284] = 164;
        bayer[285] = 0;
        bayer[286] = 0;
        bayer[287] = 0;
        bayer[288] = 14;
        bayer[289] = 0;
        bayer[290] = 0;
        bayer[291] = 0;
        bayer[292] = 142;
        bayer[293] = 0;
        bayer[294] = 0;
        bayer[295] = 0;
        bayer[296] = 46;
        bayer[297] = 0;
        bayer[298] = 0;
        bayer[299] = 0;
        bayer[300] = 174;
        bayer[301] = 0;
        bayer[302] = 0;
        bayer[303] = 0;
        bayer[304] = 6;
        bayer[305] = 0;
        bayer[306] = 0;
        bayer[307] = 0;
        bayer[308] = 134;
        bayer[309] = 0;
        bayer[310] = 0;
        bayer[311] = 0;
        bayer[312] = 38;
        bayer[313] = 0;
        bayer[314] = 0;
        bayer[315] = 0;
        bayer[316] = 166;
        bayer[317] = 0;
        bayer[318] = 0;
        bayer[319] = 0;
        bayer[320] = 204;
        bayer[321] = 0;
        bayer[322] = 0;
        bayer[323] = 0;
        bayer[324] = 76;
        bayer[325] = 0;
        bayer[326] = 0;
        bayer[327] = 0;
        bayer[328] = 236;
        bayer[329] = 0;
        bayer[330] = 0;
        bayer[331] = 0;
        bayer[332] = 108;
        bayer[333] = 0;
        bayer[334] = 0;
        bayer[335] = 0;
        bayer[336] = 196;
        bayer[337] = 0;
        bayer[338] = 0;
        bayer[339] = 0;
        bayer[340] = 68;
        bayer[341] = 0;
        bayer[342] = 0;
        bayer[343] = 0;
        bayer[344] = 228;
        bayer[345] = 0;
        bayer[346] = 0;
        bayer[347] = 0;
        bayer[348] = 100;
        bayer[349] = 0;
        bayer[350] = 0;
        bayer[351] = 0;
        bayer[352] = 206;
        bayer[353] = 0;
        bayer[354] = 0;
        bayer[355] = 0;
        bayer[356] = 78;
        bayer[357] = 0;
        bayer[358] = 0;
        bayer[359] = 0;
        bayer[360] = 238;
        bayer[361] = 0;
        bayer[362] = 0;
        bayer[363] = 0;
        bayer[364] = 110;
        bayer[365] = 0;
        bayer[366] = 0;
        bayer[367] = 0;
        bayer[368] = 198;
        bayer[369] = 0;
        bayer[370] = 0;
        bayer[371] = 0;
        bayer[372] = 70;
        bayer[373] = 0;
        bayer[374] = 0;
        bayer[375] = 0;
        bayer[376] = 230;
        bayer[377] = 0;
        bayer[378] = 0;
        bayer[379] = 0;
        bayer[380] = 102;
        bayer[381] = 0;
        bayer[382] = 0;
        bayer[383] = 0;
        bayer[384] = 60;
        bayer[385] = 0;
        bayer[386] = 0;
        bayer[387] = 0;
        bayer[388] = 188;
        bayer[389] = 0;
        bayer[390] = 0;
        bayer[391] = 0;
        bayer[392] = 28;
        bayer[393] = 0;
        bayer[394] = 0;
        bayer[395] = 0;
        bayer[396] = 156;
        bayer[397] = 0;
        bayer[398] = 0;
        bayer[399] = 0;
        bayer[400] = 52;
        bayer[401] = 0;
        bayer[402] = 0;
        bayer[403] = 0;
        bayer[404] = 180;
        bayer[405] = 0;
        bayer[406] = 0;
        bayer[407] = 0;
        bayer[408] = 20;
        bayer[409] = 0;
        bayer[410] = 0;
        bayer[411] = 0;
        bayer[412] = 148;
        bayer[413] = 0;
        bayer[414] = 0;
        bayer[415] = 0;
        bayer[416] = 62;
        bayer[417] = 0;
        bayer[418] = 0;
        bayer[419] = 0;
        bayer[420] = 190;
        bayer[421] = 0;
        bayer[422] = 0;
        bayer[423] = 0;
        bayer[424] = 30;
        bayer[425] = 0;
        bayer[426] = 0;
        bayer[427] = 0;
        bayer[428] = 158;
        bayer[429] = 0;
        bayer[430] = 0;
        bayer[431] = 0;
        bayer[432] = 54;
        bayer[433] = 0;
        bayer[434] = 0;
        bayer[435] = 0;
        bayer[436] = 182;
        bayer[437] = 0;
        bayer[438] = 0;
        bayer[439] = 0;
        bayer[440] = 22;
        bayer[441] = 0;
        bayer[442] = 0;
        bayer[443] = 0;
        bayer[444] = 150;
        bayer[445] = 0;
        bayer[446] = 0;
        bayer[447] = 0;
        bayer[448] = 252;
        bayer[449] = 0;
        bayer[450] = 0;
        bayer[451] = 0;
        bayer[452] = 124;
        bayer[453] = 0;
        bayer[454] = 0;
        bayer[455] = 0;
        bayer[456] = 220;
        bayer[457] = 0;
        bayer[458] = 0;
        bayer[459] = 0;
        bayer[460] = 92;
        bayer[461] = 0;
        bayer[462] = 0;
        bayer[463] = 0;
        bayer[464] = 244;
        bayer[465] = 0;
        bayer[466] = 0;
        bayer[467] = 0;
        bayer[468] = 116;
        bayer[469] = 0;
        bayer[470] = 0;
        bayer[471] = 0;
        bayer[472] = 212;
        bayer[473] = 0;
        bayer[474] = 0;
        bayer[475] = 0;
        bayer[476] = 84;
        bayer[477] = 0;
        bayer[478] = 0;
        bayer[479] = 0;
        bayer[480] = 254;
        bayer[481] = 0;
        bayer[482] = 0;
        bayer[483] = 0;
        bayer[484] = 126;
        bayer[485] = 0;
        bayer[486] = 0;
        bayer[487] = 0;
        bayer[488] = 222;
        bayer[489] = 0;
        bayer[490] = 0;
        bayer[491] = 0;
        bayer[492] = 94;
        bayer[493] = 0;
        bayer[494] = 0;
        bayer[495] = 0;
        bayer[496] = 246;
        bayer[497] = 0;
        bayer[498] = 0;
        bayer[499] = 0;
        bayer[500] = 118;
        bayer[501] = 0;
        bayer[502] = 0;
        bayer[503] = 0;
        bayer[504] = 214;
        bayer[505] = 0;
        bayer[506] = 0;
        bayer[507] = 0;
        bayer[508] = 86;
        bayer[509] = 0;
        bayer[510] = 0;
        bayer[511] = 0;
        bayer[512] = 3;
        bayer[513] = 0;
        bayer[514] = 0;
        bayer[515] = 0;
        bayer[516] = 131;
        bayer[517] = 0;
        bayer[518] = 0;
        bayer[519] = 0;
        bayer[520] = 35;
        bayer[521] = 0;
        bayer[522] = 0;
        bayer[523] = 0;
        bayer[524] = 163;
        bayer[525] = 0;
        bayer[526] = 0;
        bayer[527] = 0;
        bayer[528] = 11;
        bayer[529] = 0;
        bayer[530] = 0;
        bayer[531] = 0;
        bayer[532] = 139;
        bayer[533] = 0;
        bayer[534] = 0;
        bayer[535] = 0;
        bayer[536] = 43;
        bayer[537] = 0;
        bayer[538] = 0;
        bayer[539] = 0;
        bayer[540] = 171;
        bayer[541] = 0;
        bayer[542] = 0;
        bayer[543] = 0;
        bayer[544] = 1;
        bayer[545] = 0;
        bayer[546] = 0;
        bayer[547] = 0;
        bayer[548] = 129;
        bayer[549] = 0;
        bayer[550] = 0;
        bayer[551] = 0;
        bayer[552] = 33;
        bayer[553] = 0;
        bayer[554] = 0;
        bayer[555] = 0;
        bayer[556] = 161;
        bayer[557] = 0;
        bayer[558] = 0;
        bayer[559] = 0;
        bayer[560] = 9;
        bayer[561] = 0;
        bayer[562] = 0;
        bayer[563] = 0;
        bayer[564] = 137;
        bayer[565] = 0;
        bayer[566] = 0;
        bayer[567] = 0;
        bayer[568] = 41;
        bayer[569] = 0;
        bayer[570] = 0;
        bayer[571] = 0;
        bayer[572] = 169;
        bayer[573] = 0;
        bayer[574] = 0;
        bayer[575] = 0;
        bayer[576] = 195;
        bayer[577] = 0;
        bayer[578] = 0;
        bayer[579] = 0;
        bayer[580] = 67;
        bayer[581] = 0;
        bayer[582] = 0;
        bayer[583] = 0;
        bayer[584] = 227;
        bayer[585] = 0;
        bayer[586] = 0;
        bayer[587] = 0;
        bayer[588] = 99;
        bayer[589] = 0;
        bayer[590] = 0;
        bayer[591] = 0;
        bayer[592] = 203;
        bayer[593] = 0;
        bayer[594] = 0;
        bayer[595] = 0;
        bayer[596] = 75;
        bayer[597] = 0;
        bayer[598] = 0;
        bayer[599] = 0;
        bayer[600] = 235;
        bayer[601] = 0;
        bayer[602] = 0;
        bayer[603] = 0;
        bayer[604] = 107;
        bayer[605] = 0;
        bayer[606] = 0;
        bayer[607] = 0;
        bayer[608] = 193;
        bayer[609] = 0;
        bayer[610] = 0;
        bayer[611] = 0;
        bayer[612] = 65;
        bayer[613] = 0;
        bayer[614] = 0;
        bayer[615] = 0;
        bayer[616] = 225;
        bayer[617] = 0;
        bayer[618] = 0;
        bayer[619] = 0;
        bayer[620] = 97;
        bayer[621] = 0;
        bayer[622] = 0;
        bayer[623] = 0;
        bayer[624] = 201;
        bayer[625] = 0;
        bayer[626] = 0;
        bayer[627] = 0;
        bayer[628] = 73;
        bayer[629] = 0;
        bayer[630] = 0;
        bayer[631] = 0;
        bayer[632] = 233;
        bayer[633] = 0;
        bayer[634] = 0;
        bayer[635] = 0;
        bayer[636] = 105;
        bayer[637] = 0;
        bayer[638] = 0;
        bayer[639] = 0;
        bayer[640] = 51;
        bayer[641] = 0;
        bayer[642] = 0;
        bayer[643] = 0;
        bayer[644] = 179;
        bayer[645] = 0;
        bayer[646] = 0;
        bayer[647] = 0;
        bayer[648] = 19;
        bayer[649] = 0;
        bayer[650] = 0;
        bayer[651] = 0;
        bayer[652] = 147;
        bayer[653] = 0;
        bayer[654] = 0;
        bayer[655] = 0;
        bayer[656] = 59;
        bayer[657] = 0;
        bayer[658] = 0;
        bayer[659] = 0;
        bayer[660] = 187;
        bayer[661] = 0;
        bayer[662] = 0;
        bayer[663] = 0;
        bayer[664] = 27;
        bayer[665] = 0;
        bayer[666] = 0;
        bayer[667] = 0;
        bayer[668] = 155;
        bayer[669] = 0;
        bayer[670] = 0;
        bayer[671] = 0;
        bayer[672] = 49;
        bayer[673] = 0;
        bayer[674] = 0;
        bayer[675] = 0;
        bayer[676] = 177;
        bayer[677] = 0;
        bayer[678] = 0;
        bayer[679] = 0;
        bayer[680] = 17;
        bayer[681] = 0;
        bayer[682] = 0;
        bayer[683] = 0;
        bayer[684] = 145;
        bayer[685] = 0;
        bayer[686] = 0;
        bayer[687] = 0;
        bayer[688] = 57;
        bayer[689] = 0;
        bayer[690] = 0;
        bayer[691] = 0;
        bayer[692] = 185;
        bayer[693] = 0;
        bayer[694] = 0;
        bayer[695] = 0;
        bayer[696] = 25;
        bayer[697] = 0;
        bayer[698] = 0;
        bayer[699] = 0;
        bayer[700] = 153;
        bayer[701] = 0;
        bayer[702] = 0;
        bayer[703] = 0;
        bayer[704] = 243;
        bayer[705] = 0;
        bayer[706] = 0;
        bayer[707] = 0;
        bayer[708] = 115;
        bayer[709] = 0;
        bayer[710] = 0;
        bayer[711] = 0;
        bayer[712] = 211;
        bayer[713] = 0;
        bayer[714] = 0;
        bayer[715] = 0;
        bayer[716] = 83;
        bayer[717] = 0;
        bayer[718] = 0;
        bayer[719] = 0;
        bayer[720] = 251;
        bayer[721] = 0;
        bayer[722] = 0;
        bayer[723] = 0;
        bayer[724] = 123;
        bayer[725] = 0;
        bayer[726] = 0;
        bayer[727] = 0;
        bayer[728] = 219;
        bayer[729] = 0;
        bayer[730] = 0;
        bayer[731] = 0;
        bayer[732] = 91;
        bayer[733] = 0;
        bayer[734] = 0;
        bayer[735] = 0;
        bayer[736] = 241;
        bayer[737] = 0;
        bayer[738] = 0;
        bayer[739] = 0;
        bayer[740] = 113;
        bayer[741] = 0;
        bayer[742] = 0;
        bayer[743] = 0;
        bayer[744] = 209;
        bayer[745] = 0;
        bayer[746] = 0;
        bayer[747] = 0;
        bayer[748] = 81;
        bayer[749] = 0;
        bayer[750] = 0;
        bayer[751] = 0;
        bayer[752] = 249;
        bayer[753] = 0;
        bayer[754] = 0;
        bayer[755] = 0;
        bayer[756] = 121;
        bayer[757] = 0;
        bayer[758] = 0;
        bayer[759] = 0;
        bayer[760] = 217;
        bayer[761] = 0;
        bayer[762] = 0;
        bayer[763] = 0;
        bayer[764] = 89;
        bayer[765] = 0;
        bayer[766] = 0;
        bayer[767] = 0;
        bayer[768] = 15;
        bayer[769] = 0;
        bayer[770] = 0;
        bayer[771] = 0;
        bayer[772] = 143;
        bayer[773] = 0;
        bayer[774] = 0;
        bayer[775] = 0;
        bayer[776] = 47;
        bayer[777] = 0;
        bayer[778] = 0;
        bayer[779] = 0;
        bayer[780] = 175;
        bayer[781] = 0;
        bayer[782] = 0;
        bayer[783] = 0;
        bayer[784] = 7;
        bayer[785] = 0;
        bayer[786] = 0;
        bayer[787] = 0;
        bayer[788] = 135;
        bayer[789] = 0;
        bayer[790] = 0;
        bayer[791] = 0;
        bayer[792] = 39;
        bayer[793] = 0;
        bayer[794] = 0;
        bayer[795] = 0;
        bayer[796] = 167;
        bayer[797] = 0;
        bayer[798] = 0;
        bayer[799] = 0;
        bayer[800] = 13;
        bayer[801] = 0;
        bayer[802] = 0;
        bayer[803] = 0;
        bayer[804] = 141;
        bayer[805] = 0;
        bayer[806] = 0;
        bayer[807] = 0;
        bayer[808] = 45;
        bayer[809] = 0;
        bayer[810] = 0;
        bayer[811] = 0;
        bayer[812] = 173;
        bayer[813] = 0;
        bayer[814] = 0;
        bayer[815] = 0;
        bayer[816] = 5;
        bayer[817] = 0;
        bayer[818] = 0;
        bayer[819] = 0;
        bayer[820] = 133;
        bayer[821] = 0;
        bayer[822] = 0;
        bayer[823] = 0;
        bayer[824] = 37;
        bayer[825] = 0;
        bayer[826] = 0;
        bayer[827] = 0;
        bayer[828] = 165;
        bayer[829] = 0;
        bayer[830] = 0;
        bayer[831] = 0;
        bayer[832] = 207;
        bayer[833] = 0;
        bayer[834] = 0;
        bayer[835] = 0;
        bayer[836] = 79;
        bayer[837] = 0;
        bayer[838] = 0;
        bayer[839] = 0;
        bayer[840] = 239;
        bayer[841] = 0;
        bayer[842] = 0;
        bayer[843] = 0;
        bayer[844] = 111;
        bayer[845] = 0;
        bayer[846] = 0;
        bayer[847] = 0;
        bayer[848] = 199;
        bayer[849] = 0;
        bayer[850] = 0;
        bayer[851] = 0;
        bayer[852] = 71;
        bayer[853] = 0;
        bayer[854] = 0;
        bayer[855] = 0;
        bayer[856] = 231;
        bayer[857] = 0;
        bayer[858] = 0;
        bayer[859] = 0;
        bayer[860] = 103;
        bayer[861] = 0;
        bayer[862] = 0;
        bayer[863] = 0;
        bayer[864] = 205;
        bayer[865] = 0;
        bayer[866] = 0;
        bayer[867] = 0;
        bayer[868] = 77;
        bayer[869] = 0;
        bayer[870] = 0;
        bayer[871] = 0;
        bayer[872] = 237;
        bayer[873] = 0;
        bayer[874] = 0;
        bayer[875] = 0;
        bayer[876] = 109;
        bayer[877] = 0;
        bayer[878] = 0;
        bayer[879] = 0;
        bayer[880] = 197;
        bayer[881] = 0;
        bayer[882] = 0;
        bayer[883] = 0;
        bayer[884] = 69;
        bayer[885] = 0;
        bayer[886] = 0;
        bayer[887] = 0;
        bayer[888] = 229;
        bayer[889] = 0;
        bayer[890] = 0;
        bayer[891] = 0;
        bayer[892] = 101;
        bayer[893] = 0;
        bayer[894] = 0;
        bayer[895] = 0;
        bayer[896] = 63;
        bayer[897] = 0;
        bayer[898] = 0;
        bayer[899] = 0;
        bayer[900] = 191;
        bayer[901] = 0;
        bayer[902] = 0;
        bayer[903] = 0;
        bayer[904] = 31;
        bayer[905] = 0;
        bayer[906] = 0;
        bayer[907] = 0;
        bayer[908] = 159;
        bayer[909] = 0;
        bayer[910] = 0;
        bayer[911] = 0;
        bayer[912] = 55;
        bayer[913] = 0;
        bayer[914] = 0;
        bayer[915] = 0;
        bayer[916] = 183;
        bayer[917] = 0;
        bayer[918] = 0;
        bayer[919] = 0;
        bayer[920] = 23;
        bayer[921] = 0;
        bayer[922] = 0;
        bayer[923] = 0;
        bayer[924] = 151;
        bayer[925] = 0;
        bayer[926] = 0;
        bayer[927] = 0;
        bayer[928] = 61;
        bayer[929] = 0;
        bayer[930] = 0;
        bayer[931] = 0;
        bayer[932] = 189;
        bayer[933] = 0;
        bayer[934] = 0;
        bayer[935] = 0;
        bayer[936] = 29;
        bayer[937] = 0;
        bayer[938] = 0;
        bayer[939] = 0;
        bayer[940] = 157;
        bayer[941] = 0;
        bayer[942] = 0;
        bayer[943] = 0;
        bayer[944] = 53;
        bayer[945] = 0;
        bayer[946] = 0;
        bayer[947] = 0;
        bayer[948] = 181;
        bayer[949] = 0;
        bayer[950] = 0;
        bayer[951] = 0;
        bayer[952] = 21;
        bayer[953] = 0;
        bayer[954] = 0;
        bayer[955] = 0;
        bayer[956] = 149;
        bayer[957] = 0;
        bayer[958] = 0;
        bayer[959] = 0;
        bayer[960] = 255;
        bayer[961] = 0;
        bayer[962] = 0;
        bayer[963] = 0;
        bayer[964] = 127;
        bayer[965] = 0;
        bayer[966] = 0;
        bayer[967] = 0;
        bayer[968] = 223;
        bayer[969] = 0;
        bayer[970] = 0;
        bayer[971] = 0;
        bayer[972] = 95;
        bayer[973] = 0;
        bayer[974] = 0;
        bayer[975] = 0;
        bayer[976] = 247;
        bayer[977] = 0;
        bayer[978] = 0;
        bayer[979] = 0;
        bayer[980] = 119;
        bayer[981] = 0;
        bayer[982] = 0;
        bayer[983] = 0;
        bayer[984] = 215;
        bayer[985] = 0;
        bayer[986] = 0;
        bayer[987] = 0;
        bayer[988] = 87;
        bayer[989] = 0;
        bayer[990] = 0;
        bayer[991] = 0;
        bayer[992] = 253;
        bayer[993] = 0;
        bayer[994] = 0;
        bayer[995] = 0;
        bayer[996] = 125;
        bayer[997] = 0;
        bayer[998] = 0;
        bayer[999] = 0;
        bayer[1000] = 221;
        bayer[1001] = 0;
        bayer[1002] = 0;
        bayer[1003] = 0;
        bayer[1004] = 93;
        bayer[1005] = 0;
        bayer[1006] = 0;
        bayer[1007] = 0;
        bayer[1008] = 245;
        bayer[1009] = 0;
        bayer[1010] = 0;
        bayer[1011] = 0;
        bayer[1012] = 117;
        bayer[1013] = 0;
        bayer[1014] = 0;
        bayer[1015] = 0;
        bayer[1016] = 213;
        bayer[1017] = 0;
        bayer[1018] = 0;
        bayer[1019] = 0;
        bayer[1020] = 85;
        bayer[1021] = 0;
        bayer[1022] = 0;
        bayer[1023] = 0;
        return bayer;
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
        
        return function(gl, tex, texWidth, texHeight, threshold, bayerTex, bayerArrayDimensions, dstX=0, dstY=0) {
         
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
          
          //set bayer texture dimensions
          gl.uniform1f(bayerTextureDimensionsLocation, bayerArrayDimensions);
          
          //set bayer matrix
        //   gl.uniform1fv(bayerMatrixLocation, bayerMatrix);
         
          // draw the quad (2 triangles, 6 vertices)
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        };
    }
    
    
    var thresholdVertexShaderText = document.getElementById('webgl-threshold-vertex-shader').textContent;
    var thresholdFragmentShaderText = document.getElementById('webgl-threshold-fragment-shader').textContent;
    var randomThresholdFragmentShaderText = document.getElementById('webgl-random-threshold-fragment-shader').textContent;
    var orderedDitherFragmentShaderText = document.getElementById('webgl-ordered-dither-fragment-shader').textContent;
    var drawImageThreshold;
    var drawImageRandomThreshold;
    var drawImageOrderedDither;
    
    function webGLThreshold(gl, imageData, threshold){
        //convert threshold to float
        threshold = threshold / 255.0;
        
        drawImageThreshold = drawImageThreshold || createDrawImageThreshold(gl);
        var texture = createAndLoadTexture(gl, imageData);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawImageThreshold(gl, texture, imageData.width, imageData.height, threshold);
    }
    
    function webGLRandomThreshold(gl, imageData, threshold){
        //convert threshold to float
        threshold = threshold / 255.0;
        
        drawImageRandomThreshold = drawImageRandomThreshold || createDrawImageRandomThreshold(gl);
        var texture = createAndLoadTexture(gl, imageData);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawImageRandomThreshold(gl, texture, imageData.width, imageData.height, threshold);
    }
    
    function webGLOrderedDither(gl, imageData, threshold, bayerArray, bayerArrayDimensions){
        //convert threshold to float
        threshold = threshold / 255.0;
        //4 UInts per pixel * 2 dimensions = 8
        
        drawImageOrderedDither = drawImageOrderedDither || createDrawImageOrderedDither(gl);
        var texture = createAndLoadTexture(gl, imageData);
        var bayerTexture = createAndLoadBayerTexture(gl, bayerArray, bayerArrayDimensions);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawImageOrderedDither(gl, texture, imageData.width, imageData.height, threshold, bayerTexture, bayerArrayDimensions);
    }
    
    
     function webGLOrderedDither2(gl, imageData, threshold){
        webGLOrderedDither(gl, imageData, threshold, createOrderedBayer2(), 2);
    }
    
    function webGLOrderedDither4(gl, imageData, threshold){
       webGLOrderedDither(gl, imageData, threshold, createOrderedBayer4(), 4);
    }
    
    function webGLOrderedDither8(gl, imageData, threshold){
       webGLOrderedDither(gl, imageData, threshold, createOrderedBayer8(), 8);
    }
    
    function webGLOrderedDither16(gl, imageData, threshold){
       webGLOrderedDither(gl, imageData, threshold, createOrderedBayer16(), 16);
    }
    
    
    
    
    return {
        createCanvas: createCanvas,
        threshold: webGLThreshold,
        randomThreshold: webGLRandomThreshold,
        orderedDither2: webGLOrderedDither2,
        orderedDither4: webGLOrderedDither4,
        orderedDither8: webGLOrderedDither8,
        orderedDither16: webGLOrderedDither16,
    };    
})();