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
            gMin = Math.min(pixel[0], gMin);
            gMax = Math.max(pixel[0], gMax);
            bMin = Math.min(pixel[0], bMin);
            bMax = Math.max(pixel[0], bMax);
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

    function extractMedians(pixelArray, numCuts, divisionSize){
        const numColors = Math.pow(2, numCuts);
        let ret = [];

        for(let i=0,currentColor=1;currentColor<=numColors;i+=divisionSize,currentColor++){
            let endIndex = i+divisionSize;
            if(currentColor === numColors){
                endIndex = pixelArray.length;
            }
            const medianIndex = Math.floor((endIndex - i) / 2) + i;
            ret.push(pixelArray[medianIndex]);
        }
        return ret;
    }

    function extractAverages(pixelArray, numCuts, divisionSize){
        const numColors = Math.pow(2, numCuts);

        let ret = [];

        for(let i=0,currentColor=1;currentColor<=numColors;i+=divisionSize,currentColor++){
            let endIndex = i+divisionSize;
            if(currentColor === numColors){
                endIndex = pixelArray.length;
            }
            let pixelAvg = new Float32Array(3);
            const pixelCount = endIndex - i;
            for(let j=i;j<endIndex;j++){
                let pixel = pixelArray[j];
                pixelAvg[0] = pixelAvg[0] + pixel[0];
                pixelAvg[1] = pixelAvg[1] + pixel[1];
                pixelAvg[2] = pixelAvg[2] + pixel[2];
            }
            let retPixel = new Uint8ClampedArray(3);
            retPixel[0] = Math.round(pixelAvg[0] / pixelCount);
            retPixel[1] = Math.round(pixelAvg[1] / pixelCount);
            retPixel[2] = Math.round(pixelAvg[2] / pixelCount);
            ret.push(retPixel);
        }
        return ret;
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
        let ret = new Array(numColors);
        medianPixels = medianPixels.sort((pixel1, pixel2)=>{
            return PixelMath.lightness(pixel1) - PixelMath.lightness(pixel2);
        });
        medianPixels = removeDuplicatePixelsWithinLimit(medianPixels, numColors);
        if(medianPixels.length === numColors){
            return medianPixels;
        }

        ret[0] = medianPixels[0];
        ret[ret.length - 1] = medianPixels[medianPixels.length - 1];

        let offset = Math.floor((medianPixels.length - ret.length) / 2);
        for(let i=1,pixelArrayOffset=offset;i<ret.length-1;i++,pixelArrayOffset++){
            ret[i] = medianPixels[pixelArrayOffset];
        }
        return ret;
    }

    function medianCut(pixels, numColors, colorQuantization, _imageWidth, _imageHeight){
        //get number of times we need to divide pixels in half and sort
        const numCuts = Math.ceil(Math.log2(numColors));
        let pixelArray = Util.createPixelArray(pixels);

        let divisions = 1;
        let finalDivisionSize = 0;
        for(let i=0;i<=numCuts;i++){
            const divisionSize = Math.round(pixelArray.length / divisions);
            finalDivisionSize = divisionSize;
            for(let j=0, currentDivision=1;currentDivision<=divisions;j+=divisionSize,currentDivision++){
                let endIndex = j+divisionSize;
                //last index might not be slighty smaller or larger than necessary,
                //so set it to array length to be sure
                if(currentDivision === divisions){
                    endIndex = pixelArray.length;
                }
                sortOnLongestAxis(pixelArray.slice(j, endIndex));
            }
            divisions *= 2;
        }
        let medianColors = colorQuantization.key.endsWith('MEDIAN') ? extractMedians(pixelArray, numCuts, finalDivisionSize) : extractAverages(pixelArray, numCuts, finalDivisionSize);
        if(medianColors.length > numColors){
            medianColors = mergeMedians(medianColors, numColors);
        }

        return pixelArrayToBuffer(medianColors);
    }

    return {
        medianCut,
    };
})(App.PixelMath, App.OptimizePaletteUtil);