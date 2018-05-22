App.OrderedDither = (function(Image, Pixel, Bayer, PixelMath, DitherUtil){
    
    function createMaxtrix(dimensions, data){
        return {
            dimensions: dimensions,
            data: data,
        };
    }
    
    function matrixIndexFor(matrix, x, y){
        return (matrix.dimensions * y) + x;
    }
    
    function matrixValue(matrix, x, y){
        if(x >= matrix.dimensions || y >= matrix.dimensions){
            return 0;
        }
        const index = matrixIndexFor(matrix, x, y);
        return matrix.data[index];
    }

    function createOrderedDitherBase(dimensions, matrixCreationFunc, isRandom){
        const matrix = createMaxtrix(dimensions, convertBayerToFloat(matrixCreationFunc(dimensions), 256));
        //for some reason we need to use same coefficient as webgl for bw dithers
        const rCoefficient = DitherUtil.ditherRCoefficient(2, true);
        const matrixValueAdjustmentFunc = isRandom ? Math.random : ()=>{ return 1;} ;
        
        return function(pixels, imageWidth, imageHeight, threshold, blackPixel, whitePixel){
            return Image.transform(pixels, imageWidth, imageHeight, (pixel, x, y)=>{
                const lightness = PixelMath.lightness(pixel);
                const matrixThreshold = matrixValue(matrix, x % matrix.dimensions, y % matrix.dimensions) * matrixValueAdjustmentFunc();
                
                if(lightness + rCoefficient * matrixThreshold >= threshold){
                    whitePixel[Pixel.A_INDEX] = pixel[Pixel.A_INDEX];
                    return whitePixel;
                }
                else{
                    blackPixel[Pixel.A_INDEX] = pixel[Pixel.A_INDEX];
                    return blackPixel;
                }
                
            });
        };
    }

    function orderedDitherBuilder(bayerFuncName){
        return function(dimensions, isRandom=false){
            return createOrderedDitherBase(dimensions, Bayer[bayerFuncName], isRandom);
        };
    }


    /**
     * Color dither stuff
     */
    function convertBayerToFloat(bayerMatrix, fullValue=1){
        const length = bayerMatrix.length;
        const fraction = 1 / length;
        const floatData = new Float32Array(length);
        
        bayerMatrix.forEach((value, i)=>{
            floatData[i] = ((fraction * value) - 0.5) * fullValue;
        });
        return floatData;
    }

    function createColorOrderedDither(dimensions, bayerCreationFunc, isRandom, postscriptFuncBuilder=null){
        const matrix = createMaxtrix(dimensions, convertBayerToFloat(bayerCreationFunc(dimensions)));
        const postscriptFunc = postscriptFuncBuilder ? postscriptFuncBuilder(matrix) : null;
        const matrixValueAdjustmentFunc = isRandom ? Math.random : ()=>{ return 1;} ;

        return (pixels, imageWidth, imageHeight, colorDitherModeId, colors)=>{
            return Image.colorDither(pixels, imageWidth, imageHeight, colorDitherModeId, colors, (x, y)=>{
                return matrixValue(matrix, x % matrix.dimensions, y % matrix.dimensions) * matrixValueAdjustmentFunc();
            }, postscriptFunc);
        };
    }

    function colorOrderedDitherBuilder(bayerFuncName, postscriptFuncBuilder=null){
        return function(dimensions, isRandom=false){
            return createColorOrderedDither(dimensions, Bayer[bayerFuncName], isRandom, postscriptFuncBuilder);
        };
    }


    /**
     * Hue lightness ordered dither stuff
     * based on: http://alex-charlton.com/posts/Dithering_on_the_GPU/
    */

    function lightnessStep(l){
        const lightnessSteps = 4.0;
        //Quantize the lightness to one of `lightnessSteps` values
        return Math.floor((0.5 + l * lightnessSteps)) / lightnessSteps;
    }

    function hueLightnessPostscriptFuncBuilder(matrix){
        const hslColor = new Uint16Array(3);
        return (color, x, y, pixel)=>{
            const matrixFraction = matrixValue(matrix, x % matrix.dimensions, y % matrix.dimensions);
            hslColor[0] = PixelMath.hue(color);
            hslColor[1] = PixelMath.saturation(color);
            const pixelLightness = PixelMath.lightness(color) / 255;
            
            const l1 = lightnessStep(Math.max(pixelLightness - 0.125, 0.0));
            const l2 = lightnessStep(Math.min(pixelLightness + 0.124, 1.0));
            const lightnessDiff = (pixelLightness - l1) / (l2 - l1);
            
            //have to add 0.5 back to matrix value, since we subtracted 0.5 when we converted the bayer matrix to float
            const adjustedLightness = (lightnessDiff < matrixFraction + 0.5) ? l1 : l2;
            hslColor[2] = Math.round(adjustedLightness * 255);
            let retPixel = PixelMath.hslToPixel(hslColor, pixel);

            return retPixel;
        };
    }

    /**
    * Automagically generated exports based on patterns in BayerMatrix module
    */
    const exports = {
        createHueLightnessDither: colorOrderedDitherBuilder('bayer', hueLightnessPostscriptFuncBuilder),
    };

    DitherUtil.generateBayerKeys((orderedDitherKey, bwDitherKey, colorDitherKey)=>{
        exports[bwDitherKey] = orderedDitherBuilder(orderedDitherKey);
        exports[colorDitherKey] = colorOrderedDitherBuilder(orderedDitherKey);
    });

    return exports;
    
})(App.Image, App.Pixel, App.BayerMatrix, App.PixelMath, App.DitherUtil);