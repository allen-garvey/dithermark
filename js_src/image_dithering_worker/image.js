
App.Image = (function(Pixel, ColorDitherModeFunctions){
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


    function getClosestColors(pixelValue, colorValues, distanceFunc){
        let closestIndex = -1;
        let secondClosestIndex = -1;
        let closestDistance = Infinity;
        let secondClosestDistance = Infinity;

        colorValues.forEach((colorValue, i)=>{
            const distance = distanceFunc(pixelValue, colorValue);
            if(distance < closestDistance){
                secondClosestDistance = closestDistance;
                secondClosestIndex = closestIndex;
                closestIndex = i;
                closestDistance = distance;
            }
            else if(distance < secondClosestDistance){
                secondClosestDistance = distance;
                secondClosestIndex = i;
            }
        });

        return {
            closestIndex,
            closestDistance,
            secondClosestIndex,
            secondClosestDistance
        };

    }

    function colorDitherImage(pixels, imageWidth, imageHeight, colorDitherModeId, colors, colorChoiceFunc){
        let colorDitherModeFuncs = ColorDitherModeFunctions[colorDitherModeId];
        let pixelValueFunc = colorDitherModeFuncs.pixelValue;
        let pixelDistanceFunc = colorDitherModeFuncs.distance;

        let colorValues = colors.map((color)=>{
            return pixelValueFunc(color);
        });

        let y = 0;
        let x = 0;
        let pixel = Pixel.create(0, 0, 0);
        
        for(let i=0;i<pixels.length;i+=4){
            pixel[Pixel.R_INDEX] = pixels[i];
            pixel[Pixel.G_INDEX] = pixels[i+1];
            pixel[Pixel.B_INDEX] = pixels[i+2];
            // pixel[Pixel.A_INDEX] = pixels[i+3];

            let closestColors = getClosestColors(pixelValueFunc(pixel), colorValues, pixelDistanceFunc);
            const closestColor = colors[closestColors.closestIndex];
            const secondClosestColor = colors[closestColors.secondClosestIndex];
            const closestDistance = closestColors.closestDistance;
            const secondClosestDistance = closestColors.secondClosestDistance;
            
            let outputPixel = colorChoiceFunc(closestColor, secondClosestColor, closestDistance, secondClosestDistance, x, y, pixel);
            
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
    };
})(App.Pixel, App.ColorDitherModeFunctions);