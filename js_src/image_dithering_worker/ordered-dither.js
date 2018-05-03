App.OrderedDither = (function(Image, Pixel, Bayer, PixelMath){
    
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
    
    function normalizeOrderedMatrixValues(matrix, fullValue){
        const length = matrix.data.length;
        const fraction = Math.floor(fullValue / length);
        
        for(let i=0;i<length;i++){
            matrix.data[i] = (matrix.data[i] + 1) * fraction;
        }
    }

    function createOrderedDitherBase(dimensions, matrixCreationFunc){
        let matrix = createMaxtrix(dimensions, matrixCreationFunc(dimensions));
        normalizeOrderedMatrixValues(matrix, 256);
        
        return function(pixels, imageWidth, imageHeight, threshold, blackPixel, whitePixel){
            const thresholdFraction = 255 / threshold;
            
            return Image.transform(pixels, imageWidth, imageHeight, (pixel, x, y)=>{
                const lightness = PixelMath.lightness(pixel);
                const matrixThreshold = matrixValue(matrix, x % matrix.dimensions, y % matrix.dimensions);
                
                if(lightness > (matrixThreshold * thresholdFraction)){
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
        return function(dimensions){
            return createOrderedDitherBase(dimensions, Bayer[bayerFuncName]);
        };
    }


    /**
     * Color dither stuff
     */
    function convertBayerToFloat(bayerMatrix){
        const length = bayerMatrix.length;
        const highestValue = length;
        let floatData = new Float32Array(length);
        
        bayerMatrix.forEach((value, i)=>{
            floatData[i] = ((value + 1) / highestValue) - 0.5;
        });
        return floatData;
    }

    function createColorOrderedDither(dimensions, bayerCreationFunc, postscriptFuncBuilder=null){
        let matrix = createMaxtrix(dimensions, convertBayerToFloat(bayerCreationFunc(dimensions)));
        let postscriptFunc = null;
        if(postscriptFuncBuilder){
            postscriptFunc = postscriptFuncBuilder(matrix);
        }

        return (pixels, imageWidth, imageHeight, colorDitherModeId, colors)=>{
            return Image.colorDither(pixels, imageWidth, imageHeight, colorDitherModeId, colors, (x, y)=>{
                return matrixValue(matrix, x % matrix.dimensions, y % matrix.dimensions);
            }, postscriptFunc);
        };
    }

    function colorOrderedDitherBuilder(bayerFuncName, postscriptFuncBuilder=null){
        return function(dimensions){
            return createColorOrderedDither(dimensions, Bayer[bayerFuncName], postscriptFuncBuilder);
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

    
    return {
        //bw dither
        createOrderedDither: orderedDitherBuilder('create'),
        createClusterOrderedDither: orderedDitherBuilder('createCluster'),
        createDotClusterOrderedDither: orderedDitherBuilder('createDotCluster'),
        createPatternOrderedDither: orderedDitherBuilder('createPattern'),
        createHalftoneDot: orderedDitherBuilder('createHalftoneDot'),
        createHatch: orderedDitherBuilder('createHatch'),
        //color dither
        createColorOrderedDither: colorOrderedDitherBuilder('create'),
        createColorClusterOrderedDither: colorOrderedDitherBuilder('createCluster'),
        createColorDotClusterOrderedDither: colorOrderedDitherBuilder('createDotCluster'),
        createColorPatternOrderedDither: colorOrderedDitherBuilder('createPattern'),
        createHalftoneDotColor: colorOrderedDitherBuilder('createHalftoneDot'),
        createColorHatch: colorOrderedDitherBuilder('createHatch'),
        createHueLighnessDither: colorOrderedDitherBuilder('create', hueLightnessPostscriptFuncBuilder),
    };
    
})(App.Image, App.Pixel, App.BayerMatrix, App.PixelMath);