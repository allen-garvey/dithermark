App.ErrorPropDither = (function(Image, Pixel){
    
    /*
    ** Error propagation matrix stuff
    */
    function createErrorMaxtrix(width, height){
        //needs to be multiplied by 2 because 16 bit ints take 2 bytes each
        var bufferDimensions = width * height * 2;
        var buffer = new ArrayBuffer(bufferDimensions);
        var bufferView = new Int16Array(buffer);
        
        return {
            width: width,
            height: height,
            data: bufferView
        };
    }
    
    function errorMatrixIndexFor(matrix, x, y){
        return (matrix.width * y) + x;
    }
    
    function errorMatrixIncrement(matrix, x, y, value){
        if(x >= matrix.width || y >= matrix.height){
            return;
        }
        var index = errorMatrixIndexFor(matrix, x, y);
        matrix.data[index] = matrix.data[index] + value;
    }
    
    function errorMatrixValue(matrix, x, y){
        if(x >= matrix.width || y >= matrix.height){
            return 0;
        }
        var index = errorMatrixIndexFor(matrix, x, y);
        return matrix.data[index];
    }
    
    
    /*
    ** Dithering algorithms
    */
    
    function errorPropagationDither(sourceContext, targetContext, imageWidth, imageHeight, threshold, errorPropagationFunc){
        var errorPropMatrix = createErrorMaxtrix(imageWidth, imageHeight);
        
        Image.transform(sourceContext, targetContext, imageWidth, imageHeight, (pixel, x, y)=>{
            var lightness = Pixel.lightness(pixel);
            var adjustedLightness = lightness + errorMatrixValue(errorPropMatrix, x, y);
            
            var ret;
            var currentError = 0;
            
            if(adjustedLightness > threshold){
                ret = Pixel.create(255, 255, 255, 255);
                currentError = -1 * (255 - lightness);
            }
            else{
                ret = Pixel.create(0, 0, 0, 255);
                currentError = lightness;
            }
            
            errorPropagationFunc(errorPropMatrix, x, y, currentError);
            
            return ret;
            
        });
    }
    
    function createErrorPropagationDither(errorPropagationFunc){
        return (sourceContext, targetContext, imageWidth, imageHeight, threshold)=>{
            errorPropagationDither(sourceContext, targetContext, imageWidth, imageHeight, threshold, errorPropagationFunc);
        };
    }
    
    function floydSteinbergPropagation(errorPropMatrix, x, y, currentError){
        var errorPart = currentError / 16.0;
            
        errorMatrixIncrement(errorPropMatrix, x + 1, y, Math.floor(errorPart * 7));
        errorMatrixIncrement(errorPropMatrix, x + 1, y + 1, Math.floor(errorPart));
        errorMatrixIncrement(errorPropMatrix, x, y + 1, Math.floor(errorPart * 5));
        errorMatrixIncrement(errorPropMatrix, x - 1, y + 1, Math.floor(errorPart * 3));
    }
    
    function atkinsonPropagation(errorPropMatrix, x, y, currentError){
        var errorPart = Math.floor(currentError / 8.0);

        errorMatrixIncrement(errorPropMatrix, x + 1, y, (errorPart));
        errorMatrixIncrement(errorPropMatrix, x + 2, y, (errorPart));

        errorMatrixIncrement(errorPropMatrix, x - 1, y + 1, (errorPart));
        errorMatrixIncrement(errorPropMatrix, x, y + 1, (errorPart));
        errorMatrixIncrement(errorPropMatrix, x + 1, y + 1, (errorPart));

        errorMatrixIncrement(errorPropMatrix, x, y + 2, (errorPart));

    }
    
    
    return{
        floydSteinberg: createErrorPropagationDither(floydSteinbergPropagation),
        atkinson: createErrorPropagationDither(atkinsonPropagation),
    };
    
    
})(App.Image, App.Pixel);