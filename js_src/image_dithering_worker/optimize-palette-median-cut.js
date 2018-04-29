/**
 * Color quantization vanilla median cut algorithm
*/
App.OptimizePaletteMedianCut = (function(PixelMath, Util){
    function findLongestAxis(pixels){
        let rMin = 256;
        let rMax = -1;
        let gMin = 256;
        let gMax = -1;
        let bMin = 256;
        let bMax = -1;
        pixels.forEach((pixel)=>{
            rMin = Math.min(pixel[0], rMin);
            rMax = Math.max(pixel[0], rMax);
            gMin = Math.min(pixel[1], gMin);
            gMax = Math.max(pixel[1], gMax);
            bMin = Math.min(pixel[2], bMin);
            bMax = Math.max(pixel[2], bMax);
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

    function sortOnLongestAxis(pixels){
        const sortIndex = findLongestAxis(pixels);
        return pixels.sort((a, b)=>{
            return a[sortIndex] - b[sortIndex];
        });
    }

    function pixelArrayAverage(pixelArray){
        let pixelAvg = new Float32Array(3);
        pixelArray.forEach((pixel)=>{
            pixelAvg[0] = pixelAvg[0] + pixel[0];
            pixelAvg[1] = pixelAvg[1] + pixel[1];
            pixelAvg[2] = pixelAvg[2] + pixel[2];
        });
        let retPixel = new Uint8ClampedArray(3);
        retPixel[0] = Math.round(pixelAvg[0] / pixelArray.length);
        retPixel[1] = Math.round(pixelAvg[1] / pixelArray.length);
        retPixel[2] = Math.round(pixelAvg[2] / pixelArray.length);
        return retPixel;
    }

    function pixelArrayMedian(pixelArray){
        return pixelArray[Math.floor(pixelArray.length / 2)];
    }

    function pixelArrayToBuffer(pixelArray){
        let ret = new Uint8Array(pixelArray.length * 3);
        for(let i=0,offset=0;i<pixelArray.length;i++, offset+=3){
            const pixel = pixelArray[i];
            ret[offset] = pixel[0];
            ret[offset+1] = pixel[1];
            ret[offset+2] = pixel[2];
        }

        return ret;
    }

    function removeDuplicatePixelsWithinLimit(pixelArray, minSize){
        function pixelKey(pixel){
            return `${pixel[0]}-${pixel[1]}-${pixel[2]}`;
        }
        let ret = [];
        let keys = {};
        const maxSkipped = pixelArray.length - minSize;
        let numSkipped = 0;

        pixelArray.forEach((pixel)=>{
            if(numSkipped < maxSkipped){
                const key = pixelKey(pixel);
                if(keys[key]){
                    numSkipped++;
                    return;
                }
                keys[key] = true;
            }
            ret.push(pixel);
        });

        return ret;
    }

    //prune colors by taking darkest and lightest colors
    //and middle lightest colors
    function mergeMedians(medianPixels, numColors){
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

    function medianCut(pixels, numColors, colorQuantization, _imageWidth, _imageHeight){
        //find nearest power of 2 that is greater than the number of colors
        const numCuts = Math.pow(2, Math.ceil(Math.log2(numColors)));

        let cuts = [Util.createPixelArray(pixels)];

        while(cuts.length != numCuts){
            let newCuts = [];
            cuts.forEach((cut)=>{
                sortOnLongestAxis(cut);
                const half = Math.ceil(cut.length / 2);
                newCuts.push(cut.slice(0, half));
                newCuts.push(cut.slice(half, cut.length));
            });
            cuts = newCuts;
        }

        let extractColorFunc = pixelArrayAverage;
        if(colorQuantization.key.endsWith('MEDIAN')){
            //only have to sort 1 last time if we are taking the median, since for average the order doesn't matter
            extractColorFunc = (cut) =>{
                return pixelArrayMedian(sortOnLongestAxis(cut));
            };
        }
        let colors = cuts.map((cut)=>{
            return extractColorFunc(cut);
        });

        if(colors.length > numColors){
            colors = mergeMedians(colors, numColors);
        }

        return pixelArrayToBuffer(colors);
    }

    return {
        medianCut,
    };
})(App.PixelMath, App.OptimizePaletteUtil);