App.OptimizePalette = (function(Pixel, PixelMath, ColorQuantizationModes){
    
    function createPopularityMap(pixels, numColors, numDistinctValues, pixelValueFunc){
        let popularityMap = new Float32Array(numDistinctValues);
        let count = 0;
        for(let i=0;i<pixels.length;i+=4){
            let pixel = pixels.subarray(i, i+5);
            //ignore transparent pixels
            if(pixel[3] === 0){
                continue;
            }
            let pixelValue = pixelValueFunc(pixel);
            if(pixelValue === null){
                continue;
            }
            // if(pixelValue < 0 || pixelValue >= popularityMap.length || typeof pixelValue !== 'number' || isNaN(pixelValue)){
            //     console.log(`pixel value out of range ${pixelValue}/${numDistinctValues}`);
            // }
            popularityMap[pixelValue] = popularityMap[pixelValue] + 1;
            count++;
        }

        //find minimum and maximum values in map
        let valueMin = 0;
        let valueMax = numDistinctValues - 1;
        for(let i=0;i<popularityMap.length;i++){
            if(popularityMap[i] > 0){
                valueMin = i;
                break;   
            }
        }
        
        for(let i=popularityMap.length-1;i>=0;i--){
            if(popularityMap[i] > 0){
                valueMax = i;
                break;   
            }
        }

        return {
            map: popularityMap,
            count: count,
            valueMin: valueMin,
            valueMax: valueMax,
        };
    }


    //finds n ranges, where each range contains the either the same number of pixels, or the number of pixel size can
    //increase by some amount, such as logarithmically. Then the average value in each range is used
    function medianPopularityBase(popularityMapObject, numColors, numDistinctValues, bucketCapacityFunc=null){
        let popularityMap = popularityMapObject.map.slice();

        let bucketsAverage = numDistinctValues <= 255 ? new Uint8Array(numColors) : new Uint16Array(numColors);
        let bucketsMedian = bucketsAverage.slice();
        //minimum number of pixels for each bucket
        if(!bucketCapacityFunc){
            bucketCapacityFunc = (numPixels, numBuckets, currentBucketNum, previousBucketCapacity)=>{
                return Math.ceil(numPixels / numBuckets);
            };
        }
        let bucketMaxCapacity = 0;
        let mapIndex = 0;
        const numPixelsUsed = popularityMapObject.count;
        let previousMedianValue = 0;
        let currentMedianValue = 0;

        for(let bucketIndex=0;bucketIndex<bucketsAverage.length;bucketIndex++){
            let bucketCount = 0;
            let bucketTotal = 0;
            let isLastBucket = bucketIndex === bucketsAverage.length - 1;
            bucketMaxCapacity = bucketCapacityFunc(numPixelsUsed, bucketsAverage.length, bucketIndex, bucketMaxCapacity);
            
            for(;mapIndex<popularityMap.length;mapIndex++){
                const bucketLimit = bucketMaxCapacity - bucketCount;
                let shouldBreak = false;
                const mapValue = popularityMap[mapIndex];
                let numToAdd = mapValue;
                if(!isLastBucket && numToAdd > bucketLimit){
                    numToAdd = bucketLimit;
                    popularityMap[mapIndex] = mapValue - numToAdd;
                    currentMedianValue = mapIndex;
                    shouldBreak = true;
                }
                bucketTotal = bucketTotal + (numToAdd * mapIndex);
                bucketCount += numToAdd;
                if(shouldBreak){
                    break;
                }
            }
            // console.log(`mapIndex, bucketTotal/bucketCount: ${mapIndex}, ${bucketTotal}/${bucketCount}`);
            //find average
            bucketsAverage[bucketIndex] = Math.round(bucketTotal / bucketCount);
            bucketsMedian[bucketIndex] = Math.round(((currentMedianValue - previousMedianValue) / 2) + previousMedianValue);
            previousMedianValue = currentMedianValue;
        }
        
        return {
            average: bucketsAverage,
            median: bucketsMedian,
        };
    }

    function medianPopularityBase2(popularityMapObject, numColors, numDistinctValues, offset=0){
        let popularityMap = popularityMapObject.map.slice();

        let bucketsAverage = numDistinctValues <= 255 ? new Uint8Array(numColors) : new Uint16Array(numColors);
        let bucketsMedian = bucketsAverage.slice();
        let mapIndex = 0;
        const numPixelsUsed = popularityMapObject.count;
        let previousMedianValue = offset;
        let currentMedianValue = offset;
        const bucketMaxCapacity = Math.ceil(numPixelsUsed / bucketsAverage.length);

        for(let bucketIndex=0;bucketIndex<bucketsAverage.length;bucketIndex++){
            let bucketCount = 0;
            let bucketTotal = 0;
            let isLastBucket = bucketIndex === bucketsAverage.length - 1;
            
            for(;mapIndex<popularityMap.length;mapIndex++){
                const bucketLimit = bucketMaxCapacity - bucketCount;
                const adjustedMapIndex = (mapIndex + offset) % numDistinctValues;
                let shouldBreak = false;
                const mapValue = popularityMap[mapIndex];
                let numToAdd = mapValue;
                if(!isLastBucket && numToAdd > bucketLimit){
                    numToAdd = bucketLimit;
                    popularityMap[mapIndex] = mapValue - numToAdd;
                    currentMedianValue = adjustedMapIndex;
                    shouldBreak = true;
                }
                bucketTotal = bucketTotal + (numToAdd * adjustedMapIndex);
                bucketCount += numToAdd;
                if(shouldBreak){
                    break;
                }
            }
            // console.log(`mapIndex, bucketTotal/bucketCount: ${mapIndex}, ${bucketTotal}/${bucketCount}`);
            //find average
            bucketsAverage[bucketIndex] = Math.round(bucketTotal / bucketCount);
            bucketsMedian[bucketIndex] = Math.round(((currentMedianValue - previousMedianValue) / 2) + previousMedianValue);
            previousMedianValue = currentMedianValue;
        }
        
        return {
            average: bucketsAverage,
            median: bucketsMedian,
        };
    }

    //since hues wrap around, we have to find the starting point where median hue will most closely match average hue
    function medianPopularityHues(popularityMap, numColors){
        function squaredDistances(list, list2){
            let sum = 0;
            for(let i=0;i<list.length;i++){
                let distance = list[i] - list2[i];
                sum += distance * distance;
            }
            return sum;
        }
        const numValues = 360;
        let totalResults = new Array(numValues);

        //double the popularity map, since hues wrap around
        let doubledPopularityMap = new Float32Array(numValues * 2);
        doubledPopularityMap.set(popularityMap.map);
        doubledPopularityMap.set(popularityMap.map, numValues);

        for(let i=0;i<numValues;i++){
            popularityMap.map = doubledPopularityMap.subarray(i, i+numValues);
            let results = medianPopularityBase2(popularityMap, numColors, numValues, i);
            const distance = squaredDistances(results.median, results.average);
            totalResults[i] = {
                data: results,
                distance: distance,
            };
        }
        console.log(totalResults);
        let minDistance = totalResults[0].distance;
        let minIndex = 0;
        totalResults.forEach((item, i)=>{
            if(item.distance < minDistance){
                minDistance = item.distance;
                minIndex = i;
            }
        });
        console.log(`min index was ${minIndex}`);
        let ret = totalResults[minIndex].data;
        ret.median.sort();
        ret.average.sort();
        return ret;
    }
    
    //Divides the range between min and max values into equal parts
    function uniformPopularityBase(popularityMapObject, numColors, numDistinctValues){
        let buckets = numDistinctValues <= 255 ? new Uint8Array(numColors) : new Uint16Array(numColors);
        const bucketFraction = Math.floor((popularityMapObject.valueMax - popularityMapObject.valueMin) / buckets.length);
        
        buckets = buckets.map((value, i)=>{ return i * bucketFraction; });
        //rounding down will make this less than the max value
        buckets[buckets.length -1] = popularityMapObject.valueMax;
        return buckets;
    }


    //divides lightness into uniform segments, but assuming the range in wide enough,
    //it makes sure there is only 1 black value, and only 1 white value
    function lightnessUniformPopularity(popularityMapObject, numColors, numDistinctValues){
        const minRange = Math.floor(numDistinctValues / 2);
        const min = popularityMapObject.valueMin;
        const max = popularityMapObject.valueMax;
        if(max - min <= minRange){
            return uniformPopularityBase(popularityMapObject, numColors, numDistinctValues);
        }
        let buckets = numDistinctValues <= 255 ? new Uint8Array(numColors) : new Uint16Array(numColors);
        buckets[0] = min;
        buckets[buckets.length - 1] = max;
        const bottomOffset = Math.ceil(numDistinctValues * .18);
        const topOffset = Math.ceil(numDistinctValues * .18);

        const floor = min < bottomOffset ? min + bottomOffset : min;
        const ceil = max > numDistinctValues - topOffset ? max - topOffset : max;
        const bucketFraction = Math.floor((ceil - floor) / (buckets.length - 2));
        console.log(`bottomOffset ${bottomOffset}, topOffset ${topOffset} floor ${floor} ceil ${ceil} max ${max} min ${min}`);
        for(let i=1;i<buckets.length - 1;i++){
            buckets[i] = i * bucketFraction + floor;
        }
        return buckets;
    }
    
    function hueLightnessPopularityMap(pixels, numDistinctValues, pixelHueFunc){
        let popularityMap = new Float32Array(numDistinctValues * 2);
        
        for(let i=0;i<pixels.length;i+=4){
            let pixel = pixels.subarray(i, i+5);
            let pixelHue = pixelHueFunc(pixel);
            let index = pixelHue * 2;
            popularityMap[index] = popularityMap[index] + 1;
            let pixelLightness = PixelMath.lightness(pixel);
            popularityMap[index + 1] = popularityMap[index + 1] + pixelLightness;
        }
        
        return popularityMap;
    }
    
    function sortHues(hues, hueLightnessPopularities){
        let index = 0;
        
        let lightnessMap = new Uint8Array(hues.length);
        hues.forEach((hue, i)=>{
            let totalLightness = 0;
            let total = 0;
            for(;index<=hue*2;index+=2){
                total += hueLightnessPopularities[index];
                totalLightness += hueLightnessPopularities[index + 1];
            }
            
            lightnessMap[i] = Math.floor(totalLightness / total);
        });
        // console.log(lightnessMap);
        let sortMap = new Array(hues.length);
        return new Uint16Array(sortMap.fill().map((item, i)=>{ return [hues[i], lightnessMap[i]];}).sort((a, b)=>{ return a[1] - b[1]; }).map((item)=>{return item[0];}));
    }
    
    
    
    //zips lightnesses and saturation arrays into single array
    //both arrays should be the same length
    //based on artistic/psychological principle that very dark or very light colors should be less saturated
    //while colors with medium lightness should be the most saturated
    function zipHsl(hues, saturations, lightnesses, numColors, centerSaturation){
        let ret = new Uint16Array(numColors * 3);
        
        //lightness
        for(let retIndex=2, lightnessIndex=0;retIndex<ret.length;retIndex+=3,lightnessIndex++){
            ret[retIndex] = lightnesses[lightnessIndex];
        }
        
        //saturation
        //have most saturated colors in middle brightness, while darkest and lightest colors are less saturated
        if(centerSaturation){
            let retIndex = 1;
            let saturationIndex = 0;
            let half = Math.floor(ret.length / 2);
            for(;retIndex < half;retIndex+=3,saturationIndex+=2){
                ret[retIndex] = saturations[saturationIndex];
                ret[ret.length - 1 - retIndex] = saturations[saturationIndex + 1];
            }
            //for odd numbers
            if(ret.length % 2 === 1){
                let middle = half + 1;
                ret[middle * 3 + 1] = saturations[middle];
            }
        }
        //match increase saturation with lightness
        else{
            for(let retIndex=1, saturationIndex=0;retIndex<ret.length;retIndex+=3,saturationIndex++){
                ret[retIndex] = saturations[saturationIndex];
            }
        }
        
        //hues
        for(let retIndex = 0, hueIndex=0;retIndex<ret.length;retIndex+=3, hueIndex++){
            ret[retIndex] = hues[hueIndex];
        }
        
        return ret;
    }
    
    //weight is how much to weight towards first array
    function averageArrays(array1, array2, weight=1){
        const counterWeight = 2 - weight;
        return array1.map((value, index)=>{ return Math.floor((value * weight + array2[index] * counterWeight) / 2); });
    }

    //first array should be median popularity
    //chooses median popularity over uniform popularity if it is less than threshold
    //makes difference in uniform mode over averageArrays,, but not sure if it is worth it
    function averageHueArrays(array1, array2, weight=1){
        const counterWeight = 2 - weight;
        const threshold = 16;
        return array1.map((value, index)=>{ 
            const value2 = array2[index];
            if(Math.abs(value - value2) <= threshold){
                return value;
            }
            return Math.floor((value * weight + value2 * counterWeight) / 2); 
        });
    }
    
    function calculateAverage(list){
        return list.reduce((acc, value)=>{ return acc + value;}, 0) / list.length;
    }

    function perceptualMedianCut(pixels, numColors, colorQuantizationModeId){
        let logarithmicBucketCapacityFunc = (numPixels, numBuckets, currentBucketNum, previousBucketCapacity)=>{
                previousBucketCapacity = previousBucketCapacity > 0 ? previousBucketCapacity : numPixels;
                return Math.ceil(previousBucketCapacity / Math.LN10);
        };
        
        let lightnessesPopularityMapObject = createPopularityMap(pixels, numColors, 256, PixelMath.lightness);
        let lightnesses = medianPopularityBase(lightnessesPopularityMapObject, numColors, 256);
        console.log('lightnesses median');
        console.log(lightnesses);
        let lightnesses2 = lightnessUniformPopularity(lightnessesPopularityMapObject, numColors, 256);
        console.log('lightnesses uniform');
        console.log(lightnesses2);
        lightnesses = averageArrays(lightnesses.average, lightnesses2, .8);
        console.log('lightness results');
        console.log(lightnesses);
        let saturationsPopularityMapObject = createPopularityMap(pixels, numColors, 101, PixelMath.saturation);
        let saturations = medianPopularityBase(saturationsPopularityMapObject, numColors, 101, logarithmicBucketCapacityFunc);
        let saturations2 = uniformPopularityBase(saturationsPopularityMapObject, numColors, 101);
        saturations = averageArrays(saturations.average, saturations2, 1.2);
        console.log('saturation results');
        console.log(saturations);
        const saturationAverage = calculateAverage(saturations);
        let hueFunc = (pixel)=>{
            let lightness = PixelMath.lightness(pixel);
            //ignores hues if the lightness too high or low since it will be hard to distinguish between black and white
            //TODO: find the lightness range in the image beforehand, so we can adjust this range dynamically
            const lightnessFloor = lightnesses[1]; //Math.max(48, lightnesses[1]);
            const lightnessCeil = lightnesses[lightnesses.length - 2];//Math.min(232, lightnesses[lightnesses.length - 2]);
            if(lightness <= lightnessFloor || lightness >= lightnessCeil){
                return null;
            }
            //also ignore hue if saturation is too low to distinguish hue
            const satuarationFloor = 5;//Math.max(5, saturations[1]);
            if(PixelMath.saturation(pixel) <= satuarationFloor){
                return null;
            }
            return PixelMath.hue(pixel);
        };
        //only returns the most vibrant hues
        let vibrantHueFunc = (pixel)=>{
            let lightness = PixelMath.lightness(pixel);
            //ignores hues if the lightness too high or low since it will be hard to distinguish between black and white
            //TODO: find the lightness range in the image beforehand, so we can adjust this range dynamically
            const lightnessFloor = Math.max(48, lightnesses[1]);
            const lightnessCeil = Math.min(232, lightnesses[lightnesses.length - 2]);
            if(lightness <= lightnessFloor || lightness >= lightnessCeil){
                return null;
            }
            //also ignore hue if saturation is too low to distinguish hue
            const satuarationFloor = Math.max(5, saturations[Math.floor(saturations.length / 2)]);
            if(PixelMath.saturation(pixel) <= satuarationFloor){
                return null;
            }
            return PixelMath.hue(pixel);
        };
        let huePopularityMapObject = createPopularityMap(pixels, numColors, 360, hueFunc);
        let vibrantHuePopularityMapObject = createPopularityMap(pixels, numColors, 360, vibrantHueFunc);
        let huesMedian = medianPopularityHues(huePopularityMapObject, numColors);
        let vibrantHues = medianPopularityHues(vibrantHuePopularityMapObject, Math.floor(numColors / 2));
        let huesUniform = uniformPopularityBase(huePopularityMapObject, numColors, 360);
        console.log('median hues');
        console.log(huesMedian);
        console.log('vibrant hues');
        console.log(vibrantHues);
        console.log('uniform hues');
        console.log(huesUniform);
        //uniform mode = .6, median mode = 1.5
        let hueMix = 1.6;
        if(ColorQuantizationModes[colorQuantizationModeId].key === 'PMC_SUPER_MEDIAN'){
            hueMix = 2.0;
        }
        else if(ColorQuantizationModes[colorQuantizationModeId].key === 'PMC_UNIFORM'){
            hueMix = 0.6;
        }
        console.log(`hueMix is ${hueMix}`);
        // let hues = averageHueArrays(averageArrays(huesMedian.average, huesMedian.median), hues2, hueMix);
        let hues = averageHueArrays(averageArrays(huesMedian.average, huesMedian.median), huesUniform, hueMix);
        console.log('averaged hues');
        console.log(hues);
        let huePopularityMap = hueLightnessPopularityMap(pixels, 360, hueFunc);
        // console.log(huePopularityMap);
        hues = sortHues(hues, huePopularityMap);
        // console.log('sorted hues');
        // console.log(hue);
        // shuffle(hues);
        console.log('hue results');
        console.log(hues);
        let hsl = zipHsl(hues, saturations, lightnesses, numColors, true);
        console.log('hsl');
        console.log(hsl);
        let ret = PixelMath.hslArrayToRgb(hsl);
        // console.log('rgb');
        // console.log(ret);
        return ret;
    }

    function uniformQuantization(pixels, numColors, colorQuantizationModeId){
        let lightnessesPopularityMapObject = createPopularityMap(pixels, numColors, 256, PixelMath.lightness);
        let lightnesses = lightnessUniformPopularity(lightnessesPopularityMapObject, numColors, 256);

        let saturationsPopularityMapObject = createPopularityMap(pixels, numColors, 101, PixelMath.saturation);
        let saturations = uniformPopularityBase(saturationsPopularityMapObject, numColors, 101);
        
        const saturationAverage = calculateAverage(saturations);
        let defaultHueFunc = (pixel)=>{
            let lightness = PixelMath.lightness(pixel);
            //ignores hues if the lightness too high or low since it will be hard to distinguish between black and white
            const lightnessFloor = lightnesses[1];
            const lightnessCeil = lightnesses[lightnesses.length - 2];
            if(lightness <= lightnessFloor || lightness >= lightnessCeil){
                return null;
            }
            //also ignore hue if saturation is too low to distinguish hue
            const satuarationFloor = 5;
            if(PixelMath.saturation(pixel) <= satuarationFloor){
                return null;
            }
            return PixelMath.hue(pixel);
        };
        //only returns the most vibrant hues
        let vibrantHueFunc = (pixel)=>{
            let lightness = PixelMath.lightness(pixel);
            //ignores hues if the lightness too high or low since it will be hard to distinguish between black and white
            //TODO: find the lightness range in the image beforehand, so we can adjust this range dynamically
            const lightnessesFraction = Math.ceil(lightness.length / 6);
            const lightnessFloor = lightnesses[lightnessesFraction];
            const lightnessCeil = lightnesses[lightnesses.length - lightnessesFraction];
            if(lightness <= lightnessFloor || lightness >= lightnessCeil){
                return null;
            }
            //also ignore hue if saturation is too low to distinguish hue
            const satuarationFloor = saturations[1];
            if(PixelMath.saturation(pixel) <= satuarationFloor){
                return null;
            }
            return PixelMath.hue(pixel);
        };
        let hueFunc = defaultHueFunc;
        if(ColorQuantizationModes[colorQuantizationModeId].key === 'UNIFORM_VIBRANT'){
            hueFunc = vibrantHueFunc;
        }
        let huePopularityMapObject = createPopularityMap(pixels, numColors, 360, hueFunc);
        let hues = uniformPopularityBase(huePopularityMapObject, numColors, 360);
        let huePopularityMap = hueLightnessPopularityMap(pixels, 360, hueFunc);
        hues = sortHues(hues, huePopularityMap);
        let hsl = zipHsl(hues, saturations, lightnesses, numColors, true);
        let ret = PixelMath.hslArrayToRgb(hsl);
        return ret;
    }

    /**
     * Median cut stuff
    */
    function createMedianCutArray(pixels){
        let ret = [];
        for(let i=0;i<pixels.length;i+=4){
            //ignore transparent pixels
            if(pixels[i+3] > 0){
                //don't save alpha value, since we don't need it
                ret.push([
                    pixels[i],
                    pixels[i+1],
                    pixels[i+2],
                ]);
            }
        }
        return ret;
    }

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

    function extractMedians(pixelArray, numCuts){
        const numColors = Math.pow(2, numCuts);
        const divisionSize = Math.round(pixelArray.length / numColors);

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

    function medianCut(pixels, numColors, colorQuantizationModeId){
        //get number of times we need to divide pixels in half and sort
        const numCuts = Math.ceil(Math.log2(numColors));
        let pixelArray = createMedianCutArray(pixels);

        let divisions = 1;
        for(let i=0;i<numCuts;i++){
            const divisionSize = Math.round(pixelArray.length / divisions);
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

        let medianColors = extractMedians(pixelArray, numCuts);
        if(medianColors.length > numColors){
            medianColors = mergeMedians(medianColors, numColors);
        }

        return pixelArrayToBuffer(medianColors);
    }
    
    
    return {
       perceptualMedianCut: perceptualMedianCut,
       uniform: uniformQuantization,
       medianCut: medianCut,
    };
})(App.Pixel, App.PixelMath, App.ColorQuantizationModes);