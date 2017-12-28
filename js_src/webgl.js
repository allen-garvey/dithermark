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
        if(!gl){
            console.log('WebGL not enabled!');
            return;
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
    * Ordered dither matrix stuff
    */
    
    function createOrderedBayer2(){
        var bayer = new Uint8Array(16);
        bayer[4] = 192;
        bayer[8] = 128;
        bayer[12] = 64;
        
        return bayer;
    }
    
    function createOrderedBayer4(){
        var bayer = new Uint8Array(64);
        bayer[0] = 0;
        bayer[4] = 128;
        bayer[8] = 32;
        bayer[12] = 160;
        bayer[16] = 192;
        bayer[20] = 64;
        bayer[24] = 224;
        bayer[28] = 96;
        bayer[32] = 48;
        bayer[36] = 176;
        bayer[40] = 16;
        bayer[44] = 144;
        bayer[48] = 240;
        bayer[52] = 112;
        bayer[56] = 208;
        bayer[60] = 80;
        
        return bayer;
    }
    
    function createOrderedBayer8(){
        var bayer = new Uint8Array(256);
        bayer[4] = 192;
        bayer[8] = 48;
        bayer[12] = 240;
        bayer[16] = 12;
        bayer[20] = 204;
        bayer[24] = 60;
        bayer[28] = 252;
        bayer[32] = 128;
        bayer[36] = 64;
        bayer[40] = 176;
        bayer[44] = 112;
        bayer[48] = 140;
        bayer[52] = 76;
        bayer[56] = 188;
        bayer[60] = 124;
        bayer[64] = 32;
        bayer[68] = 224;
        bayer[72] = 16;
        bayer[76] = 208;
        bayer[80] = 44;
        bayer[84] = 236;
        bayer[88] = 28;
        bayer[92] = 220;
        bayer[96] = 160;
        bayer[100] = 96;
        bayer[104] = 144;
        bayer[108] = 80;
        bayer[112] = 172;
        bayer[116] = 108;
        bayer[120] = 156;
        bayer[124] = 92;
        bayer[128] = 8;
        bayer[132] = 200;
        bayer[136] = 56;
        bayer[140] = 248;
        bayer[144] = 4;
        bayer[148] = 196;
        bayer[152] = 52;
        bayer[156] = 244;
        bayer[160] = 136;
        bayer[164] = 72;
        bayer[168] = 184;
        bayer[172] = 120;
        bayer[176] = 132;
        bayer[180] = 68;
        bayer[184] = 180;
        bayer[188] = 116;
        bayer[192] = 40;
        bayer[196] = 232;
        bayer[200] = 24;
        bayer[204] = 216;
        bayer[208] = 36;
        bayer[212] = 228;
        bayer[216] = 20;
        bayer[220] = 212;
        bayer[224] = 168;
        bayer[228] = 104;
        bayer[232] = 152;
        bayer[236] = 88;
        bayer[240] = 164;
        bayer[244] = 100;
        bayer[248] = 148;
        bayer[252] = 84
        
        return bayer;
    }
    
    function createOrderedBayer16(){
        var bayer = new Uint8Array(1024);
        bayer[4] = 128;
        bayer[8] = 32;
        bayer[12] = 160;
        bayer[16] = 8;
        bayer[20] = 136;
        bayer[24] = 40;
        bayer[28] = 168;
        bayer[32] = 2;
        bayer[36] = 130;
        bayer[40] = 34;
        bayer[44] = 162;
        bayer[48] = 10;
        bayer[52] = 138;
        bayer[56] = 42;
        bayer[60] = 170;
        bayer[64] = 192;
        bayer[68] = 64;
        bayer[72] = 224;
        bayer[76] = 96;
        bayer[80] = 200;
        bayer[84] = 72;
        bayer[88] = 232;
        bayer[92] = 104;
        bayer[96] = 194;
        bayer[100] = 66;
        bayer[104] = 226;
        bayer[108] = 98;
        bayer[112] = 202;
        bayer[116] = 74;
        bayer[120] = 234;
        bayer[124] = 106;
        bayer[128] = 48;
        bayer[132] = 176;
        bayer[136] = 16;
        bayer[140] = 144;
        bayer[144] = 56;
        bayer[148] = 184;
        bayer[152] = 24;
        bayer[156] = 152;
        bayer[160] = 50;
        bayer[164] = 178;
        bayer[168] = 18;
        bayer[172] = 146;
        bayer[176] = 58;
        bayer[180] = 186;
        bayer[184] = 26;
        bayer[188] = 154;
        bayer[192] = 240;
        bayer[196] = 112;
        bayer[200] = 208;
        bayer[204] = 80;
        bayer[208] = 248;
        bayer[212] = 120;
        bayer[216] = 216;
        bayer[220] = 88;
        bayer[224] = 242;
        bayer[228] = 114;
        bayer[232] = 210;
        bayer[236] = 82;
        bayer[240] = 250;
        bayer[244] = 122;
        bayer[248] = 218;
        bayer[252] = 90;
        bayer[256] = 12;
        bayer[260] = 140;
        bayer[264] = 44;
        bayer[268] = 172;
        bayer[272] = 4;
        bayer[276] = 132;
        bayer[280] = 36;
        bayer[284] = 164;
        bayer[288] = 14;
        bayer[292] = 142;
        bayer[296] = 46;
        bayer[300] = 174;
        bayer[304] = 6;
        bayer[308] = 134;
        bayer[312] = 38;
        bayer[316] = 166;
        bayer[320] = 204;
        bayer[324] = 76;
        bayer[328] = 236;
        bayer[332] = 108;
        bayer[336] = 196;
        bayer[340] = 68;
        bayer[344] = 228;
        bayer[348] = 100;
        bayer[352] = 206;
        bayer[356] = 78;
        bayer[360] = 238;
        bayer[364] = 110;
        bayer[368] = 198;
        bayer[372] = 70;
        bayer[376] = 230;
        bayer[380] = 102;
        bayer[384] = 60;
        bayer[388] = 188;
        bayer[392] = 28;
        bayer[396] = 156;
        bayer[400] = 52;
        bayer[404] = 180;
        bayer[408] = 20;
        bayer[412] = 148;
        bayer[416] = 62;
        bayer[420] = 190;
        bayer[424] = 30;
        bayer[428] = 158;
        bayer[432] = 54;
        bayer[436] = 182;
        bayer[440] = 22;
        bayer[444] = 150;
        bayer[448] = 252;
        bayer[452] = 124;
        bayer[456] = 220;
        bayer[460] = 92;
        bayer[464] = 244;
        bayer[468] = 116;
        bayer[472] = 212;
        bayer[476] = 84;
        bayer[480] = 254;
        bayer[484] = 126;
        bayer[488] = 222;
        bayer[492] = 94;
        bayer[496] = 246;
        bayer[500] = 118;
        bayer[504] = 214;
        bayer[508] = 86;
        bayer[512] = 3;
        bayer[516] = 131;
        bayer[520] = 35;
        bayer[524] = 163;
        bayer[528] = 11;
        bayer[532] = 139;
        bayer[536] = 43;
        bayer[540] = 171;
        bayer[544] = 1;
        bayer[548] = 129;
        bayer[552] = 33;
        bayer[556] = 161;
        bayer[560] = 9;
        bayer[564] = 137;
        bayer[568] = 41;
        bayer[572] = 169;
        bayer[576] = 195;
        bayer[580] = 67;
        bayer[584] = 227;
        bayer[588] = 99;
        bayer[592] = 203;
        bayer[596] = 75;
        bayer[600] = 235;
        bayer[604] = 107;
        bayer[608] = 193;
        bayer[612] = 65;
        bayer[616] = 225;
        bayer[620] = 97;
        bayer[624] = 201;
        bayer[628] = 73;
        bayer[632] = 233;
        bayer[636] = 105;
        bayer[640] = 51;
        bayer[644] = 179;
        bayer[648] = 19;
        bayer[652] = 147;
        bayer[656] = 59;
        bayer[660] = 187;
        bayer[664] = 27;
        bayer[668] = 155;
        bayer[672] = 49;
        bayer[676] = 177;
        bayer[680] = 17;
        bayer[684] = 145;
        bayer[688] = 57;
        bayer[692] = 185;
        bayer[696] = 25;
        bayer[700] = 153;
        bayer[704] = 243;
        bayer[708] = 115;
        bayer[712] = 211;
        bayer[716] = 83;
        bayer[720] = 251;
        bayer[724] = 123;
        bayer[728] = 219;
        bayer[732] = 91;
        bayer[736] = 241;
        bayer[740] = 113;
        bayer[744] = 209;
        bayer[748] = 81;
        bayer[752] = 249;
        bayer[756] = 121;
        bayer[760] = 217;
        bayer[764] = 89;
        bayer[768] = 15;
        bayer[772] = 143;
        bayer[776] = 47;
        bayer[780] = 175;
        bayer[784] = 7;
        bayer[788] = 135;
        bayer[792] = 39;
        bayer[796] = 167;
        bayer[800] = 13;
        bayer[804] = 141;
        bayer[808] = 45;
        bayer[812] = 173;
        bayer[816] = 5;
        bayer[820] = 133;
        bayer[824] = 37;
        bayer[828] = 165;
        bayer[832] = 207;
        bayer[836] = 79;
        bayer[840] = 239;
        bayer[844] = 111;
        bayer[848] = 199;
        bayer[852] = 71;
        bayer[856] = 231;
        bayer[860] = 103;
        bayer[864] = 205;
        bayer[868] = 77;
        bayer[872] = 237;
        bayer[876] = 109;
        bayer[880] = 197;
        bayer[884] = 69;
        bayer[888] = 229;
        bayer[892] = 101;
        bayer[896] = 63;
        bayer[900] = 191;
        bayer[904] = 31;
        bayer[908] = 159;
        bayer[912] = 55;
        bayer[916] = 183;
        bayer[920] = 23;
        bayer[924] = 151;
        bayer[928] = 61;
        bayer[932] = 189;
        bayer[936] = 29;
        bayer[940] = 157;
        bayer[944] = 53;
        bayer[948] = 181;
        bayer[952] = 21;
        bayer[956] = 149;
        bayer[960] = 255;
        bayer[964] = 127;
        bayer[968] = 223;
        bayer[972] = 95;
        bayer[976] = 247;
        bayer[980] = 119;
        bayer[984] = 215;
        bayer[988] = 87;
        bayer[992] = 253;
        bayer[996] = 125;
        bayer[1000] = 221;
        bayer[1004] = 93;
        bayer[1008] = 245;
        bayer[1012] = 117;
        bayer[1016] = 213;
        bayer[1020] = 85;
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
    
    
    // console.log(Bayer.create(16));
    
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