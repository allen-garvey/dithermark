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
    
    
    function initHistorgram(targetCanvasObject){
        targetCanvasObject.canvas.width = histogramWidth;
        targetCanvasObject.canvas.height = histogramHeight;
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
        //normalize values as percentage of 100, from 0 to 1
        histogramArray = histogramArray.map(function(element){
            //dividing by 0 will be infinity
            if(max === 0){
                return 0;
            }
            return element / max;
        });
        
        var outputImageData = targetCanvasObject.context.createImageData(histogramWidth, histogramHeight);
        var outputData = outputImageData.data;
        
        var x = 0;
        var y = 0;
        for(let i=0;i<outputData.length;i+=4){
            let barLength = Math.ceil(histogramArray[x] * histogramHeight);
            let outputPixel;
            if(y <= barLength){
                outputPixel = Pixel.create(255, 255, 255, 255);
            }
            else{
                outputPixel = Pixel.create(0, 0, 0, 255);
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
        
        
        console.log(outputImageData);
        targetCanvasObject.context.putImageData(outputImageData, 0, 0);
    }
    
    return {
        initHistorgram: initHistorgram,
        drawHistorgram: drawHistorgram,
    };
})(App.Pixel);