/**
 * Perceptual median cut and perceptual uniform color quantization algorithms
 */
App.OptimizePalettePerceptual = (function(PixelMath, ArrayUtil){
    
    function createPopularityMap(pixels, numDistinctValues, pixelValueFunc){
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
            popularityMap[pixelValue] = popularityMap[pixelValue] + 1;
            count++;
        }
        return {
            map: popularityMap,
            count: count,
        };
    }

    function createHslPopularityMap(pixels, hueClamp=false){
        const hueMap = new Float32Array(360);
        // const saturationMap = new Float32Array(101);
        const lightnessMap = new Float32Array(256);
        const maxLightnessDiffCubed = 127 * 127 * 127;
        let pixelCount = 0;
        //saturation stats
        let saturationMax = 0;
        let saturationMin = Infinity;
        let saturationTotal = 0;
        let saturationHighCount = 0;
        let saturationLowCount = 0;
        let saturationHighTotal = 0;
        let saturationLowTotal = 0;
        //lightness stats
        let lightnessMax = 0;
        let lightnessMin = Infinity;
        let lightnessTotal = 0;
        for(let i=0;i<pixels.length;i+=4){
            let pixel = pixels.subarray(i, i+5);
            //ignore transparent pixels
            if(pixel[3] === 0){
                continue;
            }
            pixelCount++;
            const hue = PixelMath.hue(pixel);
            const saturation = PixelMath.saturation(pixel);
            const lightness = PixelMath.lightness(pixel);
            // saturationMap[saturation] = saturationMap[saturation] + 1;
            saturationTotal += saturation;
            if(saturation > saturationMax){
                saturationMax = saturation;
            }
            else if(saturation < saturationMin){
                saturationMin = saturation;
            }
            if(saturation < 50){
                saturationLowCount++;
                saturationLowTotal += saturation;
            }
            else{
                saturationHighCount++;
                saturationHighTotal += saturation;
            }
            if(lightness > lightnessMax){
                lightnessMax = lightness;
            }
            else if(lightness < lightnessMin){
                lightnessMin = lightness;
            }
            lightnessTotal += lightness;
            lightnessMap[lightness] = lightnessMap[lightness] + 1;
            let lightnessDiff;
            if(lightness >= 128){
                lightnessDiff = lightness - 128;
            }
            else{
                lightnessDiff = 127 - lightness;
            }
            const hueCountValue = saturation * saturation * saturation / 1000000 * ((maxLightnessDiffCubed - lightnessDiff * lightnessDiff * lightnessDiff) / maxLightnessDiffCubed);
            hueMap[hue] = hueMap[hue] + hueCountValue;
        }
        // const multiplier = Math.min(512, pixelCount / 360);
        // const multiplier = 1024;
        // const multiplier = 4096;


        //wide hue range looks better with multiplier of 8
        // const multiplier = 8;
        //narrow hue range looks better with multiplier of 128
        const hueClampFunc = hueClamp ? (num)=>{ return Math.round(Math.log2(num)); } : (num)=>{ return num; };
        const multiplier = 128;
        for(let i=0;i<hueMap.length;i++){
            hueMap[i] = hueClampFunc(hueMap[i] * multiplier);
        }
        return {
            hue: {
                map: hueMap,
            },
            saturation: {
                // map: saturationMap,
                average: saturationTotal / pixelCount,
                min: saturationMin,
                max: saturationMax,
                count: pixelCount,
                highCount: saturationHighCount,
                lowCount: saturationLowCount,
                lowAverage: saturationLowTotal / saturationLowCount,
                highAverage: saturationHighTotal / saturationHighCount,
            },
            lightness: {
                mapObject: {
                    map: lightnessMap,
                    count: pixelCount,
                },
                min: lightnessMin,
                max: lightnessMax,
                count: pixelCount,
                average: lightnessTotal / pixelCount,
            },
        };
    }

    function sortHuesByClosestLightness(hues, pixels){
        function findClosestHue(hue, hues){
            let closestDistance = Infinity;
            let closestIndex = 0;
            hues.forEach((value, index)=>{
                const distance = PixelMath.hueDistance(hue, value);
                if(distance < closestDistance){
                    closestDistance = distance;
                    closestIndex = index;
                }
            });
            return closestIndex;
        }
        const hueAverageLigtnessMap = new Float32Array(2 * hues.length);
        for(let i=0;i<pixels.length;i+=4){
            let pixel = pixels.subarray(i, i+5);
            //ignore transparent pixels
            if(pixel[3] === 0){
                continue;
            }
            const lightness = PixelMath.lightness(pixel);
            if(lightness < 16 || lightness > 240){
                continue;
            }
            const saturation = PixelMath.saturation(pixel);
            if(saturation === 0){
                continue;
            }
            const hue = PixelMath.hue(pixel);
            const index = findClosestHue(hue, hues);
            const normalizedIndex = index * 2;
            const fraction = saturation / 100;
            hueAverageLigtnessMap[normalizedIndex] = hueAverageLigtnessMap[normalizedIndex] + lightness * fraction;
            hueAverageLigtnessMap[normalizedIndex+1] = hueAverageLigtnessMap[normalizedIndex+1] + fraction;
        }
        //get averages
        for(let i=0;i<hueAverageLigtnessMap.length;i+=2){
            hueAverageLigtnessMap[i] = hueAverageLigtnessMap[i] / hueAverageLigtnessMap[i+1];
        }
        let sortedHues = ArrayUtil.create(hues.length, (i)=>{
            return {
                hue: hues[i],
                lightness: hueAverageLigtnessMap[i*2],
            };
        }).sort((a, b)=>{
            return a.lightness - b.lightness;
        });
        for(let i=0;i<hues.length;i++){
            hues[i] = sortedHues[i].hue;
        }
        return hues;
    }

    function findMin(popularityMap){
        for(let i=0;i<popularityMap.length;i++){
            if(popularityMap[i] > 0){
                return i;
            }
        }
        return 0;
    }

    function findMax(popularityMap){
        for(let i=popularityMap.length-1;i>=0;i--){
            if(popularityMap[i] > 0){
                return i;
            }
        }
        return 0;
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
        let minDistance = totalResults[0].distance;
        let minIndex = 0;
        totalResults.forEach((item, i)=>{
            if(item.distance < minDistance){
                minDistance = item.distance;
                minIndex = i;
            }
        });
        let ret = totalResults[minIndex].data;
        ret.median.sort();
        ret.average.sort();
        return ret;
    }

    function popularityMapStats(popularityMap){
        let numBuckets = 0;
        let total = 0;
        popularityMap.forEach((value)=>{
            if(value > 0){
                total += value;
                numBuckets++;
            }
        });
        const average = total / numBuckets;
        // let totalDeviations = 0;
        // popularityMap.forEach((value)=>{
        //     if(value > 0){
        //         const deviation = value - average;
        //         totalDeviations = totalDeviations + (deviation * deviation);
        //     }
        // });
        // const variance = totalDeviations / numBuckets;
        // const standardDeviation = Math.sqrt(variance);
        return{
            average,
            // standardDeviation,
        };
    }

    //use zero sequence and std deviation to find best starting point for
    //medianPopularity
    function calculatedPopularityHues(popularityMapObject, numColors){
        const numDistinctValues = 360;

        const stats = popularityMapStats(popularityMapObject.map);
        let threshold = stats.average / numColors;

        //double the popularity map, since hues wrap around
        const doubledPopularityMap = new Float32Array(numDistinctValues * 2);
        doubledPopularityMap.set(popularityMapObject.map);
        doubledPopularityMap.set(popularityMapObject.map, numDistinctValues);

        const longestZeroSequence = findLongestPopularityMapZeroSequence(popularityMapObject.map, Math.max(threshold, 0));
        const startIndex = longestZeroSequence.startIndex + longestZeroSequence.length;
        popularityMapObject.map = doubledPopularityMap.subarray(startIndex, startIndex+numDistinctValues);
        const ret = medianPopularityBase2(popularityMapObject, numColors, numDistinctValues, startIndex);
        ret.median.sort();
        ret.average.sort();
        return ret;
    }
    
    function uniformDistribution(valueMin, valueMax, numDivisions, isCircular=false){
        let buckets = valueMax <= 255 ? new Uint8Array(numDivisions) : new Uint16Array(numDivisions);
        const divisor = isCircular ? numDivisions : numDivisions - 1;
        const bucketFraction = (valueMax - valueMin) / divisor;
        
        buckets = buckets.map((value, i)=>{ return Math.round(i * bucketFraction) + valueMin; });
        return buckets;
    }

    //Divides the range between min and max values into equal parts
    function uniformPopularityBase(popularityMapObject, numColors){
        const valueMax = findMax(popularityMapObject.map);
        const valueMin = findMin(popularityMapObject.map);

        return uniformDistribution(valueMin, valueMax, numColors);
    }

    function findLongestPopularityMapZeroSequence(popularityMap, thresholdValue=0){
        const length = popularityMap.length;
        const doubledLength = length * 2;

        //find the longest sequence of 0 values to find min range
        let longestSequenceStartIndex = 0;
        let longestSequenceLength = 0;

        for(let i=0, normalizedIndex=0,currentSequenceStartIndex=0, currentSequenceLength=0;i<doubledLength;i++,normalizedIndex++){
            if(normalizedIndex === length){
                normalizedIndex = 0;
            }
            const value = popularityMap[normalizedIndex];
            if(value <= thresholdValue){
                if(currentSequenceLength === 0){
                    currentSequenceStartIndex = i;
                    currentSequenceLength = 1;
                    
                }
                else{
                    currentSequenceLength++;
                }
            }
            else if(currentSequenceLength > 0){
                if(currentSequenceLength > longestSequenceLength){
                    longestSequenceLength = currentSequenceLength;
                    longestSequenceStartIndex = currentSequenceStartIndex;
                }
                currentSequenceLength = 0;
            }
        }
        const normalizedSequenceLength = Math.min(longestSequenceLength, length);
        const startIndex = longestSequenceStartIndex;
        
        return {
            startIndex,
            length: normalizedSequenceLength,
        };
    }

    //hue is circular, so we need to wrap the values around to find the lowest possible range
    function hueUniformPopularity(popularityMapObject, numColors){
        const numDistinctValues = 360;
        
        const longestZeroSequence = findLongestPopularityMapZeroSequence(popularityMapObject.map);
        const startIndex = longestZeroSequence.startIndex + longestZeroSequence.length;
        const endIndex = longestZeroSequence.startIndex + numDistinctValues - 1;
        const isCircular = endIndex - startIndex + 1 === numDistinctValues;
        const baseUniformDistribution = uniformDistribution(startIndex, endIndex, numColors, isCircular);
        //we now have to shift based on offset, and sort values
        const ret = new Uint16Array(baseUniformDistribution.length);
        let retIndex = 0;
        baseUniformDistribution.forEach((value, i)=>{
            const normalizedValue = value;
            if(normalizedValue >= numDistinctValues){
                ret[retIndex] = normalizedValue - numDistinctValues;
                retIndex++;
            }
        });
        const itemsLeft = ret.length - retIndex;
        for(let i=0;i<itemsLeft;i++,retIndex++){
            ret[retIndex] = baseUniformDistribution[i];
        }
        return ret;
    }


    //divides lightness into uniform segments, but assuming the range in wide enough,
    //it makes sure there is only 1 black value, and only 1 white value
    function lightnessUniformPopularity(popularityMapObject, numColors){
        const numDistinctValues = 256;
        const minRange = Math.floor(numDistinctValues / 2);
        const min = findMax(popularityMapObject.map);
        const max = findMax(popularityMapObject.map);
        if(max - min <= minRange){
            return uniformPopularityBase(popularityMapObject, numColors);
        }
        let buckets = new Uint8Array(numColors);
        buckets[0] = min;
        buckets[buckets.length - 1] = max;
        const bottomOffset = Math.ceil(numDistinctValues * .18);
        const topOffset = Math.ceil(numDistinctValues * .18);

        const floor = min < bottomOffset ? min + bottomOffset : min;
        const ceil = max > numDistinctValues - topOffset ? max - topOffset : max;
        const bucketFraction = Math.floor((ceil - floor) / (buckets.length - 2));
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
        return new Uint16Array(ArrayUtil.create(hues.length, (i)=>{ return [hues[i], lightnessMap[i]];}).sort((a, b)=>{ return a[1] - b[1]; }).map((item)=>{return item[0];}));
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

    function perceptualMedianCut(pixels, numColors, colorQuantization, _imageWidth, _imageHeight){
        let logarithmicBucketCapacityFunc = (numPixels, numBuckets, currentBucketNum, previousBucketCapacity)=>{
                previousBucketCapacity = previousBucketCapacity > 0 ? previousBucketCapacity : numPixels;
                return Math.ceil(previousBucketCapacity / Math.LN10);
        };
        //lightness
        let lightnessesPopularityMapObject = createPopularityMap(pixels, 256, PixelMath.lightness);
        let medianLightnesses = medianPopularityBase(lightnessesPopularityMapObject, numColors, 256);
        let uniformLightnesses = lightnessUniformPopularity(lightnessesPopularityMapObject, numColors);
        let lightnesses = averageArrays(medianLightnesses.average, uniformLightnesses, .8);
        
        //saturation
        let saturationsPopularityMapObject = createPopularityMap(pixels, 101, PixelMath.saturation);
        let medianSaturations = medianPopularityBase(saturationsPopularityMapObject, numColors, 101, logarithmicBucketCapacityFunc);
        let uniformSaturations = uniformPopularityBase(saturationsPopularityMapObject, numColors);
        let saturations = averageArrays(medianSaturations.average, uniformSaturations, 1.2);
        
        //hue
        let defaultHueFunc = (pixel)=>{
            let lightness = PixelMath.lightness(pixel);
            //ignores hues if the lightness too high or low since it will be hard to distinguish between black and white
            //TODO: find the lightness range in the image beforehand, so we can adjust this range dynamically
            const lightnessFloor = lightnesses[1]; //Math.max(48, lightnesses[1]);
            const lightnessCeil = lightnesses[lightnesses.length - 2];//Math.min(232, lightnesses[lightnesses.length - 2]);
            if(lightness <= lightnessFloor || lightness >= lightnessCeil){
                return null;
            }
            //also ignore hue if saturation is too low to distinguish hue
            //TODO: pick between saturation floors - some images look better with one than the other
            // const satuarationFloor = 5;
            const satuarationFloor = Math.max(5, Math.min(saturations[1], 20));
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
            //TODO: pick between saturation floors - some images look better with one than the other
            const satuarationFloor = Math.max(5, saturations[Math.floor(saturations.length / 2)]);
            if(PixelMath.saturation(pixel) <= satuarationFloor){
                return null;
            }
            return PixelMath.hue(pixel);
        };
        let hueFunc = defaultHueFunc;
        if(colorQuantization.isVibrant){
            hueFunc = vibrantHueFunc;
        }
        let huePopularityMapObject = createPopularityMap(pixels, 360, hueFunc);
        let huesMedian = medianPopularityHues(huePopularityMapObject, numColors);
        let hueMix = colorQuantization.hueMix;
        let hues = averageArrays(huesMedian.average, huesMedian.median);
        if(hueMix < 2){
            let huesUniform = hueUniformPopularity(huePopularityMapObject, numColors);
            hues = averageHueArrays(hues, huesUniform, hueMix);
        }

        let huePopularityMap = hueLightnessPopularityMap(pixels, 360, hueFunc);
        hues = sortHues(hues, huePopularityMap);
        
        //convert to hsl and return results
        let hsl = zipHsl(hues, saturations, lightnesses, numColors, true);
        return PixelMath.hslArrayToRgb(hsl);
    }

    function filterHues(huePopularityMapObject, imageDimensions, logBase=2){
        //find largest value
        const popularityMap = huePopularityMapObject.map;
        const largestValue = popularityMap.reduce((currentMax, value)=>{
            return Math.max(currentMax, value);
        }, 0);
        const largestValueThreshold = Math.ceil(largestValue / 100);
        const imageThreshold = Math.ceil(imageDimensions / 2000); 
        const thresholdMin = Math.min(largestValueThreshold, imageThreshold);
        
        const logFunc = logBase === 2 ? Math.log2 : (num)=>{return Math.log(num) / Math.log(logBase);};

        let newCount = 0;
        for(let i=0;i<popularityMap.length;i++){
            if(popularityMap[i] < thresholdMin){
                popularityMap[i] = 0;
            }
            else{
                popularityMap[i] = Math.floor(logFunc(popularityMap[i]) * 256);
            }
            newCount += popularityMap[i];
        }
        huePopularityMapObject.count = newCount;
        return huePopularityMapObject;
    }

    function perceptualMedianCut3(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        let logarithmicBucketCapacityFunc = (numPixels, _numBuckets, _currentBucketNum, previousBucketCapacity)=>{
                previousBucketCapacity = previousBucketCapacity > 0 ? previousBucketCapacity : numPixels;
                return Math.ceil(previousBucketCapacity / Math.LN10);
        };
        //lightness
        let lightnessesPopularityMapObject = createPopularityMap(pixels, 256, PixelMath.lightness);
        let medianLightnesses = medianPopularityBase(lightnessesPopularityMapObject, numColors, 256);
        let uniformLightnesses = lightnessUniformPopularity(lightnessesPopularityMapObject, numColors);
        let lightnesses = averageArrays(medianLightnesses.average, uniformLightnesses, .8);
        
        //saturation
        let saturationsPopularityMapObject = createPopularityMap(pixels, 101, PixelMath.saturation);
        let medianSaturations = medianPopularityBase(saturationsPopularityMapObject, numColors, 101, logarithmicBucketCapacityFunc);
        let uniformSaturations = uniformPopularityBase(saturationsPopularityMapObject, numColors);
        let saturations = averageArrays(medianSaturations.average, uniformSaturations, 1.2);
        
        //hue
        let defaultHueFunc = (pixel)=>{
            let lightness = PixelMath.lightness(pixel);
            //ignores hues if the lightness too high or low since it will be hard to distinguish between black and white
            //TODO: find the lightness range in the image beforehand, so we can adjust this range dynamically
            const lightnessFloor = lightnesses[1]; //Math.max(48, lightnesses[1]);
            const lightnessCeil = lightnesses[lightnesses.length - 2];//Math.min(232, lightnesses[lightnesses.length - 2]);
            if(lightness <= lightnessFloor || lightness >= lightnessCeil){
                return null;
            }
            //also ignore hue if saturation is too low to distinguish hue
            //TODO: pick between saturation floors - some images look better with one than the other
            // const satuarationFloor = 5;
            const satuarationFloor = Math.max(5, Math.min(saturations[1], 20));
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
            //TODO: pick between saturation floors - some images look better with one than the other
            const satuarationFloor = Math.max(5, saturations[Math.floor(saturations.length / 2)]);
            if(PixelMath.saturation(pixel) <= satuarationFloor){
                return null;
            }
            return PixelMath.hue(pixel);
        };
        let hueFunc = defaultHueFunc;
        if(colorQuantization.isVibrant){
            hueFunc = vibrantHueFunc;
        }
        let huePopularityMapObject = createPopularityMap(pixels, 360, hueFunc);
        huePopularityMapObject = filterHues(huePopularityMapObject, imageHeight * imageWidth);
        let huesMedian = calculatedPopularityHues(huePopularityMapObject, numColors);
        let hueMix = colorQuantization.hueMix;
        let hues = averageArrays(huesMedian.average, huesMedian.median);
        // let hues = huesMedian.average;
        // let hues = huesMedian.median;
        if(hueMix < 2){
            let uniformPopularityMapObject = huePopularityMapObject;
            // if(colorQuantization.isVibrant){
            //     uniformPopularityMapObject = createPopularityMap(pixels, 360, defaultHueFunc);
            // }
            let huesUniform = hueUniformPopularity(uniformPopularityMapObject, numColors);
            hues = averageHueArrays(hues, huesUniform, hueMix);
        }

        let huePopularityMap = hueLightnessPopularityMap(pixels, 360, hueFunc);
        hues = sortHues(hues, huePopularityMap);
        
        //convert to hsl and return results
        let hsl = zipHsl(hues, saturations, lightnesses, numColors, true);
        return PixelMath.hslArrayToRgb(hsl);
    }

    /**
     * Distributes values logarithmically so that more values are closer to min or max value
     * and less values are in the middle
     */
    function logarithmicEdgeDistribution(numColors, valueMin, valueMax){
        const diff = valueMax - valueMin;
        const ret = new Uint8Array(numColors);
        const halfColors = Math.floor(numColors / 2);
        const diffLowHalf = Math.floor(diff / 2);
        const lowBase = Math.log(diffLowHalf) / Math.log(halfColors);
        //have half saturations be relatively low, and half saturations relatively high

        for(let i=0;i<halfColors;i++){
            ret[i] = Math.round(Math.pow(lowBase, i)) + valueMin;
        }
        const highDiff = diff - diffLowHalf;
        const highBase = Math.log(highDiff) / Math.log(numColors - halfColors);
        for(let exponent=0,i=halfColors;i<numColors;exponent++,i++){
            ret[i] = Math.round(valueMax - Math.floor(highDiff / Math.pow(highBase, exponent)));
        }
        return ret;
    }

    /**
     * Distributes half the values logarithmically so that more values are closer to min or max value
     * middle values are distributed evenly in linear fashion
     */
    function logarithmicEdgeLinearMiddleDistribution(numColors, valueMin, valueMax){
        const diff = valueMax - valueMin;
        const ret = new Uint8Array(numColors);
        const bottomQuarterColors = Math.floor(numColors / 4);
        const topQuarterColors =  numColors - bottomQuarterColors;
        const diffLowHalf = Math.floor(diff / 4);
        const lowBase = Math.log(diffLowHalf) / Math.log(bottomQuarterColors);
        //have half saturations be relatively low, and half saturations relatively high

        for(let i=0;i<bottomQuarterColors;i++){
            ret[i] = Math.round(Math.pow(lowBase, i)) + valueMin;
        }

        const multiplier = (diff / 2) / (numColors - (bottomQuarterColors + (numColors - topQuarterColors)) + 1);
        for(let index=1, i=bottomQuarterColors;i<topQuarterColors;i++,index++){
            ret[i] = Math.round(diffLowHalf + index * multiplier);
        }

        const highDiff = diffLowHalf;
        const highBase = Math.log(highDiff) / Math.log(numColors - topQuarterColors);
        for(let exponent=0,i=topQuarterColors;i<numColors;exponent++,i++){
            ret[i] = Math.round(valueMax - Math.floor(highDiff / Math.pow(highBase, exponent)));
        }
        return ret;
    }

    /**
     * Distributes values logarithmically so that more values are closer to the center value
     * and less values are on the edges
     * used for range of values 0-255 (i.e. lightness)
     */
    function logarithmicCenterDistribution(numColors, valueMin, valueMax, valueAverage){
        //center is average of average and median
        const centerValue = Math.floor(((valueMax - valueMin) / 2 + valueAverage) / 2);
        const ret = new Uint8Array(numColors);
        const halfColors = Math.floor(numColors / 2);
        const lowHalfCeil = Math.max(valueMin, centerValue);
        const diffLowHalf = lowHalfCeil - valueMin;
        const lowMultiplier = diffLowHalf / Math.log2(halfColors);
        //have half saturations be relatively low, and half saturations relatively high
        for(let i=0,logIndex=1;i<halfColors;i++,logIndex++){
            ret[i] = Math.round(Math.log2(logIndex) * lowMultiplier + valueMin);
        }
        
        const highHalfFloor = Math.min(lowHalfCeil+1, valueMax);
        const highDiff = valueMax - highHalfFloor;
        const highMultiplier = highDiff / Math.log2(numColors - halfColors);
        for(let logIndex=Math.ceil(numColors / 2), i=halfColors;i<numColors;i++,logIndex--){
            ret[i] = Math.round(valueMax - (Math.log2(logIndex) * highMultiplier));;
        }
        return ret;
    }

    function perceptualMedianCut4(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        const hslPopularityMap = createHslPopularityMap(pixels, colorQuantization.hueClamp);
        //lightness
        let lightnessesPopularityMapObject = hslPopularityMap.lightness.mapObject;
        let medianLightnesses = medianPopularityBase(lightnessesPopularityMapObject, numColors, 256);
        let uniformLightnesses = lightnessUniformPopularity(lightnessesPopularityMapObject, numColors);
        let lightnesses = averageArrays(medianLightnesses.average, uniformLightnesses, .8);
        
        //saturation
        const saturationStats = hslPopularityMap.saturation;
        const saturations = logarithmicEdgeDistribution(numColors, saturationStats.min, saturationStats.max);
        
        //hue
        let huePopularityMapObject = hslPopularityMap.hue;
        huePopularityMapObject = filterHues(huePopularityMapObject, imageHeight * imageWidth);
        let huesMedian = calculatedPopularityHues(huePopularityMapObject, numColors);
        let hueMix = colorQuantization.hueMix;
        let hues = averageArrays(huesMedian.average, huesMedian.median);
        // let hues = huesMedian.average;
        // let hues = huesMedian.median;
        if(hueMix < 2){
            let uniformPopularityMapObject = huePopularityMapObject;
            let huesUniform = hueUniformPopularity(uniformPopularityMapObject, numColors);
            hues = averageHueArrays(hues, huesUniform, hueMix);
        }
        hues = sortHuesByClosestLightness(hues, pixels);
        
        //convert to hsl and return results
        let hsl = zipHsl(hues, saturations, lightnesses, numColors, true);
        return PixelMath.hslArrayToRgb(hsl);
    }

    function perceptualMedianCut5(pixels, numColors, colorQuantization, imageWidth, imageHeight){
        const hslPopularityMap = createHslPopularityMap(pixels, colorQuantization.hueClamp);
        const lightnessStats = hslPopularityMap.lightness;
        const lightnesses = logarithmicCenterDistribution(numColors, lightnessStats.min, lightnessStats.max, lightnessStats.average);
        
        //saturation
        const saturationStats = hslPopularityMap.saturation;
        const saturationDistributionFunc = saturationStats.average > 30 ? logarithmicEdgeLinearMiddleDistribution : logarithmicEdgeDistribution;
        const saturations = saturationDistributionFunc(numColors, saturationStats.min, saturationStats.max);
        
        //hue
        let huePopularityMapObject = hslPopularityMap.hue;
        huePopularityMapObject = filterHues(huePopularityMapObject, imageHeight * imageWidth, colorQuantization.hueFilterLog);
        let huesMedian = calculatedPopularityHues(huePopularityMapObject, numColors);
        let hueMix = colorQuantization.hueMix;
        // let hues = averageArrays(huesMedian.average, huesMedian.median);
        let hues = huesMedian.average;
        // let hues = huesMedian.median;
        if(hueMix < 2){
            let uniformPopularityMapObject = huePopularityMapObject;
            let huesUniform = hueUniformPopularity(uniformPopularityMapObject, numColors);
            hues = averageHueArrays(hues, huesUniform, hueMix);
        }
        hues = sortHuesByClosestLightness(hues, pixels);
        
        //convert to hsl and return results
        let hsl = zipHsl(hues, saturations, lightnesses, numColors, true);
        return PixelMath.hslArrayToRgb(hsl);
    }

    function uniformQuantization(pixels, numColors, colorQuantization, _imageWidth, _imageHeight){
        let lightnessesPopularityMapObject = createPopularityMap(pixels, 256, PixelMath.lightness);
        let lightnesses = lightnessUniformPopularity(lightnessesPopularityMapObject, numColors);

        let saturationsPopularityMapObject = createPopularityMap(pixels, 101, PixelMath.saturation);
        let saturations = uniformPopularityBase(saturationsPopularityMapObject, numColors);
        
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
            const lightnessesFraction = Math.ceil(lightnesses.length / numColors);
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
        if(colorQuantization.isVibrant){
            hueFunc = vibrantHueFunc;
        }
        let huePopularityMapObject = createPopularityMap(pixels, 360, hueFunc);
        let hues = hueUniformPopularity(huePopularityMapObject, numColors);
        let huePopularityMap = hueLightnessPopularityMap(pixels, 360, hueFunc);
        hues = sortHues(hues, huePopularityMap);
        let hsl = zipHsl(hues, saturations, lightnesses, numColors, true);
        let ret = PixelMath.hslArrayToRgb(hsl);
        return ret;
    }

    /**
     * Monochrome quantization stuff
     */
    function monochromeQuantization(pixels, numColors, colorQuantization, _imageWidth, _imageHeight){
        const hslPopularityMap = createHslPopularityMap(pixels);

        const lightnesses = lightnessUniformPopularity(hslPopularityMap.lightness.mapObject, numColors);

        const saturationStats = hslPopularityMap.saturation;
        const saturationDistributionFunc = saturationStats.average > 30 ? logarithmicEdgeLinearMiddleDistribution : logarithmicEdgeDistribution;
        const saturations = saturationDistributionFunc(numColors, saturationStats.min, saturationStats.max);

        let mostPopularHueCount = 0;
        const mostPopularHue = hslPopularityMap.hue.map.reduce((currentMostPopularHueIndex, currentHueCount, currentHueIndex)=>{
            if(currentHueCount > mostPopularHueCount){
                mostPopularHueCount = currentHueCount;
                return currentHueIndex;
            }
            return currentMostPopularHueIndex;
        }, 0);

        const hues = new Uint16Array(numColors);
        hues.fill(mostPopularHue);
        
        const hueCount = colorQuantization.hueCount;
        if(hueCount){
            const isDynamicTonesCount = hueCount < 0;
            const tonesCount = isDynamicTonesCount ? Math.ceil(numColors / Math.abs(hueCount)) : hueCount;
            const tones = new Uint16Array(tonesCount);
            const hueFraction = 360 / tonesCount;
            tones[0] = mostPopularHue;
            for(let i=1;i<tonesCount;i++){
                tones[i] = Math.round(hueFraction * i + tones[0]) % 360;
            }
            //make sure most popular hue is always in the middle, rather than at 0, where it will be black
            const hueStartIndex = Math.floor(hues.length / 2);
            for(let i=hueStartIndex,toneIndex=0;i<hues.length+hueStartIndex;i++,toneIndex++){
                hues[i % hues.length] = tones[toneIndex % tonesCount];
            }

        }

        const hsl = zipHsl(hues, saturations, lightnesses, numColors, true);
        return PixelMath.hslArrayToRgb(hsl);
    }
    
    
    return {
       medianCut: perceptualMedianCut,
       medianCut3: perceptualMedianCut3,
       medianCut4: perceptualMedianCut4,
       medianCut5: perceptualMedianCut5,
       uniform: uniformQuantization,
       monochrome: monochromeQuantization,
    };
})(App.PixelMath, App.ArrayUtil);