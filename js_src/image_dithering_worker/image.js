var App = App || {};

App.Image = (function(Pixel){
    function transformImage(pixels, imageWidth, imageHeight, pixelTransformFunc){
        var y = -1;
        for(var i=0;i<pixels.length;i+=4){
            var pixel = Pixel.create(pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]);
            
            var pixelNum = i / 4;
            var x = pixelNum % imageWidth;
            if(x === 0){
                y++;
            }
           
            var outputPixel = pixelTransformFunc(pixel, x, y);
            
            pixels[i] = outputPixel.r;
            pixels[i+1] = outputPixel.g;
            pixels[i+2] = outputPixel.b;
            pixels[i+3] = outputPixel.a;
        }
        return pixels;
    }

    
    return {
       transform: transformImage
    };
})(App.Pixel);