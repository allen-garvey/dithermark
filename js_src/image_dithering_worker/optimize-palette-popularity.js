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

    const CRUSHED_BLACK_THRESHOLD = 46;
    const CRUSHED_WHITE_THRESHOLD = 240;
    function perceptualPixel32Hash(pixel32, pixelBuffer){
        pixelBuffer[0] = (pixel32 & 0xff);
        pixelBuffer[1] = (pixel32 & 0xff00) >> 8;
        pixelBuffer[2] = (pixel32 & 0xff0000) >> 16;

        if(Math.max(pixelBuffer[0], pixelBuffer[1], pixelBuffer[2]) < CRUSHED_BLACK_THRESHOLD){
            return 0xff000000;
        }
        if(Math.min(pixelBuffer[0], pixelBuffer[1], pixelBuffer[2]) > CRUSHED_WHITE_THRESHOLD){
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
        let pixelArray;
        if(colorQuantization.isVertical){
            //rotating creates a new copy, so we don't need to copy pixels
            pixelArray = rotatePixels32Clockwise(new Uint32Array(pixels.buffer), imageWidth, imageHeight);
        }
        else{
            //need to copy pixels so we don't modify it
            pixelArray = new Uint32Array(new Uint8Array(pixels).buffer);
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
        //need to copy pixels so we don't modify it
        const pixelArray = Util.sortPixelBuffer(new Uint8Array(pixels), pixelValueFunc);
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
    //there is no perceptual (crushed) version, since it is basically indistinguishable from regular
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
                        //ignore transparent pixels
                        if(pixels[pixelIndex+3] === 0){
                            continue;
                        }
                        //it is much faster to use array index directly, instead of using subarray
                        averageBuffer[0] += pixels[pixelIndex];
                        averageBuffer[1] += pixels[pixelIndex+1];
                        averageBuffer[2] += pixels[pixelIndex+2];
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
        //need to copy pixels so we don't modify it
        const pixelArray = new Uint32Array(new Uint8Array(pixels).buffer);
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

    function incrementAverage(color32, averageBuffer){
        averageBuffer[0] += (color32 & 0xff);
        averageBuffer[1] += (color32 & 0xff00) >> 8;
        averageBuffer[2] += (color32 & 0xff0000) >> 16;
    }

    function incrementAverageCrushed(color32, averageBuffer){
        const r = (color32 & 0xff);
        const g = (color32 & 0xff00) >> 8;
        const b = (color32 & 0xff0000) >> 16;
        //don't need to do anything, since we would just be adding 0
        if(Math.max(r,g,b) < CRUSHED_BLACK_THRESHOLD){
            return;
        }
        if(Math.min(r,g,b) > CRUSHED_WHITE_THRESHOLD){
            averageBuffer[0] += 255;
            averageBuffer[1] += 255;
            averageBuffer[2] += 255;
            return;
        }
        averageBuffer[0] += r;
        averageBuffer[1] += g;
        averageBuffer[2] += b;
    }

    //Divides an image into zones based on sort function, and finds the average of each color in each zone
    function sortedAverage(pixels, numColors, imageWidth, imageHeight, isPerceptual, pixelValueFunc){
        const retColors = new Uint8Array(numColors * 3);
        const averageBuffer = new Float32Array(3);
        //need to copy pixels so we don't modify it
        const pixelArray = Util.sortPixelBuffer(new Uint8Array(pixels), pixelValueFunc);
        const fraction = pixelArray.length / numColors ;
        const incrementAverageFunc = isPerceptual ? incrementAverageCrushed : incrementAverage;

        for(let i=1,previousEndIndex=0;i<=numColors;i++){
            const endIndex = Math.min(Math.round(i * fraction), pixelArray.length);
            let numPixels = 0;
            for(let j=previousEndIndex;j<endIndex;j+=4){
                const color32 = pixelArray[j];
                //ignore transparent pixels
                if((color32 & 0xff000000) >> 24 === 0){
                    continue;
                }
                incrementAverageFunc(color32, averageBuffer);
                numPixels++;
            }
            const colorBaseIndex = (i - 1) * 3;
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