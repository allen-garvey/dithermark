App.OrderedDither = (function(Image, Pixel){
    
    function createMaxtrix(width, height, maxValue){
        var bufferDimensions = width * height;
        if(maxValue > 255){
            //needs to be multiplied by 2 because 16 byte ints take 2 bytes each
            bufferDimensions = bufferDimensions * 2;
        }
        var buffer = new ArrayBuffer(bufferDimensions);
        var bufferView;
        if(maxValue > 255){
            bufferView = new Uint16Array(buffer);
        }
        else{
            bufferView = new Uint8Array(buffer);
        }
        
        return {
            width: width,
            height: height,
            maxValue: maxValue,
            data: bufferView
        };
    }
    
    function matrixIndexFor(matrix, x, y){
        return (matrix.width * y) + x;
    }
    
    function matrixValue(matrix, x, y){
        if(x >= matrix.width || y >= matrix.height){
            return 0;
        }
        var index = matrixIndexFor(matrix, x, y);
        return matrix.data[index];
    }
    
    function normalizeOrderedMatrixValues(matrix, fullValue){
        var dimensions = matrix.width * matrix.height;
        var fraction = Math.floor(fullValue / dimensions);
        
        for(let i=0;i<dimensions;i++){
            matrix.data[i] = matrix.data[i] * fraction;
        }
    }
    
    function createOrderedMatrix2(maxValue){
        var matrix = createMaxtrix(2, 2, maxValue);
        matrix.data[0] = 0;
        matrix.data[1] = 2;
        matrix.data[2] = 3;
        matrix.data[3] = 1;
        return matrix;
    }
    

    function createOrderedMatrix4(maxValue){
        var matrix = createMaxtrix(4, 4, maxValue);
        matrix.data[0] = 0;
        matrix.data[1] = 8;
        matrix.data[2] = 2;
        matrix.data[3] = 10;
        matrix.data[4] = 12;
        matrix.data[5] = 4;
        matrix.data[6] = 14;
        matrix.data[7] = 6;
        matrix.data[8] = 3;
        matrix.data[9] = 11;
        matrix.data[10] = 1;
        matrix.data[11] = 9;
        matrix.data[12] = 15;
        matrix.data[13] = 7;
        matrix.data[14] = 13;
        matrix.data[15] = 5;
        return matrix;
    }
    
    function createOrderedMatrix8(maxValue){
        var matrix = createMaxtrix(8, 8, maxValue);
        matrix.data[0] = 0;
        matrix.data[1] = 48;
        matrix.data[2] = 12;
        matrix.data[3] = 60;
        matrix.data[4] = 3;
        matrix.data[5] = 51;
        matrix.data[6] = 15;
        matrix.data[7] = 63;
        matrix.data[8] = 32;
        matrix.data[9] = 16;
        matrix.data[10] = 44;
        matrix.data[11] = 28;
        matrix.data[12] = 35;
        matrix.data[13] = 19;
        matrix.data[14] = 47;
        matrix.data[15] = 31;
        matrix.data[16] = 8;
        matrix.data[17] = 56;
        matrix.data[18] = 4;
        matrix.data[19] = 52;
        matrix.data[20] = 11;
        matrix.data[21] = 59;
        matrix.data[22] = 7;
        matrix.data[23] = 55;
        matrix.data[24] = 40;
        matrix.data[25] = 24;
        matrix.data[26] = 36;
        matrix.data[27] = 20;
        matrix.data[28] = 43;
        matrix.data[29] = 27;
        matrix.data[30] = 39;
        matrix.data[31] = 23;
        matrix.data[32] = 2;
        matrix.data[33] = 50;
        matrix.data[34] = 14;
        matrix.data[35] = 62;
        matrix.data[36] = 1;
        matrix.data[37] = 49;
        matrix.data[38] = 13;
        matrix.data[39] = 61;
        matrix.data[40] = 34;
        matrix.data[41] = 18;
        matrix.data[42] = 46;
        matrix.data[43] = 30;
        matrix.data[44] = 33;
        matrix.data[45] = 17;
        matrix.data[46] = 45;
        matrix.data[47] = 29;
        matrix.data[48] = 10;
        matrix.data[49] = 58;
        matrix.data[50] = 6;
        matrix.data[51] = 54;
        matrix.data[52] = 9;
        matrix.data[53] = 57;
        matrix.data[54] = 5;
        matrix.data[55] = 53;
        matrix.data[56] = 42;
        matrix.data[57] = 26;
        matrix.data[58] = 38;
        matrix.data[59] = 22;
        matrix.data[60] = 41;
        matrix.data[61] = 25;
        matrix.data[62] = 37;
        matrix.data[63] = 21;
        return matrix;
    }
    
    function createOrderedMatrix16(maxValue){
        var matrix = createMaxtrix(16, 16, maxValue);
        matrix.data[0] = 0;
        matrix.data[1] = 128;
        matrix.data[2] = 32;
        matrix.data[3] = 160;
        matrix.data[4] = 8;
        matrix.data[5] = 136;
        matrix.data[6] = 40;
        matrix.data[7] = 168;
        matrix.data[8] = 2;
        matrix.data[9] = 130;
        matrix.data[10] = 34;
        matrix.data[11] = 162;
        matrix.data[12] = 10;
        matrix.data[13] = 138;
        matrix.data[14] = 42;
        matrix.data[15] = 170;
        matrix.data[16] = 192;
        matrix.data[17] = 64;
        matrix.data[18] = 224;
        matrix.data[19] = 96;
        matrix.data[20] = 200;
        matrix.data[21] = 72;
        matrix.data[22] = 232;
        matrix.data[23] = 104;
        matrix.data[24] = 194;
        matrix.data[25] = 66;
        matrix.data[26] = 226;
        matrix.data[27] = 98;
        matrix.data[28] = 202;
        matrix.data[29] = 74;
        matrix.data[30] = 234;
        matrix.data[31] = 106;
        matrix.data[32] = 48;
        matrix.data[33] = 176;
        matrix.data[34] = 16;
        matrix.data[35] = 144;
        matrix.data[36] = 56;
        matrix.data[37] = 184;
        matrix.data[38] = 24;
        matrix.data[39] = 152;
        matrix.data[40] = 50;
        matrix.data[41] = 178;
        matrix.data[42] = 18;
        matrix.data[43] = 146;
        matrix.data[44] = 58;
        matrix.data[45] = 186;
        matrix.data[46] = 26;
        matrix.data[47] = 154;
        matrix.data[48] = 240;
        matrix.data[49] = 112;
        matrix.data[50] = 208;
        matrix.data[51] = 80;
        matrix.data[52] = 248;
        matrix.data[53] = 120;
        matrix.data[54] = 216;
        matrix.data[55] = 88;
        matrix.data[56] = 242;
        matrix.data[57] = 114;
        matrix.data[58] = 210;
        matrix.data[59] = 82;
        matrix.data[60] = 250;
        matrix.data[61] = 122;
        matrix.data[62] = 218;
        matrix.data[63] = 90;
        matrix.data[64] = 12;
        matrix.data[65] = 140;
        matrix.data[66] = 44;
        matrix.data[67] = 172;
        matrix.data[68] = 4;
        matrix.data[69] = 132;
        matrix.data[70] = 36;
        matrix.data[71] = 164;
        matrix.data[72] = 14;
        matrix.data[73] = 142;
        matrix.data[74] = 46;
        matrix.data[75] = 174;
        matrix.data[76] = 6;
        matrix.data[77] = 134;
        matrix.data[78] = 38;
        matrix.data[79] = 166;
        matrix.data[80] = 204;
        matrix.data[81] = 76;
        matrix.data[82] = 236;
        matrix.data[83] = 108;
        matrix.data[84] = 196;
        matrix.data[85] = 68;
        matrix.data[86] = 228;
        matrix.data[87] = 100;
        matrix.data[88] = 206;
        matrix.data[89] = 78;
        matrix.data[90] = 238;
        matrix.data[91] = 110;
        matrix.data[92] = 198;
        matrix.data[93] = 70;
        matrix.data[94] = 230;
        matrix.data[95] = 102;
        matrix.data[96] = 60;
        matrix.data[97] = 188;
        matrix.data[98] = 28;
        matrix.data[99] = 156;
        matrix.data[100] = 52;
        matrix.data[101] = 180;
        matrix.data[102] = 20;
        matrix.data[103] = 148;
        matrix.data[104] = 62;
        matrix.data[105] = 190;
        matrix.data[106] = 30;
        matrix.data[107] = 158;
        matrix.data[108] = 54;
        matrix.data[109] = 182;
        matrix.data[110] = 22;
        matrix.data[111] = 150;
        matrix.data[112] = 252;
        matrix.data[113] = 124;
        matrix.data[114] = 220;
        matrix.data[115] = 92;
        matrix.data[116] = 244;
        matrix.data[117] = 116;
        matrix.data[118] = 212;
        matrix.data[119] = 84;
        matrix.data[120] = 254;
        matrix.data[121] = 126;
        matrix.data[122] = 222;
        matrix.data[123] = 94;
        matrix.data[124] = 246;
        matrix.data[125] = 118;
        matrix.data[126] = 214;
        matrix.data[127] = 86;
        matrix.data[128] = 3;
        matrix.data[129] = 131;
        matrix.data[130] = 35;
        matrix.data[131] = 163;
        matrix.data[132] = 11;
        matrix.data[133] = 139;
        matrix.data[134] = 43;
        matrix.data[135] = 171;
        matrix.data[136] = 1;
        matrix.data[137] = 129;
        matrix.data[138] = 33;
        matrix.data[139] = 161;
        matrix.data[140] = 9;
        matrix.data[141] = 137;
        matrix.data[142] = 41;
        matrix.data[143] = 169;
        matrix.data[144] = 195;
        matrix.data[145] = 67;
        matrix.data[146] = 227;
        matrix.data[147] = 99;
        matrix.data[148] = 203;
        matrix.data[149] = 75;
        matrix.data[150] = 235;
        matrix.data[151] = 107;
        matrix.data[152] = 193;
        matrix.data[153] = 65;
        matrix.data[154] = 225;
        matrix.data[155] = 97;
        matrix.data[156] = 201;
        matrix.data[157] = 73;
        matrix.data[158] = 233;
        matrix.data[159] = 105;
        matrix.data[160] = 51;
        matrix.data[161] = 179;
        matrix.data[162] = 19;
        matrix.data[163] = 147;
        matrix.data[164] = 59;
        matrix.data[165] = 187;
        matrix.data[166] = 27;
        matrix.data[167] = 155;
        matrix.data[168] = 49;
        matrix.data[169] = 177;
        matrix.data[170] = 17;
        matrix.data[171] = 145;
        matrix.data[172] = 57;
        matrix.data[173] = 185;
        matrix.data[174] = 25;
        matrix.data[175] = 153;
        matrix.data[176] = 243;
        matrix.data[177] = 115;
        matrix.data[178] = 211;
        matrix.data[179] = 83;
        matrix.data[180] = 251;
        matrix.data[181] = 123;
        matrix.data[182] = 219;
        matrix.data[183] = 91;
        matrix.data[184] = 241;
        matrix.data[185] = 113;
        matrix.data[186] = 209;
        matrix.data[187] = 81;
        matrix.data[188] = 249;
        matrix.data[189] = 121;
        matrix.data[190] = 217;
        matrix.data[191] = 89;
        matrix.data[192] = 15;
        matrix.data[193] = 143;
        matrix.data[194] = 47;
        matrix.data[195] = 175;
        matrix.data[196] = 7;
        matrix.data[197] = 135;
        matrix.data[198] = 39;
        matrix.data[199] = 167;
        matrix.data[200] = 13;
        matrix.data[201] = 141;
        matrix.data[202] = 45;
        matrix.data[203] = 173;
        matrix.data[204] = 5;
        matrix.data[205] = 133;
        matrix.data[206] = 37;
        matrix.data[207] = 165;
        matrix.data[208] = 207;
        matrix.data[209] = 79;
        matrix.data[210] = 239;
        matrix.data[211] = 111;
        matrix.data[212] = 199;
        matrix.data[213] = 71;
        matrix.data[214] = 231;
        matrix.data[215] = 103;
        matrix.data[216] = 205;
        matrix.data[217] = 77;
        matrix.data[218] = 237;
        matrix.data[219] = 109;
        matrix.data[220] = 197;
        matrix.data[221] = 69;
        matrix.data[222] = 229;
        matrix.data[223] = 101;
        matrix.data[224] = 63;
        matrix.data[225] = 191;
        matrix.data[226] = 31;
        matrix.data[227] = 159;
        matrix.data[228] = 55;
        matrix.data[229] = 183;
        matrix.data[230] = 23;
        matrix.data[231] = 151;
        matrix.data[232] = 61;
        matrix.data[233] = 189;
        matrix.data[234] = 29;
        matrix.data[235] = 157;
        matrix.data[236] = 53;
        matrix.data[237] = 181;
        matrix.data[238] = 21;
        matrix.data[239] = 149;
        matrix.data[240] = 255;
        matrix.data[241] = 127;
        matrix.data[242] = 223;
        matrix.data[243] = 95;
        matrix.data[244] = 247;
        matrix.data[245] = 119;
        matrix.data[246] = 215;
        matrix.data[247] = 87;
        matrix.data[248] = 253;
        matrix.data[249] = 125;
        matrix.data[250] = 221;
        matrix.data[251] = 93;
        matrix.data[252] = 245;
        matrix.data[253] = 117;
        matrix.data[254] = 213;
        matrix.data[255] = 85;
        return matrix;
    }
    
    function createOrderedDither(matrixCreationFunc){
        return function(sourceContext, targetContext, imageWidth, imageHeight, threshold){
            var matrix = matrixCreationFunc(255);
            normalizeOrderedMatrixValues(matrix, 256);
            var thresholdFraction = 255 / threshold;
            
            Image.transform(sourceContext, targetContext, imageWidth, imageHeight, (pixel, x, y)=>{
                var lightness = Pixel.lightness(pixel);
                var matrixThreshold = matrixValue(matrix, x % matrix.width, y % matrix.height);
                var ret;
                
                if(lightness > (matrixThreshold * thresholdFraction)){
                    ret = Pixel.create(255, 255, 255, pixel.a);
                }
                else{
                    ret = Pixel.create(0, 0, 0, pixel.a);
                }
                
                return ret;
                
            });
        };
    }
    
    return {
        dither2: createOrderedDither(createOrderedMatrix2),
        dither4: createOrderedDither(createOrderedMatrix4),
        dither8: createOrderedDither(createOrderedMatrix8),
        dither16: createOrderedDither(createOrderedMatrix16),
    };
    
})(App.Image, App.Pixel);