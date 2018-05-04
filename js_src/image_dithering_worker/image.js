
App.Image = (function(Pixel, ColorDitherModeFunctions, DitherUtil, PixelMath){
    function transformImage(pixels, imageWidth, imageHeight, pixelTransformFunc){
        let y = 0;
        let x = 0;
        let pixel = Pixel.create(0, 0, 0);
        
        for(let i=0;i<pixels.length;i+=4){
            pixel[Pixel.R_INDEX] = pixels[i];
            pixel[Pixel.G_INDEX] = pixels[i+1];
            pixel[Pixel.B_INDEX] = pixels[i+2];
            pixel[Pixel.A_INDEX] = pixels[i+3];
            
            let outputPixel = pixelTransformFunc(pixel, x, y);
            
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


    function findClosestColorIndex(pixelValue, colorValues, distanceFunc){
        let closestIndex = 0;
        let closestDistance = Infinity;

        colorValues.forEach((colorValue, i)=>{
            const distance = distanceFunc(pixelValue, colorValue);
            if(distance < closestDistance){
                closestIndex = i;
                closestDistance = distance;
            }
        });

        return closestIndex;
    }

    function identity(value){
        return value;
    }

    function colorDitherImage(pixels, imageWidth, imageHeight, colorDitherModeId, colors, pixelAdjustmentFunc, postscriptFunc=null){
        const colorDitherModeFuncs = ColorDitherModeFunctions[colorDitherModeId];
        const pixelValueFunc = colorDitherModeFuncs.pixelValue;
        const pixelDistanceFunc = colorDitherModeFuncs.distance;
        if(!postscriptFunc){
            postscriptFunc = identity;
        }
        const ditherRCoefficient = DitherUtil.ditherRCoefficient(colors.length);
        const colorValues = colors.map(pixelValueFunc);

        let y = 0;
        let x = 0;
        let pixel = Pixel.create(0, 0, 0);
        
        for(let i=0;i<pixels.length;i+=4){
            pixel[Pixel.R_INDEX] = pixels[i];
            pixel[Pixel.G_INDEX] = pixels[i+1];
            pixel[Pixel.B_INDEX] = pixels[i+2];
            // pixel[Pixel.A_INDEX] = pixels[i+3]; //not necessary to set alpha

            const pixelAdjustmentValue = pixelAdjustmentFunc(x, y, pixel) * ditherRCoefficient;
            if(pixelAdjustmentValue !== 0){
                pixel[Pixel.R_INDEX] = PixelMath.clamp(pixel[Pixel.R_INDEX] + pixelAdjustmentValue);
                pixel[Pixel.G_INDEX] = PixelMath.clamp(pixel[Pixel.G_INDEX] + pixelAdjustmentValue);
                pixel[Pixel.B_INDEX] = PixelMath.clamp(pixel[Pixel.B_INDEX] + pixelAdjustmentValue);
            }
            
            const closestColor = colors[findClosestColorIndex(pixelValueFunc(pixel), colorValues, pixelDistanceFunc)];
            //postscriptFunc is for hue-lightness dither
            const outputPixel = postscriptFunc(closestColor, x, y, pixel);

            pixels[i] = outputPixel[0];
            pixels[i+1] = outputPixel[1];
            pixels[i+2] = outputPixel[2];
            pixels[i+3] = pixels[i+3];
            
            x++;
            if(x >= imageWidth){
                x = 0;
                y++;
            }
        }
        return pixels;
    }

    
    return {
       transform: transformImage,
       colorDither: colorDitherImage,
       findClosestColorIndex,
    };
})(App.Pixel, App.ColorDitherModeFunctions, App.DitherUtil, App.PixelMath);