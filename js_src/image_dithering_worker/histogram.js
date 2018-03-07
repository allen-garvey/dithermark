
App.Histogram = (function(Pixel, Polyfills, PixelMath, Constants){
    var histogramHeight = Constants.histogramHeight;
    var histogramBwWidth = Constants.histogramBwWidth;
    var histogramColorWidth = Constants.histogramColorWidth;
    
    /*
    * @param pixelHashFunc - used to get index of pixel that is used for counting unique values for histogram - (@params pixel @returns int)
    * @param histogramColorFunc - used to get color of pixel for non-white values in histogram output - (@params x coordinate: int, @returns pixel)
    */
    function createHistogram(pixels, uniqueValues, histogramWidth, histogramHeight, pixelHashFunc, histogramColorFunc){
        let percentagesOnly = !histogramColorFunc;
        
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
        let histogramPercentages = new Uint8Array(uniqueValues);
        for(let i=0;i<histogramArray.length;i++){
            let percentage = 0;
            //dividing by 0 will be infinity
            if(max > 0){
                percentage = Math.ceil(histogramArray[i] / max * 100);
            }
            histogramPercentages[i] = percentage;
        }
        
        if(percentagesOnly){
            return histogramPercentages;
        }
        
        //turn bar height percentage into pixel value
        function calculateYAxisStartIndex(heightPercentage){
            return histogramHeight - Math.ceil(heightPercentage / 100 * histogramHeight);
        }
        
        let histogramBuffer = new Polyfills.SharedArrayBuffer(histogramWidth * histogramHeight * 4);
        let histogramPixels = new Uint8ClampedArray(histogramBuffer);
        
        let x = 0;
        let y = 0;
        let whitePixel = Pixel.create(255, 255, 255);
        for(let i=0;i<histogramPixels.length;i+=4){
            let outputPixel;
            if(y >= calculateYAxisStartIndex(histogramPercentages[x])){
                outputPixel = histogramColorFunc(x);
            }
            else{
                outputPixel = whitePixel;
            }
            histogramPixels[i] = outputPixel[Pixel.R_INDEX];
            histogramPixels[i+1] = outputPixel[Pixel.G_INDEX];
            histogramPixels[i+2] = outputPixel[Pixel.B_INDEX];
            histogramPixels[i+3] = outputPixel[Pixel.A_INDEX];
            
            x++;
            if(x >= histogramWidth){
                x = 0;
                y++;
            }
        }
        return histogramBuffer;
    }
    
    function createBwHistogram(pixels){
        return createHistogram(pixels, 256, histogramBwWidth, histogramHeight, PixelMath.lightness, false);
    }
    
    function createHueHistogram(pixels){
        hueArray = hueArray || createHueArray();
        let retPixel = Pixel.create(0,0,0);
        
        return createHistogram(pixels, 360, histogramColorWidth, histogramHeight, PixelMath.hue, (hue)=>{
            let baseIndex = hue * 4;
            retPixel[0] = hueArray[baseIndex];
            retPixel[1] = hueArray[baseIndex+1];
            retPixel[2] = hueArray[baseIndex+2];
            retPixel[3] = hueArray[baseIndex+3];
            
            return retPixel;
        });
    }
    
    function createHueArray(){
        let hueArray = new Uint8Array(360 * 4);
        let pixel = Pixel.create(0, 0, 0);
        let baseIndex = 0;
        for(let i=0;i<360;i++){
            pixel = PixelMath.hueToPixel(i, pixel);
            hueArray[baseIndex] = pixel[0];
            hueArray[baseIndex+1] = pixel[1];
            hueArray[baseIndex+2] = pixel[2];
            hueArray[baseIndex+3] = pixel[3];
            baseIndex += 4;
        }
        
        return hueArray;
    }
    
    var hueArray = null;
    
    return {
        createBwHistogram: createBwHistogram,
        createHueHistogram: createHueHistogram,
    };
})(App.Pixel, App.Polyfills, App.PixelMath, App.Constants);