/**
 * Perceptual median cut and perceptual uniform color quantization algorithms
 */
App.OptimizePalettePerceptual = (function(Pixel, PixelMath, ArrayUtil){
    
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
        // console.log(totalResults);
        let minDistance = totalResults[0].distance;
        let minIndex = 0;
        totalResults.forEach((item, i)=>{
            if(item.distance < minDistance){
                minDistance = item.distance;
                minIndex = i;
            }
        });
        // console.log(`min index was ${minIndex}`);
        let ret = totalResults[minIndex].data;
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

    //hue is circular, so we need to wrap the values around to find the lowest possible range
    function hueUniformPopularity(popularityMapObject, numColors){
        const numDistinctValues = 360;
        //we need to search in double the popularity map, since hues wrap around
        let popularityMap = popularityMapObject.map;
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
            if(value === 0){
                if(currentSequenceLength > 0){
                    currentSequenceLength++;
                }
                else{
                    currentSequenceStartIndex = i;
                    currentSequenceLength = 1;
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
        const normalizedSequenceLength = Math.min(longestSequenceLength, numDistinctValues);
        const startIndex = longestSequenceStartIndex + normalizedSequenceLength;
        const endIndex = longestSequenceStartIndex + numDistinctValues - 1;
        // console.log(`hue uniform distribution2- minRange is ${endIndex - startIndex} offset is ${startIndex} end index is ${endIndex}`);
        const isCircular = endIndex - startIndex + 1 === numDistinctValues;
        let baseUniformDistribution = uniformDistribution(startIndex, endIndex, numColors, isCircular);
        //we now have to shift based on offset, and sort values
        let ret = new Uint16Array(baseUniformDistribution.length);
        let retIndex = 0;
        // console.log('hue uniform2 base distribution');
        // console.log(baseUniformDistribution);
        // const valueOffset = offset + globalMinValue;
        baseUniformDistribution.forEach((value, i)=>{
            let normalizedValue = value;
            if(normalizedValue >= numDistinctValues){
                ret[retIndex] = normalizedValue - numDistinctValues;
                retIndex++;
            }
        });
        const itemsLeft = ret.length - retIndex;
        for(let i=0;i<itemsLeft;i++,retIndex++){
            ret[retIndex] = baseUniformDistribution[i];
        }
        // console.log('hue uniform distribution2');
        // console.log(ret);
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
        // console.log(`bottomOffset ${bottomOffset}, topOffset ${topOffset} floor ${floor} ceil ${ceil} max ${max} min ${min}`);
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
    
    function calculateAverage(list){
        return list.reduce((acc, value)=>{ return acc + value;}, 0) / list.length;
    }

    function perceptualMedianCut(pixels, numColors, colorQuantization, _imageWidth, _imageHeight){
        let logarithmicBucketCapacityFunc = (numPixels, numBuckets, currentBucketNum, previousBucketCapacity)=>{
                previousBucketCapacity = previousBucketCapacity > 0 ? previousBucketCapacity : numPixels;
                return Math.ceil(previousBucketCapacity / Math.LN10);
        };
        
        let lightnessesPopularityMapObject = createPopularityMap(pixels, numColors, 256, PixelMath.lightness);
        let medianLightnesses = medianPopularityBase(lightnessesPopularityMapObject, numColors, 256);
        // console.log('lightnesses median');
        // console.log(medianLightnesses);
        let uniformLightnesses = lightnessUniformPopularity(lightnessesPopularityMapObject, numColors);
        // console.log('lightnesses uniform');
        // console.log(uniformLightnesses);
        let lightnesses = averageArrays(medianLightnesses.average, uniformLightnesses, .8);
        // console.log('lightness results');
        // console.log(lightnesses);
        let saturationsPopularityMapObject = createPopularityMap(pixels, numColors, 101, PixelMath.saturation);
        let medianSaturations = medianPopularityBase(saturationsPopularityMapObject, numColors, 101, logarithmicBucketCapacityFunc);
        let uniformSaturations = uniformPopularityBase(saturationsPopularityMapObject, numColors);
        let saturations = averageArrays(medianSaturations.average, uniformSaturations, 1.2);
        // console.log('saturation results');
        // console.log(saturations);
        // const saturationAverage = calculateAverage(saturations);
        // console.log(`saturation max is ${Math.max(5, saturations[1])}`);
        // console.log(`saturation range is ${saturations[saturations.length-1] - saturations[0]}`);
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
            // const satuarationFloor = Math.max(5, Math.min(saturations[1], 20));
            if(PixelMath.saturation(pixel) <= satuarationFloor){
                return null;
            }
            return PixelMath.hue(pixel);
        };
        let hueFunc = defaultHueFunc;
        if(colorQuantization.isVibrant){
            hueFunc = vibrantHueFunc;
        }
        let huePopularityMapObject = createPopularityMap(pixels, numColors, 360, hueFunc);
        let huesMedian = medianPopularityHues(huePopularityMapObject, numColors);
        // console.log('median hues');
        // console.log(huesMedian);
        let hueMix = colorQuantization.hueMix;
        // console.log(`hueMix is ${hueMix}`);
        let hues = averageArrays(huesMedian.average, huesMedian.median);
        if(hueMix < 2.0){
            let huesUniform = hueUniformPopularity(huePopularityMapObject, numColors);
            // console.log('hues');
            // console.log(hues);
            // console.log('uniform hues');
            // console.log(huesUniform);
            hues = averageHueArrays(hues, huesUniform, hueMix);
        }
        // console.log('averaged hues');
        // console.log(hues);
        let huePopularityMap = hueLightnessPopularityMap(pixels, 360, hueFunc);
        // console.log(huePopularityMap);
        hues = sortHues(hues, huePopularityMap);
        // console.log('hue results');
        // console.log(hues);
        let hsl = zipHsl(hues, saturations, lightnesses, numColors, true);
        // console.log('hsl');
        // console.log(hsl);
        return PixelMath.hslArrayToRgb(hsl);
    }

    function uniformQuantization(pixels, numColors, colorQuantization, _imageWidth, _imageHeight){
        let lightnessesPopularityMapObject = createPopularityMap(pixels, numColors, 256, PixelMath.lightness);
        let lightnesses = lightnessUniformPopularity(lightnessesPopularityMapObject, numColors);

        let saturationsPopularityMapObject = createPopularityMap(pixels, numColors, 101, PixelMath.saturation);
        let saturations = uniformPopularityBase(saturationsPopularityMapObject, numColors);
        
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
        let huePopularityMapObject = createPopularityMap(pixels, numColors, 360, hueFunc);
        let hues = hueUniformPopularity(huePopularityMapObject, numColors);
        let huePopularityMap = hueLightnessPopularityMap(pixels, 360, hueFunc);
        hues = sortHues(hues, huePopularityMap);
        let hsl = zipHsl(hues, saturations, lightnesses, numColors, true);
        let ret = PixelMath.hslArrayToRgb(hsl);
        return ret;
    }

    function monochromeQuantization(pixels, numColors, colorQuantization, _imageWidth, _imageHeight){
        let lightnessesPopularityMapObject = createPopularityMap(pixels, numColors, 256, PixelMath.lightness);
        let lightnesses = lightnessUniformPopularity(lightnessesPopularityMapObject, numColors);

        let saturationsPopularityMapObject = createPopularityMap(pixels, numColors, 101, PixelMath.saturation);
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
        
        let hueFunc = defaultHueFunc;
        let huePopularityMapObject = createPopularityMap(pixels, numColors, 360, hueFunc);
        let mostPopularHue = 0;
        let mostPopularHueCount = 0;
        huePopularityMapObject.map.forEach((hueCount, hue)=>{
            if(hueCount > mostPopularHueCount){
                mostPopularHueCount = hueCount;
                mostPopularHue = hue;
            }
        });
        const hues = new Uint16Array(numColors);
        hues.fill(mostPopularHue);
        
        if(colorQuantization.hueCount){
            const tonesCount = colorQuantization.hueCount;
            const tones = new Uint16Array(tonesCount);
            const hueFraction = 360 / tonesCount;
            tones[0] = mostPopularHue;
            for(let i=1;i<tonesCount;i++){
                tones[i] = (hueFraction * i + tones[0]) % 360;
            }
            for(let i=0, tonesIndex=0;i<hues.length;i++,tonesIndex++){
                tonesIndex = tonesIndex % tonesCount;
                hues[i] = tones[tonesIndex];
            }

        }

        let hsl = zipHsl(hues, saturations, lightnesses, numColors, true);
        let ret = PixelMath.hslArrayToRgb(hsl);
        return ret;
        
    }
    
    
    return {
       medianCut: perceptualMedianCut,
       uniform: uniformQuantization,
       monochrome: monochromeQuantization,
    };
})(App.Pixel, App.PixelMath, App.ArrayUtil);