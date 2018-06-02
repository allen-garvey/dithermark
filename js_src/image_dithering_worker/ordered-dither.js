App.OrderedDither = (function(Image, Pixel, Bayer, PixelMath, DitherUtil, ColorDitherModeFunctions){
    
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
        const matrix = createMaxtrix(dimensions, convertBayerToFloat(matrixCreationFunc(dimensions), 255));
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
        const fraction = 1 / (length - 1);
        const floatData = new Float32Array(length);
        
        bayerMatrix.forEach((value, i)=>{
            floatData[i] = (fraction * value - 0.5) * fullValue;
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
     * Yliluoma's ordered dithering
     * from: https://bisqwit.iki.fi/story/howto/dither/jy/
     */
    //
    //adaptation of: Yliluoma's ordered dithering algorithm 1
    //
    function yliluoma1EvaluateMixingError(pixelValue, mixValue, color1Value, color2Value, ratioFraction, pixelDistanceFunc){
        return pixelDistanceFunc(pixelValue, mixValue) + pixelDistanceFunc(color1Value, color2Value) * 0.1 * (Math.abs(ratioFraction - 0.5) + 0.5);
    }
    function yliluoma1DeviseMixingPlan(pixelValue, colors, colorValues, bayerValue, matrixLength, pixelValueFunc, pixelDistanceFunc, mixPixel){
        const colorsLength = colors.length;
        let colorIndex1 = 0;
        let colorIndex2 = 0;
        let lowestRatio = 0;
        let leastPenalty = Infinity;
        // Loop through every unique combination of two colors from the palette,
        // and through each possible way to mix those two colors. They can be
        // mixed in exactly 64 ways, when the threshold matrix is 8x8.
        for(let index1=0;index1<colorsLength;index1++){
            for(let index2=index1;index2<colorsLength;index2++){
                for(let ratio=0;ratio<matrixLength;ratio++){
                    if(index1 === index2 && ratio != 0){
                        break;
                    }
                    // Determine the two component colors
                    const color1 = colors[index1];
                    const color2 = colors[index2];
                    // Determine what mixing them in this proportion will produce
                    mixPixel[Pixel.R_INDEX] = color1[Pixel.R_INDEX] + ratio * (color2[Pixel.R_INDEX] - color1[Pixel.R_INDEX]) / matrixLength;
                    mixPixel[Pixel.G_INDEX] = color1[Pixel.G_INDEX] + ratio * (color2[Pixel.G_INDEX] - color1[Pixel.G_INDEX]) / matrixLength;
                    mixPixel[Pixel.B_INDEX] = color1[Pixel.B_INDEX] + ratio * (color2[Pixel.B_INDEX] - color1[Pixel.B_INDEX]) / matrixLength;
                    // Determine how well that matches what we want to accomplish
                    const penalty = yliluoma1EvaluateMixingError(pixelValue, pixelValueFunc(mixPixel), colorValues[index1], colorValues[index2], ratio/matrixLength, pixelDistanceFunc);
                    // Keep the result that has the smallest error
                    if(penalty < leastPenalty){
                        leastPenalty = penalty;
                        colorIndex1 = index1;
                        colorIndex2 = index2;
                        lowestRatio = ratio;
                    }
                }
            }
        }
        if(bayerValue < lowestRatio){
            return colorIndex2;
        }
        return colorIndex1;
        
    }
    function createYliluoma1ColorDither(dimensions, bayerFuncName){
        const matrix = createMaxtrix(dimensions, Bayer[bayerFuncName](dimensions));
        const matrixLength = dimensions * dimensions;

        return (pixels, imageWidth, imageHeight, colorDitherModeId, colors)=>{
            const colorsLength = colors.length;
            const colorDitherModeFuncs = ColorDitherModeFunctions[colorDitherModeId];
            const pixelValueFunc = colorDitherModeFuncs.pixelValue;
            const pixelDistanceFunc = colorDitherModeFuncs.distance;
            const colorValues = colors.map((color)=>{
                return pixelValueFunc(color);
            });
            //to reduce allocations and deletions
            const mixPixel = Pixel.create(0, 0, 0);

            return Image.transform(pixels, imageWidth, imageHeight, (pixel, x, y)=>{
                //ignore transparent pixels
                if(pixel[Pixel.A_INDEX] === 0){
                    return pixel;
                }
                const bayerValue = matrixValue(matrix, x % matrix.dimensions, y % matrix.dimensions);
                const planIndex = yliluoma1DeviseMixingPlan(pixelValueFunc(pixel), colors, colorValues, bayerValue, matrixLength, pixelValueFunc, pixelDistanceFunc, mixPixel);
                const bestPixelMatch = colors[planIndex];
                //rgb only, preserve alpha
                for(let i=0;i<3;i++){
                    pixel[i] = bestPixelMatch[i];
                }
                return pixel;
            });
        };
    }

    //
    //adaptation of: Yliluoma's ordered dithering algorithm 2
    //
    function yliluoma2DeviseMixingPlan(pixel, colors, paletteValues, planBuffer, pixelValueFunc, pixelDistanceFunc){
        const colorsLength = colors.length;
        const pixelValue = pixelValueFunc(pixel);
        let proportionTotal = 0;
        const soFar = new Uint32Array(3);
        const sum = new Uint32Array(3);
        const add = new Uint32Array(3);
        const test = new Uint32Array(3);
        while(proportionTotal < colorsLength){
            let chosenAmount = 1;
            let chosen = 0;
            const maxTestCount = Math.max(1, proportionTotal);
            let leastPenalty = Infinity;
            for(let index=0; index<colorsLength; ++index){
                const color = colors[index];
                sum.set(soFar);
                add.set(color);
                for(let p=1; p<=maxTestCount; p*=2){
                    for(let c=0; c<3; ++c){
                        sum[c] += add[c];
                        add[c] += add[c];
                    }
                    const t = proportionTotal + p;
                    test.set([sum[0] / t, sum[1] / t, sum[2] / t]);
                    const penalty = pixelDistanceFunc(pixelValue, pixelValueFunc(test));
                    if(penalty < leastPenalty){
                        leastPenalty = penalty;
                        chosen = index;
                        chosenAmount = p;
                    }
                }
            }
            for(let p=0; p<chosenAmount; ++p){
                if(proportionTotal >= colorsLength){
                    break;
                }
                planBuffer[proportionTotal++] = chosen;
            }

            const color = colors[chosen];
            for(let c=0; c<3; ++c){
                soFar[c] += color[c] * chosenAmount;
            }
        }
        return planBuffer.sort((a, b)=>{
            return paletteValues[a] - paletteValues[b];
        });
    }
    function pixelLuma(pixel){
        return pixel[Pixel.R_INDEX] * 299 + pixel[Pixel.G_INDEX] * 587 + pixel[Pixel.B_INDEX] * 114;
    }
    function createYliluoma2ColorDither(dimensions, bayerFuncName){
        const matrix = createMaxtrix(dimensions, Bayer[bayerFuncName](dimensions));
        const matrixLength = dimensions * dimensions;

        return (pixels, imageWidth, imageHeight, colorDitherModeId, colors)=>{
            const colorsLength = colors.length;
            const colorDitherModeFuncs = ColorDitherModeFunctions[colorDitherModeId];
            const pixelValueFunc = colorDitherModeFuncs.pixelValue;
            const pixelDistanceFunc = colorDitherModeFuncs.distance;
            const paletteValues = new Uint32Array(colorsLength);
            colors.forEach((color, i)=>{
                paletteValues[i] = pixelLuma(color);
            });
            const planBuffer = colorsLength < 256 ? new Uint8Array(colorsLength) : new Uint16Array(colorsLength);

            return Image.transform(pixels, imageWidth, imageHeight, (pixel, x, y)=>{
                //ignore transparent pixels
                if(pixel[Pixel.A_INDEX] === 0){
                    return pixel;
                }
                const bayerValue = matrixValue(matrix, x % matrix.dimensions, y % matrix.dimensions);
                const planIndex = Math.floor(bayerValue * colorsLength / matrixLength);
                const plan = yliluoma2DeviseMixingPlan(pixel, colors, paletteValues, planBuffer, pixelValueFunc, pixelDistanceFunc);
                const bestPixelMatch = colors[plan[planIndex]];
                //rgb only, preserve alpha
                for(let i=0;i<3;i++){
                    pixel[i] = bestPixelMatch[i];
                }
                return pixel;
            });
        };
    }


    /**
     * Hue lightness ordered dither stuff
     * based on: http://alex-charlton.com/posts/Dithering_on_the_GPU/
    */

    function lightnessStep(l){
        const lightnessSteps = 4;
        //Quantize the lightness to one of `lightnessSteps` values
        return Math.floor(0.5 + l * lightnessSteps) / lightnessSteps;
    }

    function hueLightnessPostscriptFuncBuilder(matrix){
        const hslColor = new Uint16Array(3);
        return (color, x, y, pixel)=>{
            //have to add 0.5 back to matrix value, since we subtracted 0.5 when we converted the bayer matrix to float
            const matrixFraction = matrixValue(matrix, x % matrix.dimensions, y % matrix.dimensions) + 0.5;
            hslColor[0] = PixelMath.hue(color);
            hslColor[1] = PixelMath.saturation(color);
            const pixelLightness = PixelMath.lightness(color) / 255;
            
            const l1 = lightnessStep(Math.max(pixelLightness - 0.125, 0));
            const l2 = lightnessStep(Math.min(pixelLightness + 0.124, 1));
            const lightnessDiff = (pixelLightness - l1) / (l2 - l1);
            
            const adjustedLightness = lightnessDiff < matrixFraction ? l1 : l2;
            hslColor[2] = Math.round(adjustedLightness * 255);
            return PixelMath.hslToPixel(hslColor, pixel);
        };
    }

    /**
    * Automagically generated exports based on patterns in BayerMatrix module
    */
    const exports = {
        createHueLightnessDither: colorOrderedDitherBuilder('bayer', hueLightnessPostscriptFuncBuilder),
        createYliluoma2ColorDither,
        createYliluoma1ColorDither,
    };

    DitherUtil.generateBayerKeys((orderedDitherKey, bwDitherKey, colorDitherKey)=>{
        exports[bwDitherKey] = orderedDitherBuilder(orderedDitherKey);
        exports[colorDitherKey] = colorOrderedDitherBuilder(orderedDitherKey);
    });

    return exports;
    
})(App.Image, App.Pixel, App.BayerMatrix, App.PixelMath, App.DitherUtil, App.ColorDitherModeFunctions);