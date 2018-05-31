/**
 * Color quantization popularity algorithms
*/
App.OptimizePalettePopularity = (function(PixelMath, Util){
    function rotatePixels90Degrees(pixels, imageWidth, imageHeight){
        //not really necessary to copy alpha values as well, but this complicates
        //the logic for the horizontal case, so we will leave them in
        const length = pixels.length;
        const ret = new Uint8Array(length);

        const rowPixelLength = imageWidth * 4;
        let retIndex = 0;
        for(let x=0;x<rowPixelLength;x+=4){
            for(let y=0;y<length;y+=rowPixelLength){
                const offset = y+x;
                ret[retIndex++] = pixels[offset];
                ret[retIndex++] = pixels[offset+1];
                ret[retIndex++] = pixels[offset+2];
                ret[retIndex++] = pixels[offset+3];
            }
        }
        return ret;
    }

    function pixelHash(r, g, b){
        return `${r}-${g}-${b}`;
    }
    //avoid having too many perceptually identical shades of black or white
    function perceptualPixelHash(r, g, b){
        const blackThreshold = 46;
        const whiteThreshold = 240;
        if(Math.max(r,g,b) < blackThreshold){
            return '0-0-0';
        }
        if(Math.min(r,g,b) > whiteThreshold){
            return '255-255-255';
        }
        return pixelHash(r, g, b);
    }
    function incrementMap(map, key){
        let value = 1;
        if(map.has(key)){
            value = map.get(key) + 1;
        }
        map.set(key, value);
    }
    function createPopularityMap(pixels, pixelHashFunc){
        const popularityMap = new Map();

        for(let i=0;i<pixels.length;i+=4){
            //ignore transparent pixels
            if(pixels[i+3] === 0){
                continue;
            }
            incrementMap(popularityMap, pixelHashFunc(pixels[i], pixels[i+1], pixels[i+2]));
        }
        return popularityMap;
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

    function addColorToColors(colorKey, colors, index){
        const colorSplit = colorKey.split('-');
        const startIndex = index * 3;

        colors[startIndex] = parseInt(colorSplit[0]);
        colors[startIndex+1] = parseInt(colorSplit[1]);
        colors[startIndex+2] = parseInt(colorSplit[2]);
    }

    //divides an image into numColors horizontal or vertical strips, and finds the most
    //popular color in each strip
    function popularity(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        const retColors = new Uint8Array(numColors * 3);
        const colorsSet = new Set();
        const pixelHashFunc = colorQuantization.isPerceptual ? perceptualPixelHash : pixelHash;
        if(colorQuantization.isVertical){
            pixels = rotatePixels90Degrees(pixels, imageWidth, imageHeight);
        }
        //remove transparent pixels
        const pixelsFiltered = Util.filterTransparentPixels(pixels);
        const fraction = pixelsFiltered.length / (numColors * 4);

        for(let i=1,previousEndIndex=0;i<=numColors;i++){
            const endIndex = Math.round(i * fraction) * 4;
            //don't need to check if endIndex is too large, since subarray will just return as much as it can if it is
            const pixelSubarray = pixelsFiltered.subarray(previousEndIndex, endIndex);
            const popularityMap = createPopularityMap(pixelSubarray, pixelHashFunc);
            const sortedValues = [...popularityMap.keys()].sort((a, b)=>{
                return popularityMap.get(b) - popularityMap.get(a);
            });
            const colorKey = getNewUniqueValueOrDefault(colorsSet, sortedValues);
            addColorToColors(colorKey, retColors, i-1);

            previousEndIndex = endIndex;
        }
        return retColors;
    }

    //Divides an image into zones based on sort function, and finds the most popular color in each zome
    function sortedPopularity(pixels, numColors, imageWidth, imageHeight, isPerceptual, pixelSortFunc){
        const retColors = new Uint8Array(numColors * 3);
        const colorsSet = new Set();
        const pixelHashFunc = isPerceptual ? perceptualPixelHash : pixelHash;
        const pixelArray = Util.createPixelArray(pixels).sort(pixelSortFunc);

        const fraction = pixelArray.length / (numColors * 4);

        for(let i=1,previousEndIndex=0;i<=numColors;i++){
            const endIndex = Math.min(Math.round(i * fraction) * 4, pixelArray.length);
            const popularityMap = new Map();
            for(let j=previousEndIndex;j<endIndex;j++){
                const pixel = pixelArray[j];
                incrementMap(popularityMap, pixelHashFunc(pixel[0], pixel[1], pixel[2]));
            }
            const sortedValues = [...popularityMap.keys()].sort((a, b)=>{
                return popularityMap.get(b) - popularityMap.get(a);
            });
            const colorKey = getNewUniqueValueOrDefault(colorsSet, sortedValues);
            addColorToColors(colorKey, retColors, i-1);

            previousEndIndex = endIndex;
        }
        return retColors;
    }

    //Divides an image into numColors lightness zones, and finds the most popular color in each zone
    function lightnessPopularity(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        return sortedPopularity(pixels, numColors, imageWidth, imageHeight, colorQuantization.isPerceptual, (a, b)=>{
            return PixelMath.lightness(a) - PixelMath.lightness(b) || PixelMath.hue(a) - PixelMath.hue(b);
        });
    }

    //Divides an image into numColors hue zones, and finds the most popular color in each zone
    function huePopularity(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        return sortedPopularity(pixels, numColors, imageWidth, imageHeight, colorQuantization.isPerceptual, (a, b)=>{
            return PixelMath.hue(a) - PixelMath.hue(b) || PixelMath.lightness(a) - PixelMath.lightness(b);
        });
    }


    //Divides image into horizontal or vertical strips, and finds average color in each strip
    function spatialAverage(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        const retColors = new Uint8Array(numColors * 3);
        const averageBuffer = new Float32Array(3);
        if(colorQuantization.isVertical){
            pixels = rotatePixels90Degrees(pixels, imageWidth, imageHeight);
        }
        //remove transparent pixels
        const pixelsFiltered = Util.filterTransparentPixels(pixels);
        const fraction = pixelsFiltered.length / (numColors * 4);

        for(let i=1,previousEndIndex=0;i<=numColors;i++){
            const endIndex = Math.round(i * fraction) * 4;
            //don't need to check if endIndex is too large, since subarray will just return as much as it can if it is
            const pixelSubarray = pixelsFiltered.subarray(previousEndIndex, endIndex);
            const subarrayLength = pixelSubarray.length;
            for(let j=0;j<subarrayLength;j+=4){
                const pixel = pixelSubarray.subarray(j, j+4);
                for(let p=0;p<3;p++){
                    averageBuffer[p] = averageBuffer[p] + pixel[p];
                }
            }
            const colorBaseIndex = (i - 1) * 3;
            for(let p=0;p<3;p++){
                retColors[colorBaseIndex+p] = Math.round(averageBuffer[p] / subarrayLength); 
                averageBuffer[p] = 0;
            }
            previousEndIndex = endIndex;
        }
        return retColors;
    }

    //Divides image into boxes, and finds average color in each box
    function spatialAverageBoxed(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        const retColors = new Uint8Array(numColors * 3);
        const averageBuffer = new Float32Array(3);
        const boxBase = Math.sqrt(numColors);
        const numBoxesVertical = Math.ceil(boxBase);
        const numBoxesHorizontal = Math.floor(boxBase);
        const horizontalFraction = Math.round(imageWidth / numBoxesHorizontal);
        const verticalFraction = Math.round(imageHeight / numBoxesVertical);

        for(let boxVerticalIndex=0,colorIndex=0;boxVerticalIndex<numBoxesVertical;boxVerticalIndex++){
            const yBase = boxVerticalIndex * verticalFraction;
            const yLimit = boxVerticalIndex === numBoxesVertical - 1 ? imageHeight : (boxVerticalIndex + 1) * verticalFraction;
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
                            averageBuffer[p] = averageBuffer[p] + pixel[p];
                        }
                        length++;
                    }
                }
                const colorBaseIndex = colorIndex * 3;
                for(let p=0;p<3;p++){
                    retColors[colorBaseIndex+p] = Math.round(averageBuffer[p] / length); 
                    averageBuffer[p] = 0;
                }

            }
        }

        return retColors;
    }

    //Divides image into boxes, and finds average color in each box
    function spatialPopularityBoxed(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        const retColors = new Uint8Array(numColors * 3);
        const colorsSet = new Set();
        const pixelHashFunc = colorQuantization.isPerceptual ? perceptualPixelHash : pixelHash;
        const boxBase = Math.sqrt(numColors);
        const numBoxesVertical = Math.ceil(boxBase);
        const numBoxesHorizontal = Math.floor(boxBase);
        const horizontalFraction = Math.round(imageWidth / numBoxesHorizontal);
        const verticalFraction = Math.round(imageHeight / numBoxesVertical);

        for(let boxVerticalIndex=0,colorIndex=0;boxVerticalIndex<numBoxesVertical;boxVerticalIndex++){
            const yBase = boxVerticalIndex * verticalFraction;
            const yLimit = boxVerticalIndex === numBoxesVertical - 1 ? imageHeight : (boxVerticalIndex + 1) * verticalFraction;
            for(let boxHorizontalIndex=0;boxHorizontalIndex<numBoxesHorizontal;boxHorizontalIndex++,colorIndex++){
                const xBase = boxHorizontalIndex * horizontalFraction;
                const xLimit = boxHorizontalIndex === numBoxesHorizontal - 1 ? imageWidth : (boxHorizontalIndex + 1) * horizontalFraction;
                const popularityMap = new Map();
                for(let y=yBase;y<yLimit;y++){
                    for(let x=xBase;x<xLimit;x++){
                        const pixelIndex = x * 4 + y * imageWidth * 4;
                        const pixel = pixels.subarray(pixelIndex, pixelIndex+4);
                        //ignore transparent pixels
                        if(pixel[3] === 0){
                            continue;
                        }
                        incrementMap(popularityMap, pixelHashFunc(pixel[0], pixel[1], pixel[2]));
                    }
                }
                const sortedValues = [...popularityMap.keys()].sort((a, b)=>{
                    return popularityMap.get(b) - popularityMap.get(a);
                });
                const colorKey = getNewUniqueValueOrDefault(colorsSet, sortedValues);
                addColorToColors(colorKey, retColors, colorIndex);
            }
        }
        console.log(retColors);
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
    function sortedAverage(pixels, numColors, imageWidth, imageHeight, isPerceptual, pixelSortFunc){
        const retColors = new Uint8Array(numColors * 3);
        const averageBuffer = new Float32Array(3);
        const pixelArray = Util.createPixelArray(pixels).sort(pixelSortFunc);
        const fraction = pixelArray.length / (numColors * 4);
        const pixelTransformFunc = isPerceptual ? perceptualPixelTransform : identity;

        for(let i=1,previousEndIndex=0;i<=numColors;i++){
            const endIndex = Math.min(Math.round(i * fraction) * 4, pixelArray.length);
            for(let j=previousEndIndex;j<endIndex;j++){
                const pixel = pixelTransformFunc(pixelArray[j]);
                for(let p=0;p<3;p++){
                    averageBuffer[p] = averageBuffer[p] + pixel[p];
                }
            }
            const colorBaseIndex = (i - 1) * 3;
            for(let p=0;p<3;p++){
                retColors[colorBaseIndex+p] = Math.round(averageBuffer[p] / (endIndex - previousEndIndex)); 
                averageBuffer[p] = 0;
            }

            previousEndIndex = endIndex;
        }
        return retColors;
    }

    //Divides an image into numColors lightness zones, and finds the average color in each zone
    function lightnessAverage(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        return sortedAverage(pixels, numColors, imageWidth, imageHeight, colorQuantization.isPerceptual, (a, b)=>{
            return PixelMath.lightness(a) - PixelMath.lightness(b) || PixelMath.hue(a) - PixelMath.hue(b);
        });
    }

    //Divides an image into numColors hue zones, and finds the average color in each zone
    function hueAverage(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        return sortedAverage(pixels, numColors, imageWidth, imageHeight, colorQuantization.isPerceptual, (a, b)=>{
            return PixelMath.hue(a) - PixelMath.hue(b) || PixelMath.lightness(a) - PixelMath.lightness(b);
        });
    }

    return {
        popularity,
        lightnessPopularity,
        huePopularity,
        spatialAverage,
        spatialAverageBoxed,
        lightnessAverage,
        hueAverage,
        spatialPopularityBoxed,
    };
})(App.PixelMath, App.OptimizePaletteUtil);