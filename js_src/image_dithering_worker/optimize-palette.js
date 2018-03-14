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
    
    //zips lightnesses and saturation arrays into single array
    //both arrays should be the same length
    //based on artistic/psychological principle that very dark or very light colors should be less saturated
    //while colors with medium lightness should be the most saturated
    function zipHsl(hues, saturations, lightnesses, numColors){
        let ret = new Uint16Array(numColors * 3);
        
        //lightness
        for(let retIndex=2, lightnessIndex=0;retIndex<ret.length;retIndex+=3,lightnessIndex++){
            ret[retIndex] = lightnesses[lightnessIndex];
        }
        
        //saturation
        let retIndex = 1;
        let saturationIndex = 0;
        let half = Math.floor(ret.length / 2);
        for(;retIndex < half;retIndex+=3,saturationIndex+=2){
            ret[retIndex] = saturations[saturationIndex];
            ret[ret.length - 1 - retIndex] = saturations[saturationIndex + 1];
        }
        //for odd numbers
        if(saturationIndex < saturations.length - 1){
            ret[retIndex + 3] = saturations[saturationIndex + 1];
        }
        
        
        //hues
        for(let retIndex = 0, hueIndex=0;retIndex<ret.length;retIndex+=3, hueIndex++){
            ret[retIndex] = hues[hueIndex];
        }
        
        return ret;
    }
    
    function medianPopularity(pixels, numColors){
        let logarithmicBucketCapacityFunc = (numPixels, numBuckets, currentBucketNum, previousBucketCapacity)=>{
                previousBucketCapacity = previousBucketCapacity > 0 ? previousBucketCapacity : numPixels;
                return Math.ceil(previousBucketCapacity / Math.LN10);
        };
        
        
        let lightnesses = medianPopularityBase(pixels, numColors, 256, PixelMath.lightness);
        console.log('lightness results');
        console.log(lightnesses);
        let saturations = medianPopularityBase(pixels, numColors, 101, PixelMath.saturation, logarithmicBucketCapacityFunc);
        console.log('saturation results');
        console.log(saturations);
        let hues = medianPopularityBase(pixels, numColors, 360, (pixel)=>{
            let value = PixelMath.hue(pixel);
            if(value === 360){
                return 0;
            }
            return value;
        });
        console.log('hue results');
        console.log(hues);
        let ret = PixelMath.hslArrayToRgb(zipHsl(hues, saturations, lightnesses, numColors));
        return ret;
    }
    
    
    return {
       medianPopularity: medianPopularity,
    };
})(App.Pixel, App.PixelMath);