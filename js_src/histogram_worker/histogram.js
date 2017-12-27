var App = App || {};

App.Histogram = (function(Pixel){
    var histogramHeight = 64;
    var histogramWidth = 256;
    
    
    function createHistogramArray(){
        //can't use typed array here,
        //since we don't know the maximum integer value
        //for each item
        var histogramArray = [];
        for(let i=0;i<256;i++){
            histogramArray[i] = 0;
        }
        return histogramArray;
    }
    
    function createHistogram(pixels){
        var histogramArray = createHistogramArray();
        
        for(let i=0;i<pixels.length;i+=4){
            let pixel = Pixel.create(pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]);
            let lightness = Pixel.lightness(pixel);
            histogramArray[lightness] = histogramArray[lightness] + 1;
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
        
        var histogramBuffer = new SharedArrayBuffer(histogramWidth * histogramHeight * 4);
        var histogramPixels = new Uint8ClampedArray(histogramBuffer);
        
        var x = 0;
        var y = 0;
        for(let i=0;i<histogramPixels.length;i+=4){
            let outputPixel;
            if(y >= histogramArray[x]){
                outputPixel = Pixel.create(0, 0, 0);
            }
            else{
                outputPixel = Pixel.create(255, 255, 255);
            }
            histogramPixels[i] = outputPixel.r;
            histogramPixels[i+1] = outputPixel.g;
            histogramPixels[i+2] = outputPixel.b;
            histogramPixels[i+3] = outputPixel.a;
            
            x++;
            if(x >= histogramWidth){
                x = 0;
                y++;
            }
        }
        return histogramBuffer;
    }
    
    return {
        createHistogram: createHistogram,
        height: histogramHeight,
        width: histogramWidth,
    };
})(App.Pixel);