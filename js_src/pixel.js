var App = App || {};

App.Pixel = (function(){
    function createPixel(r, g, b, a = 255){
        return {
            r: r,
            g: g,
            b: b,
            a: a
        };
    }
    
    function pixelLightness(pixel){
        var max = Math.max(pixel.r, pixel.g, pixel.b);
        var min = Math.min(pixel.r, pixel.g, pixel.b);
        return Math.floor((max + min) / 2.0);
    }

    
    return {
       create: createPixel,
       lightness: pixelLightness
    };
})();