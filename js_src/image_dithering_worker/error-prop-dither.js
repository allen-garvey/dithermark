App.ErrorPropDither = (function(Image, Pixel){
    
    /*
    ** Error propagation matrix stuff
    */
    function createErrorMaxtrix(width, height){
        //needs to be multiplied by 2 because 16 byte ints take 2 bytes each
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
    
    function propagateError(errorPropMatrix, x, y, rules, shouldSerpentine){
        let xMirror = 1;
        if(shouldSerpentine){
            xMirror = -1;
        }
        
        rules.forEach((rule)=>{
            errorMatrixIncrement(errorPropMatrix, (rule.x * xMirror) + x, y+rule.y, rule.error);
        });
    }
    
    /*
    ** Dithering algorithms
    */
    
    function errorPropagationDither(pixels, imageWidth, imageHeight, threshold, blackPixel, whitePixel, serpentineDither, errorPropagationFunc){
        //based on: https://stackoverflow.com/questions/6211613/testing-whether-a-value-is-odd-or-even
        function isOdd(n){
            return n & 1;
        }
        let errorPropMatrix = createErrorMaxtrix(imageWidth, imageHeight);
        
        let transformFunc = Image.transform;
        if(serpentineDither){
            transformFunc = Image.transformSerpentine;
        }
        
        return transformFunc(pixels, imageWidth, imageHeight, (pixel, x, y)=>{
            let shouldSerpentine = serpentineDither && isOdd(y);
            let lightness = Pixel.lightness(pixel);
            let adjustedLightness = lightness + errorMatrixValue(errorPropMatrix, x, y);
            
            let ret;
            let currentError = 0;
            
            if(adjustedLightness > threshold){
                whitePixel[Pixel.A_INDEX] = pixel[Pixel.A_INDEX];
                ret = whitePixel;
                currentError = -1 * (255 - lightness);
            }
            else{
                blackPixel[Pixel.A_INDEX] = pixel[Pixel.A_INDEX];
                ret = blackPixel;
                currentError = lightness;
            }
            
            errorPropagationFunc(errorPropMatrix, x, y, currentError, shouldSerpentine);
            
            return ret;
            
        });
    }
    
    function createErrorPropagationDither(errorPropagationFunc){
        return (pixels, imageWidth, imageHeight, threshold, blackPixel, whitePixel, serpentineDither)=>{
            return errorPropagationDither(pixels, imageWidth, imageHeight, threshold, blackPixel, whitePixel, serpentineDither, errorPropagationFunc);
        };
    }
    
    function floydSteinbergPropagation(errorPropMatrix, x, y, currentError, shouldSerpentine){
        var errorPart = currentError / 16.0;
        var error7 = Math.floor(errorPart * 7);
        var error5 = Math.floor(errorPart * 5);
        var error3 = Math.floor(errorPart * 3);
        var error1 = Math.floor(errorPart);
            
        // errorMatrixIncrement(errorPropMatrix, x + 1, y, error7);
        // errorMatrixIncrement(errorPropMatrix, x + 1, y + 1, error1);
        // errorMatrixIncrement(errorPropMatrix, x, y + 1, error5);
        // errorMatrixIncrement(errorPropMatrix, x - 1, y + 1, error3);
        
        let errorPropagationRules = [
            {x: 1, y: 0, error: error7},
            {x: 1, y: 1, error: error1},
            {x: 0, y: 1, error: error5},
            {x: -1, y: 1, error: error3},
        ];
        
        propagateError(errorPropMatrix, x, y, errorPropagationRules,  shouldSerpentine);
    }
    
    function atkinsonPropagation(errorPropMatrix, x, y, currentError, shouldSerpentine){
        var errorPart = Math.floor(currentError / 8.0);

        errorMatrixIncrement(errorPropMatrix, x + 1, y, (errorPart));
        errorMatrixIncrement(errorPropMatrix, x + 2, y, (errorPart));

        errorMatrixIncrement(errorPropMatrix, x - 1, y + 1, (errorPart));
        errorMatrixIncrement(errorPropMatrix, x, y + 1, (errorPart));
        errorMatrixIncrement(errorPropMatrix, x + 1, y + 1, (errorPart));

        errorMatrixIncrement(errorPropMatrix, x, y + 2, (errorPart));
    }
    
    function javisJudiceNinkePropagation(errorPropMatrix, x, y, currentError, shouldSerpentine){
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
    
    function stuckiPropagation(errorPropMatrix, x, y, currentError, shouldSerpentine){
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
    
    function burkesPropagation(errorPropMatrix, x, y, currentError, shouldSerpentine){
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
    
    function sierra3Propagation(errorPropMatrix, x, y, currentError, shouldSerpentine){
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
    
    function sierra2Propagation(errorPropMatrix, x, y, currentError, shouldSerpentine){
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
    
        function sierra1Propagation(errorPropMatrix, x, y, currentError, shouldSerpentine){
        var errorPart = currentError / 4.0;
        
        var error2 = Math.floor(errorPart * 2);
        var error1 = Math.floor(errorPart);
        
        errorMatrixIncrement(errorPropMatrix, x + 1, y, error2);
        
        errorMatrixIncrement(errorPropMatrix, x - 1, y + 1, error1);
        errorMatrixIncrement(errorPropMatrix, x, y + 1, error1);
    }
    
    function garveyPropagation(errorPropMatrix, x, y, currentError, shouldSerpentine){
        var errorPart = Math.floor(currentError / 16.0);

        // errorMatrixIncrement(errorPropMatrix, x + 1, y, (errorPart * 2));
        // errorMatrixIncrement(errorPropMatrix, x + 2, y, (errorPart));

        // errorMatrixIncrement(errorPropMatrix, x - 1, y + 1, (errorPart));
        // errorMatrixIncrement(errorPropMatrix, x, y + 1, (errorPart * 2));
        // errorMatrixIncrement(errorPropMatrix, x + 1, y + 1, (errorPart));

        // errorMatrixIncrement(errorPropMatrix, x, y + 2, (errorPart));
        
        let errorPropagationRules = [
            {x: 1, y: 0, error: (errorPart * 2)},
            {x: 2, y: 0, error: errorPart},
            {x: -1, y: 1, error: errorPart},
            {x: 0, y: 1, error: (errorPart * 2)},
            {x: 1, y: 1, error: errorPart},
            {x: 0, y: 2, error: errorPart},
        ];
        
        propagateError(errorPropMatrix, x, y, errorPropagationRules,  shouldSerpentine);
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
    
    
})(App.Image, App.Pixel);