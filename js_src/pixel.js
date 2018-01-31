var App = App || {};

App.Pixel = (function(){
    const R_INDEX = 0;
    const G_INDEX = 1;
    const B_INDEX = 2;
    const A_INDEX = 3;
    
    function createPixel(r, g, b, a = 255){
        let pixel = new Uint8ClampedArray(4);
        pixel[R_INDEX] = r;
        pixel[G_INDEX] = g;
        pixel[B_INDEX] = b;
        pixel[A_INDEX] = a;
        
        return pixel;
    }
    
    function pixelLightness(pixel){
        var max = Math.max(pixel[0], pixel[1], pixel[2]);
        var min = Math.min(pixel[0], pixel[1], pixel[2]);
        return Math.floor((max + min) / 2.0);
    }
    
    //based on wikipedia formulas: https://en.wikipedia.org/wiki/HSL_and_HSV#Hue_and_chroma
    function pixelHue(pixel){
        var max = Math.max(pixel[0], pixel[1], pixel[2]);
        var min = Math.min(pixel[0], pixel[1], pixel[2]);
        var diff = max - min;
        //white, black or gray
        if(diff === 0){
            if(pixel[0] >= 128){
                return 360;
            }
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
        return rawHue * 60;
    }

    
    return {
       create: createPixel,
       lightness: pixelLightness,
       hue: pixelHue,
       R_INDEX: R_INDEX,
       G_INDEX: G_INDEX,
       B_INDEX: B_INDEX,
       A_INDEX: A_INDEX,
    };
})();