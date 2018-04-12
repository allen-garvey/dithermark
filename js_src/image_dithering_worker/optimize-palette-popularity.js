/**
 * Color quantization popularity algorithms
*/
App.OptimizePalettePopularity = (function(PixelMath){
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
        if(r < blackThreshold && g < blackThreshold && b < blackThreshold){
            return '0-0-0';
        }
        if(r > whiteThreshold && g > whiteThreshold && b > whiteThreshold){
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

    function popularity(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        let retColors = new Uint8Array(numColors * 3);
        let colorsSet = new Set();
        const fraction = pixels.length / (numColors * 4);
        let pixelHashFunc = pixelHash;
        if(colorQuantization.key.startsWith('PERCEPTUAL')){
            pixelHashFunc = perceptualPixelHash;
        }
        if(colorQuantization.key.endsWith('VERTICAL')){
            pixels = rotatePixels90Degrees(pixels, imageWidth, imageHeight);
        }

        for(let i=1,previousEndIndex=0;i<=numColors;i++){
            const endIndex = Math.round(i * fraction) * 4;
            const pixelSubarray = pixels.subarray(previousEndIndex, endIndex);
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

    return {
        popularity,
    };
})(App.PixelMath);