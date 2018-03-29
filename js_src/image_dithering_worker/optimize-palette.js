App.OptimizePalette = (function(Pixel, PixelMath){
    
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
        let popularityMap = new Float32Array(popularityMapObject.map);

        let buckets = numDistinctValues <= 255 ? new Uint8Array(numColors) : new Uint16Array(numColors);
        //minimum number of pixels for each bucket
        if(!bucketCapacityFunc){
            bucketCapacityFunc = (numPixels, numBuckets, currentBucketNum, previousBucketCapacity)=>{
                return Math.ceil(numPixels / numBuckets);
            };
        }
        let bucketMaxCapacity = 0;
        let mapIndex = 0;
        const numPixelsUsed = popularityMapObject.count;
        for(let bucketIndex=0;bucketIndex<buckets.length;bucketIndex++){
            let bucketCount = 0;
            let bucketTotal = 0;
            let isLastBucket = bucketIndex === buckets.length - 1;
            bucketMaxCapacity = bucketCapacityFunc(numPixelsUsed, buckets.length, bucketIndex, bucketMaxCapacity);
            
            for(;mapIndex<popularityMap.length;mapIndex++){
                const bucketLimit = bucketMaxCapacity - bucketCount;
                let shouldBreak = false;
                const mapValue = popularityMap[mapIndex];
                let numToAdd = mapValue;
                if(!isLastBucket && numToAdd > bucketLimit){
                    numToAdd = bucketLimit;
                    popularityMap[mapIndex] = mapValue - numToAdd;
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
            buckets[bucketIndex] = Math.round(bucketTotal / bucketCount);
        }
        
        return buckets;
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
        console.log(lightnessMap);
        let sortMap = new Array(hues.length);
        let sorted = new Uint16Array(sortMap.fill().map((item, i)=>{ return [hues[i], lightnessMap[i]];}).sort((a, b)=>{ return a[1] - b[1]; }).map((item)=>{return item[0];}));
        console.log('sorted hues');
        console.log(sorted);
        return sorted;
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
        let counterWeight = 2 - weight;
        return array1.map((value, index)=>{ return Math.floor((value * weight + array2[index] * counterWeight) / 2); });
    }
    
    function medianPopularity(pixels, numColors){
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
        lightnesses = averageArrays(lightnesses, lightnesses2, .8);
        console.log('lightness results');
        console.log(lightnesses);
        let saturationsPopularityMapObject = createPopularityMap(pixels, numColors, 101, PixelMath.saturation);
        let saturations = medianPopularityBase(saturationsPopularityMapObject, numColors, 101, logarithmicBucketCapacityFunc);
        let saturations2 = uniformPopularityBase(saturationsPopularityMapObject, numColors, 101);
        saturations = averageArrays(saturations, saturations2, 1.2);
        console.log('saturation results');
        console.log(saturations);
        let hueFunc = (pixel)=>{
            let lightness = PixelMath.lightness(pixel);
            //ignores hues if the lightness too high or low since it will be hard to distinguish between black and white
            //TODO: find the lightness range in the image beforehand, so we can adjust this range dynamically
            if(lightness <= 63 || lightness >= 246){
                return null;
            }
            //also ignore hue if saturation is too low to distinguish hue
            if(PixelMath.saturation(pixel) <= 5){
                return null;
            }
            return PixelMath.hue(pixel);
        };
        let huePopularityMapObject = createPopularityMap(pixels, numColors, 360, hueFunc);
        let hues = medianPopularityBase(huePopularityMapObject, numColors, 360);
        let hues2 = uniformPopularityBase(huePopularityMapObject, numColors, 360);
        hues = averageArrays(hues, hues2, 1.5);
        let huePopularityMap = hueLightnessPopularityMap(pixels, 360, hueFunc);
        console.log(huePopularityMap);
        hues = sortHues(hues, huePopularityMap);
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
    
    
    return {
       medianPopularity: medianPopularity,
    };
})(App.Pixel, App.PixelMath);