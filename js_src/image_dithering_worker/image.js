var App = App || {};

App.Image = (function(Pixel){
    function transformImage(pixels, imageWidth, imageHeight, pixelTransformFunc){
        var y = 0;
        var x = 0;
        var pixel = Pixel.create(0, 0, 0);
        
        for(var i=0;i<pixels.length;i+=4){
            pixel[Pixel.R_INDEX] = pixels[i];
            pixel[Pixel.G_INDEX] = pixels[i+1];
            pixel[Pixel.B_INDEX] = pixels[i+2];
            pixel[Pixel.A_INDEX] = pixels[i+3];
            
            var outputPixel = pixelTransformFunc(pixel, x, y);
            
            pixels[i] = outputPixel[0];
            pixels[i+1] = outputPixel[1];
            pixels[i+2] = outputPixel[2];
            pixels[i+3] = outputPixel[3];
            
            x++;
            if(x >= imageWidth){
                x = 0;
                y++;
            }
        }
        return pixels;
    }

    
    return {
       transform: transformImage
    };
})(App.Pixel);