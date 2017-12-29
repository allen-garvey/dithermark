App.Threshold = (function(Image, Pixel){
    
    function thresholdTransformGenerator(thresholdFunc){
        return function(pixels, imageWidth, imageHeight, threshold){
            return Image.transform(pixels, imageWidth, imageHeight, (pixel, x, y)=>{
                var lightness = Pixel.lightness(pixel);
                
                if(lightness > thresholdFunc(threshold)){
                    return Pixel.create(255, 255, 255, pixel[Pixel.A_INDEX]);
                }
                return Pixel.create(0, 0, 0, pixel[Pixel.A_INDEX]);
                
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