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
        var index = matrixIndexFor(matrix, x, y);
        return matrix.data[index];
    }
    
    function normalizeOrderedMatrixValues(matrix, fullValue){
        var length = matrix.data.length;
        var fraction = Math.floor(fullValue / length);
        
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
    
    return {
        createOrderedDither: (dimensions)=> {return createOrderedDitherBase(dimensions, Bayer.create);},
        createClusterOrderedDither: (dimensions)=> {return createOrderedDitherBase(dimensions, Bayer.createCluster);},
        createDotClusterOrderedDither: (dimensions)=> {return createOrderedDitherBase(dimensions, Bayer.createDotCluster);},
    };
    
})(App.Image, App.Pixel, App.BayerMatrix, App.PixelMath);