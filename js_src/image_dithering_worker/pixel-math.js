App.PixelMath = (function(Pixel){
    const R_INDEX = Pixel.R_INDEX;
    const G_INDEX = Pixel.G_INDEX;
    const B_INDEX = Pixel.B_INDEX;
    const A_INDEX = Pixel.A_INDEX;
    
    function pixelLightness(pixel){
        var max = Math.max(pixel[0], pixel[1], pixel[2]);
        var min = Math.min(pixel[0], pixel[1], pixel[2]);
        return Math.floor((max + min) / 2.0);
    }
    
    //based on wikipedia formulas: https://en.wikipedia.org/wiki/HSL_and_HSV#Hue_and_chroma
    //returns hue in range 0 - 359
    function pixelHue(pixel){
        let max = Math.max(pixel[0], pixel[1], pixel[2]);
        let min = Math.min(pixel[0], pixel[1], pixel[2]);
        let diff = max - min;
        //white, black or gray
        if(diff === 0){
            return 0;
        }
        let rawHue;
        if(pixel[R_INDEX] === max){
            rawHue = (pixel[G_INDEX] - pixel[B_INDEX]) / diff % 6;
        }
        else if(pixel[G_INDEX] === max){
            rawHue = (pixel[B_INDEX] - pixel[R_INDEX]) / diff + 2;
        }
        else{
            rawHue = (pixel[R_INDEX] - pixel[G_INDEX]) / diff + 4;
        }
        //convert to 360 degrees
        let ret = Math.round(rawHue * 60);
        if(ret < 0){
            return ret + 359;
        }
        return ret;
    }
    
    //based on: https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
    //returns saturation is range 0-100
    function pixelSaturation(pixel){
        let max = Math.max(pixel[0], pixel[1], pixel[2]) / 255;
        let min = Math.min(pixel[0], pixel[1], pixel[2]) / 255;
        if(max === min){
            return 0;
        }
        let c = (max + min) / 2;
        let diff = max - min;
        let saturation;
        if(c > 0.5){
            saturation = diff / (2 - diff);
        }
        else{
            saturation = diff / (max + min);
        }
        
        return Math.round(saturation * 100);
    }
    
    function hslArrayToRgb(hslArray){
        let pixel = Pixel.create(0, 0, 0);
        let rgbArray = new Uint8Array(hslArray.length);
        
        for(let i=0;i<hslArray.length;i+=3){
            let hsl = hslArray.subarray(i, i+3);
            pixel = hslToPixel(hsl, pixel);
            
            rgbArray[i] = pixel[0];
            rgbArray[i+1] = pixel[1];
            rgbArray[i+2] = pixel[2];
        }
        
        return rgbArray;
    }
    
    /**
     * based on https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
     * converts a hue in range 0-360, saturation in range 0-100 and lightness in range 0-255 to an rgb Pixel
     *
     */
    function hslToPixel(hsl, pixel=null){
        if(!pixel){
            pixel = Pixel.create(0, 0, 0);
        }
        let hue = hsl[0];
        let saturation = hsl[1];
        let lightness = hsl[2];
        
        if(saturation === 0){
            pixel[0] = lightness;
            pixel[1] = lightness;
            pixel[2] = lightness;
            return pixel;
        }
        
        hue /= 360;
        let s = saturation / 100;
        let l = lightness / 255;
    
        let hue2rgb = function hue2rgb(p, q, t){
            if(t < 0){
                t += 1;   
            }
            else if(t > 1){
                t -= 1;   
            }
            if(t < 1/6){ 
                return p + (q - p) * 6 * t;
            }
            else if(t < 1/2){
                return q;
            }
            else if(t < 2/3){
                return p + (q - p) * (2/3 - t) * 6;
            }
            return p;
        };
    
        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        let r = hue2rgb(p, q, hue + 1/3);
        let g = hue2rgb(p, q, hue);
        let b = hue2rgb(p, q, hue - 1/3);
        
        pixel[Pixel.R_INDEX] = Math.round(r * 255);
        pixel[Pixel.G_INDEX] = Math.round(g * 255);
        pixel[Pixel.B_INDEX] = Math.round(b * 255);
        
        return pixel;
    }
    
    
    return {
       lightness: pixelLightness,
       hue: pixelHue,
       saturation: pixelSaturation,
       hslArrayToRgb: hslArrayToRgb,
       hslToPixel: hslToPixel,
    };
})(App.Pixel);