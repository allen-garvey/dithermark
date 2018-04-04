App.OrderedDither = (function(Image, Pixel, Bayer, PixelMath){
    
    function createMaxtrix(dimensions, data){
        return {
            dimensions: dimensions,
            data: data,
        };
    }
    
    function matrixIndexFor(matrix, x, y){
        return (matrix.dimensions * y) + x;
    }
    
    function matrixValue(matrix, x, y){
        if(x >= matrix.dimensions || y >= matrix.dimensions){
            return 0;
        }
        const index = matrixIndexFor(matrix, x, y);
        return matrix.data[index];
    }
    
    function normalizeOrderedMatrixValues(matrix, fullValue){
        const length = matrix.data.length;
        const fraction = Math.floor(fullValue / length);
        
        for(let i=0;i<length;i++){
            matrix.data[i] = matrix.data[i] * fraction;
        }
    }

    function createOrderedDitherBase(dimensions, matrixCreationFunc){
        let matrix = createMaxtrix(dimensions, matrixCreationFunc(dimensions));
        normalizeOrderedMatrixValues(matrix, 256);
        
        return function(pixels, imageWidth, imageHeight, threshold, blackPixel, whitePixel){
            const thresholdFraction = 255 / threshold;
            
            return Image.transform(pixels, imageWidth, imageHeight, (pixel, x, y)=>{
                const lightness = PixelMath.lightness(pixel);
                const matrixThreshold = matrixValue(matrix, x % matrix.dimensions, y % matrix.dimensions);
                
                if(lightness > (matrixThreshold * thresholdFraction)){
                    whitePixel[Pixel.A_INDEX] = pixel[Pixel.A_INDEX];
                    return whitePixel;
                }
                else{
                    blackPixel[Pixel.A_INDEX] = pixel[Pixel.A_INDEX];
                    return blackPixel;
                }
                
            });
        };
    }

    function orderedDitherBuilder(bayerFuncName){
        return function(dimensions){
            return createOrderedDitherBase(dimensions, Bayer[bayerFuncName]);
        };
    }


    /**
     * Color dither stuff
     */
    function convertBayerToFloat(bayerMatrix){
        const length = bayerMatrix.length;
        const highestValue = length;
        let floatData = new Float32Array(length);
        
        bayerMatrix.forEach((value, i)=>{
            floatData[i] = (value + 1) / highestValue;
        });
        return floatData;
    }

    function createColorOrderedDitherBase(dimensions, bayerCreationFunc){
        let matrix = createMaxtrix(dimensions, convertBayerToFloat(bayerCreationFunc(dimensions)));

        return (pixels, imageWidth, imageHeight, colorDitherModeId, colors)=>{
            return Image.colorDither(pixels, imageWidth, imageHeight, colorDitherModeId, colors, (closestColor, secondClosestColor, closestDistance, secondClosestDistance, x, y)=>{
                const matrixFraction = matrixValue(matrix, x % matrix.dimensions, y % matrix.dimensions);
                if(matrixFraction * secondClosestDistance < closestDistance){
                    return secondClosestColor;
                }
                return closestColor;
            });
        };
    }

    function colorOrderedDitherBuilder(bayerFuncName){
        return function(dimensions){
            return createColorOrderedDitherBase(dimensions, Bayer[bayerFuncName]);
        };
    }

    
    return {
        //bw dither
        createOrderedDither: orderedDitherBuilder('create'),
        createClusterOrderedDither: orderedDitherBuilder('createCluster'),
        createDotClusterOrderedDither: orderedDitherBuilder('createDotCluster'),
        createPatternOrderedDither: orderedDitherBuilder('createPattern'),
        createHalftoneDot: orderedDitherBuilder('createHalftoneDot'),
        //color dither
        createColorOrderedDither: colorOrderedDitherBuilder('create'),
        createColorClusterOrderedDither: colorOrderedDitherBuilder('createCluster'),
        createColorDotClusterOrderedDither: colorOrderedDitherBuilder('createDotCluster'),
        createColorPatternOrderedDither: colorOrderedDitherBuilder('createPattern'),
        createHalftoneDotColor: colorOrderedDitherBuilder('createHalftoneDot'),
    };
    
})(App.Image, App.Pixel, App.BayerMatrix, App.PixelMath);