
App.Histogram = (function(Pixel, PixelMath){
    
    /*
    * @param pixelHashFunc - used to get index of pixel that is used for counting unique values for histogram - (@params pixel @returns int)
    */
    function createHistogram(pixels, histogramPercentages, uniqueValues, pixelHashFunc){
        
        //can't use int array, since we may overflow it
        let histogramArray = new Float32Array(uniqueValues);
        
        for(let i=0;i<pixels.length;i+=4){
            let pixel = Pixel.create(pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]);
            let index = pixelHashFunc(pixel);
            histogramArray[index] = histogramArray[index] + 1;
        }
        
        //find maximum value so we can normalize values
        let max = histogramArray.reduce((currentMax, element)=>{
            return Math.max(currentMax, element);
        }, 0);
        
        //calculate each unique values percentage of bar height
        for(let i=0;i<histogramArray.length;i++){
            let percentage = 0;
            //dividing by 0 will be infinity
            if(max > 0){
                percentage = Math.ceil(histogramArray[i] / max * 100);
            }
            histogramPercentages[i] = percentage;
        }
    }
    
    function createBwHistogram(pixels, histogramPercentages){
        return createHistogram(pixels, histogramPercentages, 256, PixelMath.lightness);
    }
    
    function createHueHistogram(pixels, histogramPercentages){
        return createHistogram(pixels, histogramPercentages, 360, PixelMath.hue);
    }
    
    return {
        createBwHistogram: createBwHistogram,
        createHueHistogram: createHueHistogram,
    };
})(App.Pixel, App.PixelMath);