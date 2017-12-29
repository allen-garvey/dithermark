App.Threshold = (function(Image, Pixel){
    
    function thresholdTransformGenerator(thresholdFunc){
        return function(pixels, imageWidth, imageHeight, threshold, blackPixel, whitePixel){
            return Image.transform(pixels, imageWidth, imageHeight, (pixel, x, y)=>{
                var lightness = Pixel.lightness(pixel);
                
                if(lightness > thresholdFunc(threshold)){
                    whitePixel[Pixel.A_INDEX] = pixel[Pixel.A_INDEX];
                    return whitePixel;
                }
                blackPixel[Pixel.A_INDEX] = pixel[Pixel.A_INDEX];
                return blackPixel;
                
            });
        };
    }
    
    function randomThresholdFunc(threshold){ 
        return Math.ceil(Math.random() * threshold); 
    }
    
    return {
       image: thresholdTransformGenerator(function(threshold){ return threshold; }),
       randomDither: thresholdTransformGenerator(randomThresholdFunc),
    };
})(App.Image, App.Pixel);