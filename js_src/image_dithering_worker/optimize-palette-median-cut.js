/**
 * Color quantization vanilla median cut algorithm
*/
App.OptimizePaletteMedianCut = (function(PixelMath, Util){
    function color32Red(color32){
        return (color32 & 0xff);
    }
    function color32Green(color32){
        return (color32 & 0xff00) >> 8;
    }
    function color32Blue(color32){
        return (color32 & 0xff0000) >> 16;
    }

    function colorValueFuncForColorIndex(colorIndex){
        switch(colorIndex){
            case 0:
                return color32Red;
            case 1:
                return color32Green;
            default:
                return color32Blue;
        }
    }

    function findLongestAxis32(pixels32){
        let rMin = 256;
        let rMax = -1;
        let gMin = 256;
        let gMax = -1;
        let bMin = 256;
        let bMax = -1;
        pixels32.forEach((color32)=>{
            rMin = Math.min(color32Red(color32), rMin);
            rMax = Math.max(color32Red(color32), rMax);
            gMin = Math.min(color32Green(color32), gMin);
            gMax = Math.max(color32Green(color32), gMax);
            bMin = Math.min(color32Blue(color32), bMin);
            bMax = Math.max(color32Blue(color32), bMax);
        });
        const rRange = rMax - rMin;
        const gRange = gMax - gMin;
        const bRange = bMax - bMin;
        const maxRange = Math.max(rRange, gRange, bRange);

        //prioritized by g, r, b, since the eye is most sensitive to values in that order
        switch(maxRange){
            case gRange:
                return 1;
            case rRange:
                return 0;
            //blue
            default:
                return 2;
        }
    }

    //despite being a more effecient algorithm as well as
    //being a stable sort, counting sort is actually slower than
    //sort(), so only use it for median, where we need a stable sort
    function stableSortOnLongestAxis(pixels32){
        const sortIndex = findLongestAxis32(pixels32);
        const colorValueFunc = colorValueFuncForColorIndex(sortIndex);
        return Util.countingSort32(pixels32, colorValueFunc);
    }

    function pixelArray32Average(pixelArray){
        const pixelAvg = new Float32Array(3);
        pixelArray.forEach((color32)=>{
            pixelAvg[0] += color32Red(color32);
            pixelAvg[1] += color32Green(color32);
            pixelAvg[2] += color32Blue(color32);
        });
        const retPixel = new Uint8ClampedArray(3);
        const numPixels = pixelArray.length;
        retPixel[0] = Math.round(pixelAvg[0] / numPixels);
        retPixel[1] = Math.round(pixelAvg[1] / numPixels);
        retPixel[2] = Math.round(pixelAvg[2] / numPixels);
        return retPixel;
    }

    function pixelArrayMedian(pixelArray){
        const pixelBuffer = new Uint8Array(3);
        const color32 = pixelArray[Math.floor(pixelArray.length / 2)];
        
        pixelBuffer[0] = (color32 & 0xff);
        pixelBuffer[1] = (color32 & 0xff00) >> 8;
        pixelBuffer[2] = (color32 & 0xff0000) >> 16;

        return pixelBuffer;
    }

    function removeDuplicatePixelsWithinLimit(pixelArray, minSize){
        function pixelKey(pixel){
            return pixel[0] + pixel[1] * 256 + pixel[2] * 256 * 256;
        }
        let ret = [];
        let keys = new Set();
        const maxSkipped = pixelArray.length - minSize;
        let numSkipped = 0;

        pixelArray.forEach((pixel)=>{
            if(numSkipped < maxSkipped){
                const key = pixelKey(pixel);
                if(keys.has(key)){
                    numSkipped++;
                    return;
                }
                keys.add(key);
            }
            ret.push(pixel);
        });

        return ret;
    }

    //prune colors by taking darkest and lightest colors
    //and middle lightest colors
    function reduceColors(medianPixels, numColors){
        medianPixels = removeDuplicatePixelsWithinLimit(medianPixels, numColors);
        if(medianPixels.length === numColors){
            return medianPixels;
        }
        let ret = new Array(numColors);
        medianPixels = medianPixels.sort((pixel1, pixel2)=>{
            return PixelMath.lightness(pixel1) - PixelMath.lightness(pixel2);
        });

        ret[0] = medianPixels[0];
        ret[ret.length - 1] = medianPixels[medianPixels.length - 1];

        let offset = Math.floor((medianPixels.length - ret.length) / 2);
        for(let i=1,pixelArrayOffset=offset;i<ret.length-1;i++,pixelArrayOffset++){
            ret[i] = medianPixels[pixelArrayOffset];
        }
        return ret;
    }

    function createPixel32ArrayFromVisible(pixels){
        const pixelBuffer = new Uint32Array(pixels.buffer);
        const length = pixelBuffer.length;
        const pixels32 = new Uint32Array(length);
        let numVisiblePixels = 0;
        
        for(let i=0;i<length;i++){
            const color32 = pixelBuffer[i];
            //ignore transparent pixels
            if((color32 & 0xff000000) >> 24 === 0){
                continue;
            }
            pixels32[numVisiblePixels++] = color32;
        }

        return pixels32.subarray(0, numVisiblePixels);
    }


    function medianCut(pixels, numColors, colorQuantization, _imageWidth, _imageHeight, progressCallback){
        //find nearest power of 2 that is greater than the number of colors
        const numCuts = Math.pow(2, Math.ceil(Math.log2(numColors)));

        let cuts = [createPixel32ArrayFromVisible(pixels)];
        //approximately 10% done
        progressCallback(10);
        while(cuts.length != numCuts){
            const newCuts = [];
            cuts.forEach((cut)=>{
                cut = stableSortOnLongestAxis(cut);
                const half = Math.ceil(cut.length / 2);
                newCuts.push(cut.subarray(0, half));
                newCuts.push(cut.subarray(half, cut.length));
            });
            cuts = newCuts;
        }

        let colors;
        if(colorQuantization.isMedian){
            //only have to sort 1 last time since we are taking the median
            colors = cuts.map((cut)=>{
                return pixelArrayMedian(stableSortOnLongestAxis(cut));
            });
        }
        else{
            colors = cuts.map((cut)=>{
                return pixelArray32Average(cut);
            });
        }

        if(colors.length > numColors){
            colors = reduceColors(colors, numColors);
        }

        return Util.pixelArrayToBuffer(colors);
    }

    return {
        medianCut,
    };
})(App.PixelMath, App.OptimizePaletteUtil);