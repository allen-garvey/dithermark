/**
 * Color quantization popularity algorithms
*/
App.OptimizePalettePopularity = (function(PixelMath, Util){
    function rotatePixels32Clockwise(pixels32, imageWidth, imageHeight){
        const length = pixels32.length;
        const ret = new Uint32Array(length);

        let retIndex = 0;
        for(let x=0;x<imageWidth;x++){
            for(let y=0;y<length;y+=imageWidth){
                ret[retIndex++] = pixels32[x+y];
            }
        }
        return ret;
    }

    //set pixel alpha value to 255
    function normalizePixel32Transparency(pixel32, _pixelBuffer){
        return (pixel32 | 0xff000000);
    }

    function perceptualPixel32Hash(pixel32, pixelBuffer){
        const blackThreshold = 46;
        const whiteThreshold = 240;

        pixelBuffer[0] = (pixel32 & 0xff);
        pixelBuffer[1] = (pixel32 & 0xff00) >> 8;
        pixelBuffer[2] = (pixel32 & 0xff0000) >> 16;

        if(Math.max(pixelBuffer[0], pixelBuffer[1], pixelBuffer[2]) < blackThreshold){
            return 0xff000000;
        }
        if(Math.min(pixelBuffer[0], pixelBuffer[1], pixelBuffer[2]) > whiteThreshold){
            return 0xffffffff;
        }

        return normalizePixel32Transparency(pixel32);
    }

    function incrementMap(map, key){
        let value = 1;
        if(map.has(key)){
            value = map.get(key) + 1;
        }
        map.set(key, value);
    }

    function getNewUniqueValueOrDefault(set, array){
        for(let item of array){
            if(!set.has(item)){
                set.add(item);
                return item;
            }
        }
        return array[0];
    }

    function addColor32ToColors(color32, colors, index){
        const startIndex = index * 3;
        colors[startIndex] = (color32 & 0xff);
        colors[startIndex+1] = (color32 & 0xff00) >> 8;
        colors[startIndex+2] = (color32 & 0xff0000) >> 16;
    }

    //divides an image into numColors horizontal or vertical strips, and finds the most
    //popular color in each strip
    function popularity(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        const retColors = new Uint8Array(numColors * 3);
        const colorsSet = new Set();
        const pixelHashFunc = colorQuantization.isPerceptual ? perceptualPixel32Hash : normalizePixel32Transparency;
        let pixelArray = new Uint32Array(pixels.buffer);
        if(colorQuantization.isVertical){
            pixelArray = rotatePixels32Clockwise(pixelArray, imageWidth, imageHeight);
        }
        const pixelBuffer = new Uint8Array(4);
        const fraction = pixelArray.length / numColors;

        for(let i=1,previousEndIndex=0;i<=numColors;i++){
            const endIndex = Math.min(Math.round(i * fraction), pixelArray.length);
            const popularityMap = new Map();
            for(let j=previousEndIndex;j<endIndex;j++){
                const pixel32 = pixelArray[j];
                //ignore transparent pixels
                if((pixel32 & 0xff000000) >> 24 === 0){
                    continue;
                }
                incrementMap(popularityMap, pixelHashFunc(pixel32, pixelBuffer));
            }
            const sortedValues = [...popularityMap.keys()].sort((a, b)=>{
                return popularityMap.get(b) - popularityMap.get(a);
            });
            const colorKey = getNewUniqueValueOrDefault(colorsSet, sortedValues);
            addColor32ToColors(colorKey, retColors, i-1);

            previousEndIndex = endIndex;
        }
        return retColors;
    }

    //Divides an image into zones based on sort function, and finds the most popular color in each zome
    function sortedPopularity(pixels, numColors, imageWidth, imageHeight, isPerceptual, pixelValueFunc){
        const retColors = new Uint8Array(numColors * 3);
        const colorsSet = new Set();
        const pixelHashFunc = isPerceptual ? perceptualPixel32Hash : normalizePixel32Transparency;
        const pixelArray = Util.sortPixelBuffer(pixels, pixelValueFunc);
        const pixelBuffer = new Uint8Array(4);

        const fraction = pixelArray.length / numColors;

        for(let i=1,previousEndIndex=0;i<=numColors;i++){
            const endIndex = Math.min(Math.round(i * fraction), pixelArray.length);
            const popularityMap = new Map();
            for(let j=previousEndIndex;j<endIndex;j++){
                const pixel32 = pixelArray[j];
                //ignore transparent pixels
                if((pixel32 & 0xff000000) >> 24 === 0){
                    continue;
                }
                incrementMap(popularityMap, pixelHashFunc(pixel32, pixelBuffer));
            }
            const sortedValues = [...popularityMap.keys()].sort((a, b)=>{
                return popularityMap.get(b) - popularityMap.get(a);
            });
            const colorKey = getNewUniqueValueOrDefault(colorsSet, sortedValues);
            addColor32ToColors(colorKey, retColors, i-1);

            previousEndIndex = endIndex;
        }
        return retColors;
    }

    //Divides an image into numColors lightness zones, and finds the most popular color in each zone
    function lightnessPopularity(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        return sortedPopularity(pixels, numColors, imageWidth, imageHeight, colorQuantization.isPerceptual, PixelMath.lightness);
    }

    function lumaPopularity(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        return sortedPopularity(pixels, numColors, imageWidth, imageHeight, colorQuantization.isPerceptual, PixelMath.luma);
    }

    //Divides an image into numColors hue zones, and finds the most popular color in each zone
    function huePopularity(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        return sortedPopularity(pixels, numColors, imageWidth, imageHeight, colorQuantization.isPerceptual, PixelMath.hue);
    }

    //Divides image into boxes, and finds average color in each box
    function spatialAverageBoxed(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        const retColors = new Uint8Array(numColors * 3);
        const averageBuffer = new Float32Array(3);
        const numBoxesPerDimension = Math.floor(Math.sqrt(numColors));
        const rowsWithExtraHorizontalBoxes = numColors - numBoxesPerDimension * numBoxesPerDimension; 
        const verticalFraction = Math.round(imageHeight / numBoxesPerDimension);

        for(let boxVerticalIndex=0,colorIndex=0;boxVerticalIndex<numBoxesPerDimension;boxVerticalIndex++){
            const yBase = boxVerticalIndex * verticalFraction;
            const yLimit = boxVerticalIndex === numBoxesPerDimension - 1 ? imageHeight : (boxVerticalIndex + 1) * verticalFraction;
            const numBoxesHorizontal = boxVerticalIndex < rowsWithExtraHorizontalBoxes ? numBoxesPerDimension + 1 : numBoxesPerDimension;
            const horizontalFraction = Math.round(imageWidth / numBoxesHorizontal);
            for(let boxHorizontalIndex=0;boxHorizontalIndex<numBoxesHorizontal;boxHorizontalIndex++,colorIndex++){
                const xBase = boxHorizontalIndex * horizontalFraction;
                const xLimit = boxHorizontalIndex === numBoxesHorizontal - 1 ? imageWidth : (boxHorizontalIndex + 1) * horizontalFraction;
                let length = 0;
                for(let y=yBase;y<yLimit;y++){
                    for(let x=xBase;x<xLimit;x++){
                        const pixelIndex = x * 4 + y * imageWidth * 4;
                        const pixel = pixels.subarray(pixelIndex, pixelIndex+4);
                        //ignore transparent pixels
                        if(pixel[3] === 0){
                            continue;
                        }
                        for(let p=0;p<3;p++){
                            averageBuffer[p] += pixel[p];
                        }
                        length++;
                    }
                }
                const colorBaseIndex = colorIndex * 3;
                for(let p=0;p<3;p++){
                    retColors[colorBaseIndex+p] = Math.round(averageBuffer[p] / length); 
                }
                averageBuffer.fill(0);

            }
        }

        return retColors;
    }

    //Divides image into boxes, and finds average color in each box
    function spatialPopularityBoxed(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        const retColors = new Uint8Array(numColors * 3);
        const colorsSet = new Set();
        const pixelHashFunc = colorQuantization.isPerceptual ? perceptualPixel32Hash : normalizePixel32Transparency;
        const pixelArray = new Uint32Array(pixels.buffer);
        const pixelBuffer = new Uint8Array(4);
        const numBoxesPerDimension = Math.floor(Math.sqrt(numColors));
        const rowsWithExtraHorizontalBoxes = numColors - numBoxesPerDimension * numBoxesPerDimension; 
        const verticalFraction = Math.round(imageHeight / numBoxesPerDimension);

        for(let boxVerticalIndex=0,colorIndex=0;boxVerticalIndex<numBoxesPerDimension;boxVerticalIndex++){
            const yBase = boxVerticalIndex * verticalFraction;
            const yLimit = boxVerticalIndex === numBoxesPerDimension - 1 ? imageHeight : (boxVerticalIndex + 1) * verticalFraction;
            const numBoxesHorizontal = boxVerticalIndex < rowsWithExtraHorizontalBoxes ? numBoxesPerDimension + 1 : numBoxesPerDimension;
            const horizontalFraction = Math.round(imageWidth / numBoxesHorizontal);
            for(let boxHorizontalIndex=0;boxHorizontalIndex<numBoxesHorizontal;boxHorizontalIndex++,colorIndex++){
                const xBase = boxHorizontalIndex * horizontalFraction;
                const xLimit = boxHorizontalIndex === numBoxesHorizontal - 1 ? imageWidth : (boxHorizontalIndex + 1) * horizontalFraction;
                const popularityMap = new Map();
                for(let y=yBase;y<yLimit;y++){
                    for(let x=xBase;x<xLimit;x++){
                        const pixelIndex = x + y * imageWidth;
                        const pixel32 = pixelArray[pixelIndex];
                        //ignore transparent pixels
                        if((pixel32 & 0xff000000) >> 24 === 0){
                            continue;
                        }
                        incrementMap(popularityMap, pixelHashFunc(pixel32, pixelBuffer));
                    }
                }
                const sortedValues = [...popularityMap.keys()].sort((a, b)=>{
                    return popularityMap.get(b) - popularityMap.get(a);
                });
                const colorKey = getNewUniqueValueOrDefault(colorsSet, sortedValues);
                addColor32ToColors(colorKey, retColors, colorIndex);
            }
        }
        return retColors;
    }

    function perceptualPixelTransform(pixel){
        const blackThreshold = 46;
        const whiteThreshold = 240;
        if(Math.max(pixel[0], pixel[1], pixel[2]) < blackThreshold){
            pixel[0] = 0;
            pixel[1] = 0;
            pixel[2] = 0;
        }
        else if(Math.min(pixel[0], pixel[1], pixel[2]) > whiteThreshold){
            pixel[0] = 255;
            pixel[1] = 255;
            pixel[2] = 255;
        }
        return pixel;
    }
    function identity(v){
        return v;
    }

    //Divides an image into zones based on sort function, and finds the average of each color in each zone
    function sortedAverage(pixels, numColors, imageWidth, imageHeight, isPerceptual, pixelValueFunc){
        const retColors = new Uint8Array(numColors * 3);
        const averageBuffer = new Float32Array(3);
        const pixelArray = Util.pixelBuffer32ToPixelBuffer8(Util.sortPixelBuffer(pixels, pixelValueFunc));
        //it seems redundant to divide by 4 only to multiply it by 4 later, but that is because
        //we need to make sure we only select whole pixels, and not the middles of pixels
        const fraction = pixelArray.length / (numColors * 4);
        const pixelTransformFunc = isPerceptual ? perceptualPixelTransform : identity;

        for(let i=1,previousEndIndex=0;i<=numColors;i++){
            const endIndex = Math.min(Math.round(i * fraction) * 4, pixelArray.length);
            for(let j=previousEndIndex;j<endIndex;j+=4){
                const pixel = pixelTransformFunc(pixelArray.subarray(j, j+4));
                for(let p=0;p<3;p++){
                    averageBuffer[p] = averageBuffer[p] + pixel[p];
                }
            }
            const colorBaseIndex = (i - 1) * 3;
            const numPixels = (endIndex - previousEndIndex) / 4;
            for(let p=0;p<3;p++){
                retColors[colorBaseIndex+p] = Math.round(averageBuffer[p] / numPixels); 
            }
            averageBuffer.fill(0);
            previousEndIndex = endIndex;
        }
        return retColors;
    }

    //Divides an image into numColors lightness zones, and finds the average color in each zone
    function lightnessAverage(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        return sortedAverage(pixels, numColors, imageWidth, imageHeight, colorQuantization.isPerceptual, PixelMath.lightness);
    }

    //Divides an image into numColors hue zones, and finds the average color in each zone
    function hueAverage(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        return sortedAverage(pixels, numColors, imageWidth, imageHeight, colorQuantization.isPerceptual, PixelMath.hue);
    }

    return {
        popularity,
        lightnessPopularity,
        lumaPopularity,
        huePopularity,
        spatialAverageBoxed,
        lightnessAverage,
        hueAverage,
        spatialPopularityBoxed,
    };
})(App.PixelMath, App.OptimizePaletteUtil);