App.OrderedDither = (function(Image, Pixel, Bayer, PixelMath){
    
    function createMaxtrix(dimensions){
        return {
            dimensions: dimensions,
            data: Bayer.create(dimensions),
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
    
    function createOrderedDither(dimensions){
        var matrix = createMaxtrix(dimensions);
        normalizeOrderedMatrixValues(matrix, 256);
        
        return function(pixels, imageWidth, imageHeight, threshold, blackPixel, whitePixel){
            var thresholdFraction = 255 / threshold;
            
            return Image.transform(pixels, imageWidth, imageHeight, (pixel, x, y)=>{
                var lightness = PixelMath.lightness(pixel);
                var matrixThreshold = matrixValue(matrix, x % matrix.dimensions, y % matrix.dimensions);
                
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
        createOrderedDither: createOrderedDither,
    };
    
})(App.Image, App.Pixel, App.BayerMatrix, App.PixelMath);