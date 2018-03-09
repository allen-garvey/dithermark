App.OptimizePalette = (function(Constants, Pixel, PixelMath){
    function medianPopularity(pixels){
        const numColors = Constants.colorDitherMaxColors;
        let lightnessPopularities = new Float32Array(256);
        
        for(let i=0;i<pixels.length;i+=4){
            let pixel = pixels.subarray(i, i+5);
            let lightness = PixelMath.lightness(pixel);
            lightnessPopularities[lightness] = lightnessPopularities[lightness] + 1;
        }
        let ret = new Uint8Array(numColors);
        //minimum number of pixels for each bucket
        let fractionOfPixels = Math.ceil(pixels.length / 4 / numColors);
        
        let numPixelsInBucket = 0;
        let lightnessTotal = 0;
        let bucketIndex = 0;
        
        for(let i=0;i<lightnessPopularities.length;i++){
            let numPixelsInPopularity = lightnessPopularities[i];
            numPixelsInBucket += numPixelsInPopularity;
            lightnessTotal = lightnessTotal + (numPixelsInPopularity * i);
            
            if(numPixelsInBucket >= fractionOfPixels){
                let averageLightness = Math.round(lightnessTotal / numPixelsInBucket);
                ret[bucketIndex] = averageLightness;
                
                lightnessTotal = 0;
                numPixelsInBucket = 0;
                bucketIndex++;
            }
        }
        return ret;
        
    }
    
    
    return {
       medianPopularity: medianPopularity,
    };
})(App.Constants, App.Pixel, App.PixelMath);