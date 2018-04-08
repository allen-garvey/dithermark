App.ErrorPropDither = (function(Image, Pixel, PixelMath){
    
    /*
    ** Error propagation matrix stuff
    */
    function createErrorMaxtrix(width, height){
        return {
            width: width,
            height: height,
            data: new Int16Array(width * height)
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
    
    function errorPropagationDither(pixels, imageWidth, imageHeight, threshold, blackPixel, whitePixel, errorPropagationFunc){
        var errorPropMatrix = createErrorMaxtrix(imageWidth, imageHeight);
        
        return Image.transform(pixels, imageWidth, imageHeight, (pixel, x, y)=>{
            var lightness = PixelMath.lightness(pixel);
            var adjustedLightness = lightness + errorMatrixValue(errorPropMatrix, x, y);
            if(adjustedLightness > 255){
                adjustedLightness = 255;
            }
            else if(adjustedLightness < 0){
                adjustedLightness = 0;
            }
            
            var ret;
            var currentError = 0;
            
            if(adjustedLightness > threshold){
                whitePixel[Pixel.A_INDEX] = pixel[Pixel.A_INDEX];
                ret = whitePixel;
                currentError = adjustedLightness - 255;
            }
            else{
                blackPixel[Pixel.A_INDEX] = pixel[Pixel.A_INDEX];
                ret = blackPixel;
                currentError = adjustedLightness;
            }
            
            errorPropagationFunc(errorPropMatrix, x, y, currentError);
            
            return ret;
            
        });
    }
    
    function createErrorPropagationDither(errorPropagationFunc){
        return (pixels, imageWidth, imageHeight, threshold, blackPixel, whitePixel)=>{
            return errorPropagationDither(pixels, imageWidth, imageHeight, threshold, blackPixel, whitePixel, errorPropagationFunc);
        };
    }
    
    function floydSteinbergPropagation(errorPropMatrix, x, y, currentError){
        var errorPart = currentError / 16.0;
        var error7 = Math.floor(errorPart * 7);
        var error5 = Math.floor(errorPart * 5);
        var error3 = Math.floor(errorPart * 3);
        var error1 = Math.floor(errorPart);
            
        errorMatrixIncrement(errorPropMatrix, x + 1, y, error7);
        errorMatrixIncrement(errorPropMatrix, x + 1, y + 1, error1);
        errorMatrixIncrement(errorPropMatrix, x, y + 1, error5);
        errorMatrixIncrement(errorPropMatrix, x - 1, y + 1, error3);
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
    
    function javisJudiceNinkePropagation(errorPropMatrix, x, y, currentError){
        var errorPart = currentError / 48.0;
        
        var error7 = Math.floor(errorPart * 7);
        var error5 = Math.floor(errorPart * 5);
        var error3 = Math.floor(errorPart * 3);
        var error1 = Math.floor(errorPart);
        
        errorMatrixIncrement(errorPropMatrix, x + 1, y, error7);
        errorMatrixIncrement(errorPropMatrix, x + 2, y, error5);
        
        errorMatrixIncrement(errorPropMatrix, x - 2, y + 1, error3);
        errorMatrixIncrement(errorPropMatrix, x - 1, y + 1, error5);
        errorMatrixIncrement(errorPropMatrix, x, y + 1, error7);
        errorMatrixIncrement(errorPropMatrix, x + 1, y + 1, error5);
        errorMatrixIncrement(errorPropMatrix, x + 2, y + 1, error3);
        
        errorMatrixIncrement(errorPropMatrix, x - 2, y + 2, error1);
        errorMatrixIncrement(errorPropMatrix, x - 1, y + 2, error3);
        errorMatrixIncrement(errorPropMatrix, x, y + 2, error5);
        errorMatrixIncrement(errorPropMatrix, x + 1, y + 2, error3);
        errorMatrixIncrement(errorPropMatrix, x + 2, y + 2, error1);
    }
    
    function stuckiPropagation(errorPropMatrix, x, y, currentError){
        var errorPart = currentError / 42.0;
        
        var error8 = Math.floor(errorPart * 8);
        var error4 = Math.floor(errorPart * 4);
        var error2 = Math.floor(errorPart * 2);
        var error1 = Math.floor(errorPart);
        
        errorMatrixIncrement(errorPropMatrix, x + 1, y, error8);
        errorMatrixIncrement(errorPropMatrix, x + 2, y, error4);
        
        errorMatrixIncrement(errorPropMatrix, x - 2, y + 1, error2);
        errorMatrixIncrement(errorPropMatrix, x - 1, y + 1, error4);
        errorMatrixIncrement(errorPropMatrix, x, y + 1, error8);
        errorMatrixIncrement(errorPropMatrix, x + 1, y + 1, error4);
        errorMatrixIncrement(errorPropMatrix, x + 2, y + 1, error2);
        
        errorMatrixIncrement(errorPropMatrix, x - 2, y + 2, error1);
        errorMatrixIncrement(errorPropMatrix, x - 1, y + 2, error2);
        errorMatrixIncrement(errorPropMatrix, x, y + 2, error4);
        errorMatrixIncrement(errorPropMatrix, x + 1, y + 2, error2);
        errorMatrixIncrement(errorPropMatrix, x + 2, y + 2, error1);
    }
    
    function burkesPropagation(errorPropMatrix, x, y, currentError){
        var errorPart = currentError / 32.0;
        
        var error8 = Math.floor(errorPart * 8);
        var error4 = Math.floor(errorPart * 4);
        var error2 = Math.floor(errorPart * 2);
        
        errorMatrixIncrement(errorPropMatrix, x + 1, y, error8);
        errorMatrixIncrement(errorPropMatrix, x + 2, y, error4);
        
        errorMatrixIncrement(errorPropMatrix, x - 2, y + 1, error2);
        errorMatrixIncrement(errorPropMatrix, x - 1, y + 1, error4);
        errorMatrixIncrement(errorPropMatrix, x, y + 1, error8);
        errorMatrixIncrement(errorPropMatrix, x + 1, y + 1, error4);
        errorMatrixIncrement(errorPropMatrix, x + 2, y + 1, error2);
    }
    
    function sierra3Propagation(errorPropMatrix, x, y, currentError){
        var errorPart = currentError / 32.0;
        
        var error5 = Math.floor(errorPart * 5);
        var error4 = Math.floor(errorPart * 4);
        var error3 = Math.floor(errorPart * 3);
        var error2 = Math.floor(errorPart * 2);
        
        errorMatrixIncrement(errorPropMatrix, x + 1, y, error5);
        errorMatrixIncrement(errorPropMatrix, x + 2, y, error3);
        
        errorMatrixIncrement(errorPropMatrix, x - 2, y + 1, error2);
        errorMatrixIncrement(errorPropMatrix, x - 1, y + 1, error4);
        errorMatrixIncrement(errorPropMatrix, x, y + 1, error5);
        errorMatrixIncrement(errorPropMatrix, x + 1, y + 1, error4);
        errorMatrixIncrement(errorPropMatrix, x + 2, y + 1, error2);
        
        errorMatrixIncrement(errorPropMatrix, x - 1, y + 2, error2);
        errorMatrixIncrement(errorPropMatrix, x, y + 2, error3);
        errorMatrixIncrement(errorPropMatrix, x + 1, y + 2, error2);
    }
    
    function sierra2Propagation(errorPropMatrix, x, y, currentError){
        var errorPart = currentError / 16.0;
        
        var error4 = Math.floor(errorPart * 4);
        var error3 = Math.floor(errorPart * 3);
        var error2 = Math.floor(errorPart * 2);
        var error1 = Math.floor(errorPart);
        
        errorMatrixIncrement(errorPropMatrix, x + 1, y, error4);
        errorMatrixIncrement(errorPropMatrix, x + 2, y, error3);
        
        errorMatrixIncrement(errorPropMatrix, x - 2, y + 1, error1);
        errorMatrixIncrement(errorPropMatrix, x - 1, y + 1, error2);
        errorMatrixIncrement(errorPropMatrix, x, y + 1, error3);
        errorMatrixIncrement(errorPropMatrix, x + 1, y + 1, error2);
        errorMatrixIncrement(errorPropMatrix, x + 2, y + 1, error1);
    
    
    }
    
        function sierra1Propagation(errorPropMatrix, x, y, currentError){
        var errorPart = currentError / 4.0;
        
        var error2 = Math.floor(errorPart * 2);
        var error1 = Math.floor(errorPart);
        
        errorMatrixIncrement(errorPropMatrix, x + 1, y, error2);
        
        errorMatrixIncrement(errorPropMatrix, x - 1, y + 1, error1);
        errorMatrixIncrement(errorPropMatrix, x, y + 1, error1);
    }
    
    function garveyPropagation(errorPropMatrix, x, y, currentError){
        var errorPart = Math.floor(currentError / 16.0);

        errorMatrixIncrement(errorPropMatrix, x + 1, y, (errorPart * 2));
        errorMatrixIncrement(errorPropMatrix, x + 2, y, (errorPart));

        errorMatrixIncrement(errorPropMatrix, x - 1, y + 1, (errorPart));
        errorMatrixIncrement(errorPropMatrix, x, y + 1, (errorPart * 2));
        errorMatrixIncrement(errorPropMatrix, x + 1, y + 1, (errorPart));

        errorMatrixIncrement(errorPropMatrix, x, y + 2, (errorPart));
    }
    
    
    return{
        floydSteinberg: createErrorPropagationDither(floydSteinbergPropagation),
        atkinson: createErrorPropagationDither(atkinsonPropagation),
        javisJudiceNinke: createErrorPropagationDither(javisJudiceNinkePropagation),
        stucki: createErrorPropagationDither(stuckiPropagation),
        burkes: createErrorPropagationDither(burkesPropagation),
        sierra3: createErrorPropagationDither(sierra3Propagation),
        sierra2: createErrorPropagationDither(sierra2Propagation),
        sierra1: createErrorPropagationDither(sierra1Propagation),
        garvey: createErrorPropagationDither(garveyPropagation),
    };
    
    
})(App.Image, App.Pixel, App.PixelMath);