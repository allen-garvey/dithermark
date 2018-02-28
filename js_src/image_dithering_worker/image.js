
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
    
    function transformImageSerpentine(pixels, imageWidth, imageHeight, pixelTransformFunc){
        let pixel = Pixel.create(0, 0, 0);
        let pixelWidth = imageWidth * 4;
        let pixelOffset = 0;
        
        for(let y=0;y<imageHeight;y++){
            let x=0;
            //odd
            if(y & 1){
                let adjustedPixelOffset = pixelOffset + pixelWidth - 1;
                for(let j=0;j<pixelWidth;j++){
                    pixel[Pixel.R_INDEX] = pixels[adjustedPixelOffset-j-3];
                    pixel[Pixel.G_INDEX] = pixels[adjustedPixelOffset-j-2];
                    pixel[Pixel.B_INDEX] = pixels[adjustedPixelOffset-j-1];
                    pixel[Pixel.A_INDEX] = pixels[adjustedPixelOffset-j];
                    
                    let outputPixel = pixelTransformFunc(pixel, imageWidth-x-1, y);
                    
                    pixels[adjustedPixelOffset-j-3] = outputPixel[0];
                    pixels[adjustedPixelOffset-j-2] = outputPixel[1];
                    pixels[adjustedPixelOffset-j-1] = outputPixel[2];
                    pixels[adjustedPixelOffset-j] = outputPixel[3];

                    x++;
                    j += 3;
                }
            }
            else{
                for(let j=0;j<pixelWidth;j++){
                    pixel[Pixel.R_INDEX] = pixels[pixelOffset+j];
                    pixel[Pixel.G_INDEX] = pixels[pixelOffset+j+1];
                    pixel[Pixel.B_INDEX] = pixels[pixelOffset+j+2];
                    pixel[Pixel.A_INDEX] = pixels[pixelOffset+j+3];
                    
                    let outputPixel = pixelTransformFunc(pixel, x, y);
                    
                    pixels[pixelOffset+j] = outputPixel[0];
                    pixels[pixelOffset+j+1] = outputPixel[1];
                    pixels[pixelOffset+j+2] = outputPixel[2];
                    pixels[pixelOffset+j+3] = outputPixel[3];

                    x++;
                    j += 3;
                }
            }
            pixelOffset = pixelOffset + pixelWidth;
        }
        
        return pixels;
    }

    
    return {
       transform: transformImage,
       transformSerpentine: transformImageSerpentine,
    };
})(App.Pixel);