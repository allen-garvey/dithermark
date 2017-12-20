App.Histogram = (function(Pixel){
    var histogramHeight = 64;
    var histogramWidth = 256;
    
    
    function createHistogramArray(){
        var histogramArray = [];
        for(let i=0;i<256;i++){
            histogramArray[i] = 0;
        }
        return histogramArray;
    }
    
    function drawHistorgram(sourceContext, targetCanvasObject, imageWidth, imageHeight){
        var histogramArray = createHistogramArray();
        
        var pixels = sourceContext.getImageData(0, 0, imageWidth, imageHeight).data;
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
        
        var outputImageData = targetCanvasObject.context.createImageData(histogramWidth, histogramHeight);
        var outputData = outputImageData.data;
        
        var x = 0;
        var y = 0;
        for(let i=0;i<outputData.length;i+=4){
            let outputPixel;
            if(y >= histogramArray[x]){
                outputPixel = Pixel.create(0, 0, 0);
            }
            else{
                outputPixel = Pixel.create(255, 255, 255);
            }
            outputData[i] = outputPixel.r;
            outputData[i+1] = outputPixel.g;
            outputData[i+2] = outputPixel.b;
            outputData[i+3] = outputPixel.a;
            
            x++;
            if(x >= histogramWidth){
                x = 0;
                y++;
            }
        }
        targetCanvasObject.context.putImageData(outputImageData, 0, 0);
    }
    
    function drawIndicator(targetCanvasObject, threshold){
        //clear indicator
        targetCanvasObject.context.clearRect(0, 0, targetCanvasObject.canvas.width, targetCanvasObject.canvas.height);
        targetCanvasObject.context.fillStyle = "magenta";
        targetCanvasObject.context.fillRect(threshold, 0, 1, histogramHeight);
    }
    
    return {
        drawHistorgram: drawHistorgram,
        height: histogramHeight,
        width: histogramWidth,
        drawIndicator: drawIndicator,
    };
})(App.Pixel);