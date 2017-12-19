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
    };
    
})(App.Image, App.Pixel);