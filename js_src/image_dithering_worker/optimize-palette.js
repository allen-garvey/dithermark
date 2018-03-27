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

        return {
            map: popularityMap,
            count: count,
        };
    }


    //finds n ranges, where each range contains the either the same number of pixels, or the number of pixel size can
    //increase by some amount, such as logarithmically. Then the average value in each range is used
    function medianPopularityBase(popularityMapObject, numColors, numDistinctValues, bucketCapacityFunc=null){
        let popularityMap = new Float32Array(popularityMapObject.map);

        let buckets;
        if(numDistinctValues <= 255){
            buckets = new Uint8Array(numColors);   
        }
        else{
            buckets = new Uint16Array(numColors);
        }
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
    
    //finds the max and min values, and then divides the range into equal parts
    function uniformPopularityBase(popularityMapObject, numColors, numDistinctValues){
        let popularityMap = popularityMapObject.map;

        let buckets;
        if(numDistinctValues <= 255){
            buckets = new Uint8Array(numColors);   
        }
        else{
            buckets = new Uint16Array(numColors);
        }
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
        let bucketFraction = Math.floor((valueMax - valueMin) / buckets.length);
        buckets = buckets.map((value, i)=>{ return i * bucketFraction; });
        //rounding down will make this less than the max value
        buckets[buckets.length -1] = valueMax;
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
    
    //based on: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    function shuffle(array) {
        let currentIndex = array.length;
        let temporaryValue;
        let randomIndex;
        
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
        
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
        }
        
        return array;
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
        let lightnesses2 = uniformPopularityBase(lightnessesPopularityMapObject, numColors, 256);
        lightnesses = averageArrays(lightnesses, lightnesses2, 1.8);
        console.log('lightness results');
        console.log(lightnesses);
        let saturationsPopularityMapObject = createPopularityMap(pixels, numColors, 101, PixelMath.saturation);
        let saturations = uniformPopularityBase(saturationsPopularityMapObject, numColors, 101);
        let saturations2 = medianPopularityBase(saturationsPopularityMapObject, numColors, 101, logarithmicBucketCapacityFunc);
        saturations = averageArrays(saturations, saturations2, 0.8);
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
            let hue = PixelMath.hue(pixel);
            if(hue === 360){
                return 0;
            }
            return hue;
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