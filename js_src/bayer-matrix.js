
App.BayerMatrix = (function(){
    /* iterative version of recursive definition from
     * https://github.com/tromero/BayerMatrix/blob/master/MakeBayer.py
     * @param dimensions = power of 2, length of 1 side of the matrix
    */
    function createBayer(dimensions){
        const bayerBase = [0, 2, 3, 1];
        let arrayTotalLength = dimensions * dimensions;
        var bayerArray = new Array(arrayTotalLength);
        
        //copy base into bayer array
        for(let i=0;i<bayerBase.length;i++){
            bayerArray[i] = bayerBase[i];
        }
        if(dimensions === 2){
            return bayerArray;
        }
        
        let currentDimension = 2;
        let subarraySource = bayerBase.slice(0, bayerBase.length);
        
        while(currentDimension < dimensions){
            currentDimension *= 2;
            let subarrayLength = currentDimension * currentDimension;
            let newSubarraySource = new Array(subarrayLength);
            let sectionLength = subarrayLength / 4;
            
            for(let i=0;i<4;i++){
                let indexOffset = i * sectionLength;
                
                //create updated subarraySource
                for(let j=0;j<sectionLength;j++){
                    let destIndex = indexOffset + j;
                    newSubarraySource[destIndex] = (subarraySource[j] * 4) + bayerBase[i];
                }
            }
            subarraySource = newSubarraySource;
        }
        
        //now copy updated values to correct place in bayerArray
        //every 4 values in subarraySource is one 2x2 block in bayerArray
        let sourceIndex = 0;
        const BLOCK_DIMENSIONS = 2;
        let numBlocksInSection = subarraySource.length / 16;
        let sectionDimensions = Math.sqrt(numBlocksInSection);
        for(let i=0;i<4;i++){
            let yOffset = 0;
            if(i >= 2){
                yOffset = dimensions * dimensions / 2;
            }
            let xOffset = 0;
            if(i % 2 != 0){
                xOffset = dimensions / 2;
            }
            for(let y=0;y<sectionDimensions;y++){
                for(let x=0;x<sectionDimensions;x++){
                    let baseIndex = (y * BLOCK_DIMENSIONS * dimensions) + (x * BLOCK_DIMENSIONS) + yOffset + xOffset;
                    bayerArray[baseIndex] = subarraySource[sourceIndex];
                    bayerArray[baseIndex+1] = subarraySource[sourceIndex+1];
                    bayerArray[baseIndex+dimensions] = subarraySource[sourceIndex+2];
                    bayerArray[baseIndex+dimensions+1] = subarraySource[sourceIndex+3];
                    
                    sourceIndex += 4;
                }
            }
        }
        
        return bayerArray;
    }
    
    
    //Utility stuff
    
    //based on: https://stackoverflow.com/questions/41969562/how-can-i-flip-the-result-of-webglrenderingcontext-readpixels
    //pixels is a Uint8Array
    function reverseYAxis(pixels, width, height, bytesPerItem=4){
        var halfHeight = Math.floor(height / 2);
        var bytesPerRow = width * bytesPerItem;
        
        // make a temp buffer to hold one row
        var temp = new Uint8Array(width * bytesPerItem);
        for (var y = 0; y < halfHeight; ++y) {
          var topOffset = y * bytesPerRow;
          var bottomOffset = (height - y - 1) * bytesPerRow;
        
          // make copy of a row on the top half
          temp.set(pixels.subarray(topOffset, topOffset + bytesPerRow));
        
          // copy a row from the bottom half to the top
          pixels.copyWithin(topOffset, bottomOffset, bottomOffset + bytesPerRow);
        
          // copy the copy of the top half row to the bottom half 
          pixels.set(temp, bottomOffset);
        }
    }
    
    /*
    * Webgl Ordered dither matrix stuff
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
    
    
    function createBayerWebgl(dimensions){
        let ret;
        switch(dimensions){
            case 2:
                ret = createOrderedBayer2();
                break;
            case 4:
                ret = createOrderedBayer4();
                break;
            case 8:
                ret = createOrderedBayer8();
                break;
            default:
                ret = createOrderedBayer16();
                break;
        }
        reverseYAxis(ret, dimensions, dimensions);
        return ret;
    }
    
    
    
    
    
    return {
        reverseYAxis: reverseYAxis,
        create: createBayerWebgl,
    };
})();