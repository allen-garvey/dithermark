var App = App || {};

App.Threshold = (function(Image, Pixel){
    
    function thresholdTransformGenerator(thresholdFunc){
        return function(sourceContext, targetContext, imageWidth, imageHeight, threshold){
            Image.transform(sourceContext, targetContext, imageWidth, imageHeight, (pixel, x, y)=>{
                var lightness = Pixel.lightness(pixel);
                
                if(lightness > thresholdFunc(threshold)){
                    return Pixel.create(255, 255, 255, pixel.a);
                }
                return Pixel.create(0, 0, 0, pixel.a);
                
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