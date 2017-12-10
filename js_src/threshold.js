var App = App || {};

App.Threshold = (function(Image, Pixel){
    
    function thresholdImage(sourceContext, targetContext, imageWidth, imageHeight, threshold){
        Image.transform(sourceContext, targetContext, imageWidth, imageHeight, (pixel, x, y)=>{
            var lightness = Pixel.lightness(pixel);
            
            if(lightness > threshold){
                return Pixel.create(255, 255, 255, 255);
            }
            return Pixel.create(0, 0, 0, 255);
            
        });
    }    
    
    return {
       image: thresholdImage
    };
})(App.Image, App.Pixel);