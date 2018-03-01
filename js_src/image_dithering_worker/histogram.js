
App.Histogram = (function(Pixel, Polyfills, PixelMath){
    var histogramHeight = <?= HISTOGRAM_HEIGHT; ?>;
    var histogramBwWidth = <?= HISTOGRAM_BW_WIDTH; ?>;
    var histogramColorWidth = <?= HISTOGRAM_COLOR_WIDTH; ?>
    
    function createHistogramArray(histogramWidth){
        //can't use typed array here,
        //since we don't know the maximum integer value
        //for each item
        var histogramArray = [];
        for(let i=0;i<histogramWidth;i++){
            histogramArray[i] = 0;
        }
        return histogramArray;
    }
    
    /*
    * @param pixelHashFunc - used to get index of pixel that is used for counting unique values for histogram - (@params pixel @returns int)
    * @param histogramColorFunc - used to get color of pixel for non-white values in histogram output - (@params x coordinate: int, @returns pixel)
    */
    function createHistogram(pixels, histogramWidth, histogramHeight, pixelHashFunc, histogramColorFunc){
        var histogramArray = createHistogramArray(histogramWidth);
        
        for(let i=0;i<pixels.length;i+=4){
            let pixel = Pixel.create(pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]);
            let index = pixelHashFunc(pixel);
            histogramArray[index] = histogramArray[index] + 1;
        }
        
        //find maximum value so we can normalize values
        var max = 0;
        histogramArray.forEach((element)=>{
            if(element > max){
                max = element;
            }
        });
        histogramArray = histogramArray.map(function(element){
            //normalize values as percentage of 100, from 0 to 1
            var percentage = 0;
            //dividing by 0 will be infinity
            if(max > 0){
                percentage = element / max;
            }
            //now figure out histogram height for that x coodinate
            let barLength = Math.ceil(percentage * histogramHeight);
            //now figure out at which y coordinate histogram should start with 0,0 being top left
            return histogramHeight - barLength;
        });
        
        var histogramBuffer = new Polyfills.SharedArrayBuffer(histogramWidth * histogramHeight * 4);
        var histogramPixels = new Uint8ClampedArray(histogramBuffer);
        
        var x = 0;
        var y = 0;
        let whitePixel = Pixel.create(255, 255, 255);
        for(let i=0;i<histogramPixels.length;i+=4){
            let outputPixel;
            if(y >= histogramArray[x]){
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
        let blackPixel = Pixel.create(0, 0, 0);
        return createHistogram(pixels, histogramBwWidth, histogramHeight, PixelMath.lightness, ()=>{return blackPixel;});
    }
    
    function createHueHistogram(pixels){
        hueArray = hueArray || createHueArray();
        let retPixel = Pixel.create(0,0,0);
        
        return createHistogram(pixels, histogramColorWidth, histogramHeight, PixelMath.hue, (hue)=>{
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
        let baseIndex = 0;
        for(let i=0;i<360;i++){
            let pixel = PixelMath.hueToPixel(i);
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
})(App.Pixel, App.Polyfills, App.PixelMath);