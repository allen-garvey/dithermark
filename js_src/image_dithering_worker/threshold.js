App.Threshold = (function(Image, Pixel, PixelMath){
    
    function thresholdGenerator(thresholdFunc){
        return function(pixels, imageWidth, imageHeight, threshold, blackPixel, whitePixel){
            return Image.transform(pixels, imageWidth, imageHeight, (pixel, x, y)=>{
                var lightness = PixelMath.lightness(pixel);
                
                if(lightness > thresholdFunc(threshold, pixel, x, y)){
                    whitePixel[Pixel.A_INDEX] = pixel[Pixel.A_INDEX];
                    return whitePixel;
                }
                blackPixel[Pixel.A_INDEX] = pixel[Pixel.A_INDEX];
                return blackPixel;
                
            });
        };
    }
    //a_dither adapted from: http://pippin.gimp.org/a_dither/
    function aDitherXorFunc1(threshold, pixel, x, y){
        let mask = ((x ^ y * 149) * 1234& 511)/511.0;
        return threshold * mask;
    }
    
    function aDitherXorFunc2(threshold, pixel, x, y){
        function maskFunc(c){
            return (((x+c*17) ^ y * 149) * 1234 & 511)/511.0;
        }
        let mask = (maskFunc(0) + maskFunc(1) + maskFunc(2)) / 3;
        return threshold * mask;
    }
    
    function aDitherXorFunc3(threshold, pixel, x, y){
        function maskFunc(c){
            return (((x+c*17) ^ y * 149) * 1234 & 511)/511.0;
        }
        let mask = (maskFunc(pixel[0]) + maskFunc(pixel[1]) + maskFunc(pixel[2])) / 3;
        return threshold * mask;
    }
    
    function aDitherAddFunc1(threshold, pixel, x, y){
        let mask = ((x + y * 237) * 119 & 255)/255.0;
        return threshold * mask;
    }
    
    function aDitherAddFunc2(threshold, pixel, x, y){
        function maskFunc(c){
            return (((x+c*67) + y * 236) * 119 & 255)/255.0;
        }
        let mask = (maskFunc(0) + maskFunc(1) + maskFunc(2)) / 3;
        return threshold * mask;
    }
    
    function aDitherAddFunc3(threshold, pixel, x, y){
        function maskFunc(c){
            return (((x+c*67) + y * 236) * 119 & 255)/255.0;
        }
        let mask = (maskFunc(pixel[0]) + maskFunc(pixel[1]) + maskFunc(pixel[2])) / 3;
        return threshold * mask;
    }
    
    function randomThresholdFunc(threshold){ 
        return Math.ceil(Math.random() * threshold); 
    }
    
    return {
       image: thresholdGenerator((threshold)=>{ return threshold; }),
       aditherXor1: thresholdGenerator(aDitherXorFunc1),
       aditherXor2: thresholdGenerator(aDitherXorFunc2),
       aditherXor3: thresholdGenerator(aDitherXorFunc3),
       aditherAdd1: thresholdGenerator(aDitherAddFunc1),
       aditherAdd2: thresholdGenerator(aDitherAddFunc2),
       aditherAdd3: thresholdGenerator(aDitherAddFunc3),
       randomDither: thresholdGenerator(randomThresholdFunc),
    };
})(App.Image, App.Pixel, App.PixelMath);