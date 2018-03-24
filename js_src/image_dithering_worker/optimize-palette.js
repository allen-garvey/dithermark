App.OptimizePalette = (function(Pixel, PixelMath){
    function medianPopularityBase(pixels, numColors, numDistinctValues, pixelValueFunc, bucketCapacityFunc=null){
        let popularityMap = new Float32Array(numDistinctValues);
        
        for(let i=0;i<pixels.length;i+=4){
            let pixel = pixels.subarray(i, i+5);
            let pixelValue = pixelValueFunc(pixel);
            // if(pixelValue < 0 || pixelValue >= popularityMap.length || typeof pixelValue !== 'number' || isNaN(pixelValue)){
            //     console.log(`pixel value out of range ${pixelValue}/${numDistinctValues}`);
            // }
            popularityMap[pixelValue] = popularityMap[pixelValue] + 1;
        }
        // console.log(popularityMap);
        // console.log(popularityMap.reduce((sum, current)=>{ return sum+ current;}, 0));
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
        for(let bucketIndex=0;bucketIndex<buckets.length;bucketIndex++){
            let bucketCount = 0;
            let bucketTotal = 0;
            let isLastBucket = bucketIndex === buckets.length - 1;
            bucketMaxCapacity = bucketCapacityFunc(pixels.length / 4, buckets.length, bucketIndex, bucketMaxCapacity);
            
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
    
    function uniformPopularityBase(pixels, numColors, numDistinctValues, pixelValueFunc){
        let popularityMap = new Float32Array(numDistinctValues);
        
        for(let i=0;i<pixels.length;i+=4){
            let pixel = pixels.subarray(i, i+5);
            let pixelValue = pixelValueFunc(pixel);
            // if(pixelValue < 0 || pixelValue >= popularityMap.length || typeof pixelValue !== 'number' || isNaN(pixelValue)){
            //     console.log(`pixel value out of range ${pixelValue}/${numDistinctValues}`);
            // }
            popularityMap[pixelValue] = popularityMap[pixelValue] + 1;
        }
        // console.log(popularityMap);
        // console.log(popularityMap.reduce((sum, current)=>{ return sum+ current;}, 0));
        let buckets;
        if(numDistinctValues <= 255){
            buckets = new Uint8Array(numColors);   
        }
        else{
            buckets = new Uint16Array(numColors);
        }
        let valueMin;
        let valueMax;
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
        
        // for(let i=0;i<popularityMap.length;i+=2){
        //     let total = popularityMap[i];
        //     let average = total === 0 ? 0 : popularityMap[i+1] / total;
        //     popularityMap[i+1] = average;
        // }
        
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
    
    function averageArrays(array1, array2){
        return array1.map((value, index)=>{ return Math.floor((value + array2[index]) / 2); });
    }
    
    //TODO: ignore transparent pixels
    function medianPopularity(pixels, numColors){
        let logarithmicBucketCapacityFunc = (numPixels, numBuckets, currentBucketNum, previousBucketCapacity)=>{
                previousBucketCapacity = previousBucketCapacity > 0 ? previousBucketCapacity : numPixels;
                return Math.ceil(previousBucketCapacity / Math.LN10);
        };
        
        
        let lightnesses = medianPopularityBase(pixels, numColors, 256, PixelMath.lightness);
        // let lightnesses2 = uniformPopularityBase(pixels, numColors, 256, PixelMath.lightness);
        // lightnesses = averageArrays(lightnesses, lightnesses2);
        console.log('lightness results');
        console.log(lightnesses);
        let saturations = uniformPopularityBase(pixels, numColors, 101, PixelMath.saturation);
        let saturations2 = medianPopularityBase(pixels, numColors, 101, PixelMath.saturation, logarithmicBucketCapacityFunc);
        saturations = averageArrays(saturations, saturations2);
        console.log('saturation results');
        console.log(saturations);
        let hueFunc = (pixel)=>{
            let value = PixelMath.hue(pixel);
            if(value === 360){
                return 0;
            }
            return value;
        };
        let hues = medianPopularityBase(pixels, numColors, 360, hueFunc);
        let hues2 = uniformPopularityBase(pixels, numColors, 360, hueFunc);
        hues = averageArrays(hues, hues2);
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

    //note: does not look good, as it generally tends to pick up too many shades of black
    function popularity(pixels, numColors){
        function incMap(map, key){
            if(map.has(key)){
                map.set(key, map.get(key) + 1);
            }
            else{
                map.set(key, 1);
            }
        }
        let colorsMap = new Map();
        for(let i=0;i<pixels.length;i+=4){
            let alpha = pixels[i+3];
            if(alpha === 0){
                continue;
            }
            let key = `${pixels[i]};${pixels[i+1]};${pixels[i+2]}`;
            incMap(colorsMap, key);
        }
        let sortedKeys = [...colorsMap.keys()].sort((a, b)=>{
            return colorsMap.get(b) - colorsMap.get(a);
        });
        console.log(sortedKeys);

        let ret = new Uint8Array(numColors * 3);

        for(let i=0;i<numColors && i<sortedKeys.length;i++){
            sortedKeys[i].split(';').forEach((value, index)=>{
                ret[i+index] = parseInt(value);
            });
        }
        return ret;
    }
    
    
    return {
       medianPopularity: medianPopularity,
       popularity: popularity,
    };
})(App.Pixel, App.PixelMath);