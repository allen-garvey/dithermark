App.Threshold = (function(Image, Pixel, PixelMath){
    
    /**
    * BW Dither stuff
    */
    function thresholdGenerator(thresholdFunc){
        return function(pixels, imageWidth, imageHeight, threshold, blackPixel, whitePixel){
            return Image.transform(pixels, imageWidth, imageHeight, (pixel, x, y)=>{
                var lightness = PixelMath.lightness(pixel);
                
                if(lightness > thresholdFunc(threshold, x, y, pixel)){
                    whitePixel[Pixel.A_INDEX] = pixel[Pixel.A_INDEX];
                    return whitePixel;
                }
                blackPixel[Pixel.A_INDEX] = pixel[Pixel.A_INDEX];
                return blackPixel;
                
            });
        };
    }
    //a_dither adapted from: http://pippin.gimp.org/a_dither/
    function aDitherMask1(x, y){
        return ((x ^ (y * 149)) * 1234 & 511) / 511.0;
    }
    
    function aDitherMask2(x, y, c){
        return (((x + (c * 17)) ^ y * 149) * 1234 & 511) / 511.0;
    }
    
    function aDitherMask3(x, y){
        return ((x + (y * 237)) * 119 & 255) / 255.0;
    }
    
    function aDitherMask4(x, y, c){
            return (((x + (c * 67)) + (y * 236)) * 119 & 255) / 255.0;
        }
    
    function aDitherXorFunc1(threshold, x, y){
        return threshold * aDitherMask1(x, y);
    }
    
    function aDitherXorFunc2(threshold, x, y){
        let mask = (aDitherMask2(x, y, 0) + aDitherMask2(x, y, 1) + aDitherMask2(x, y, 2)) / 3;
        return threshold * mask;
    }
    
    function aDitherXorFunc3(threshold, x, y, pixel){
        let mask = (aDitherMask2(x, y, pixel[0]) + aDitherMask2(x, y, pixel[1]) + aDitherMask2(x, y, pixel[2])) / 3;
        return threshold * mask;
    }
    
    function aDitherAddFunc1(threshold, x, y){
        return threshold * aDitherMask3(x, y);
    }
    
    function aDitherAddFunc2(threshold, x, y){
        let mask = (aDitherMask4(x, y, 0) + aDitherMask4(x, y, 1) + aDitherMask4(x, y, 2)) / 3;
        return threshold * mask;
    }
    
    function aDitherAddFunc3(threshold, x, y, pixel){
        let mask = (aDitherMask4(x, y, pixel[0]) + aDitherMask4(x, y, pixel[1]) + aDitherMask4(x, y, pixel[2])) / 3;
        return threshold * mask;
    }
    
    function randomThresholdFunc(threshold){ 
        return Math.ceil(Math.random() * threshold); 
    }


    /**
    * Color Dither stuff
    */

    function closestColor(pixels, imageWidth, imageHeight, colorDitherModeId, colors){
        return Image.colorDither(pixels, imageWidth, imageHeight, colorDitherModeId, colors, (closestColor)=>{
            return closestColor;
        });
    }

    function randomClosestColor(pixels, imageWidth, imageHeight, colorDitherModeId, colors){
        return Image.colorDither(pixels, imageWidth, imageHeight, colorDitherModeId, colors, (closestColor, secondClosestColor, closestDistance, secondClosestDistance)=>{
            if(Math.random() * secondClosestDistance < closestDistance){
                return secondClosestColor;
            }
            
            return closestColor;
        });
    }

    function colorADitherGenerator(aDitherFunc){
        return (pixels, imageWidth, imageHeight, colorDitherModeId, colors)=>{
            return Image.colorDither(pixels, imageWidth, imageHeight, colorDitherModeId, colors, (closestColor, secondClosestColor, closestDistance, secondClosestDistance, x, y, pixel)=>{
                if(aDitherFunc(secondClosestDistance, x, y, pixel) < closestDistance){
                    return secondClosestColor;
                }
                
                return closestColor;
            });
        }
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
       //color dither functions
       closestColor: closestColor,
       randomClosestColor: randomClosestColor,
       aditherXor1Color: colorADitherGenerator(aDitherXorFunc1),
       aditherXor2Color: colorADitherGenerator(aDitherXorFunc2),
       aditherXor3Color: colorADitherGenerator(aDitherXorFunc3),
       aditherAdd1Color: colorADitherGenerator(aDitherAddFunc1),
       aditherAdd2Color: colorADitherGenerator(aDitherAddFunc2),
       aditherAdd3Color: colorADitherGenerator(aDitherAddFunc3),
    };
})(App.Image, App.Pixel, App.PixelMath);