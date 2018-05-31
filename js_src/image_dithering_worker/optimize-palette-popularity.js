/**
 * Color quantization popularity algorithms
*/
App.OptimizePalettePopularity = (function(PixelMath, Util){
    function rotatePixels90Degrees(pixels, imageWidth, imageHeight){
        //not really necessary to copy alpha values as well, but this complicates
        //the logic for the horizontal case, so we will leave them in
        const length = pixels.length;
        let ret = new Uint8Array(length);

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
        let popularityMap = new Map();

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
        let colorSplit = colorKey.split('-');
        const startIndex = index * 3;

        colors[startIndex] = parseInt(colorSplit[0]);
        colors[startIndex+1] = parseInt(colorSplit[1]);
        colors[startIndex+2] = parseInt(colorSplit[2]);
    }

    //divides an image into numColors horizontal or vertical strips, and finds the most
    //popular color in each strip
    function popularity(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        let retColors = new Uint8Array(numColors * 3);
        let colorsSet = new Set();
        let pixelHashFunc = pixelHash;
        if(colorQuantization.isPerceptual){
            pixelHashFunc = perceptualPixelHash;
        }
        if(colorQuantization.isVertical){
            pixels = rotatePixels90Degrees(pixels, imageWidth, imageHeight);
        }
        //remove transparent pixels
        let pixelsFiltered = Util.filterTransparentPixels(pixels);
        const fraction = pixelsFiltered.length / (numColors * 4);

        for(let i=1,previousEndIndex=0;i<=numColors;i++){
            const endIndex = Math.round(i * fraction) * 4;
            //don't need to check if endIndex is too large, since subarray will just return as much as it can if it is
            const pixelSubarray = pixelsFiltered.subarray(previousEndIndex, endIndex);
            let popularityMap = createPopularityMap(pixelSubarray, pixelHashFunc);
            let sortedValues = [...popularityMap.keys()].sort((a, b)=>{
                return popularityMap.get(b) - popularityMap.get(a);
            });
            let colorKey = getNewUniqueValueOrDefault(colorsSet, sortedValues);
            addColorToColors(colorKey, retColors, i-1);

            previousEndIndex = endIndex;
        }
        return retColors;
    }

    //Divides an image into zones based on sort function, and finds the most popular color in each zome
    function sortedPopularity(pixels, numColors, imageWidth, imageHeight, isPerceptual, pixelSortFunc){
        let retColors = new Uint8Array(numColors * 3);
        let colorsSet = new Set();
        let pixelHashFunc = pixelHash;
        if(isPerceptual){
            pixelHashFunc = perceptualPixelHash;
        }
        let pixelArray = Util.createPixelArray(pixels).sort(pixelSortFunc);

        const fraction = pixelArray.length / (numColors * 4);

        for(let i=1,previousEndIndex=0;i<=numColors;i++){
            const endIndex = Math.min(Math.round(i * fraction) * 4, pixelArray.length);
            let popularityMap = new Map();
            for(let j=previousEndIndex;j<endIndex;j++){
                let pixel = pixelArray[j];
                incrementMap(popularityMap, pixelHashFunc(pixel[0], pixel[1], pixel[2]));
            }
            let sortedValues = [...popularityMap.keys()].sort((a, b)=>{
                return popularityMap.get(b) - popularityMap.get(a);
            });
            let colorKey = getNewUniqueValueOrDefault(colorsSet, sortedValues);
            addColorToColors(colorKey, retColors, i-1);

            previousEndIndex = endIndex;
        }
        return retColors;
    }

    //Divides an image into numColors lightness zones, and finds the most popular color in each zone
    function lightnessPopularity(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        return sortedPopularity(pixels, numColors, imageWidth, imageHeight, colorQuantization.isPerceptual, (a, b)=>{
            return PixelMath.lightness(a) - PixelMath.lightness(b);
        });
    }

    //Divides an image into numColors hue zones, and finds the most popular color in each zone
    function huePopularity(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        return sortedPopularity(pixels, numColors, imageWidth, imageHeight, colorQuantization.isPerceptual, (a, b)=>{
            const hueDiff = PixelMath.hue(a) - PixelMath.hue(b); 
            if(hueDiff === 0){
                return PixelMath.lightness(a) - PixelMath.lightness(b);
            }
            return hueDiff;
        });
    }

    return {
        popularity,
        lightnessPopularity,
        huePopularity,
    };
})(App.PixelMath, App.OptimizePaletteUtil);