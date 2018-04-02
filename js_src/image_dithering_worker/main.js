(function(Timer, WorkerUtil, Pixel, Algorithms, WorkerHeaders, Histogram, OptimizePalette, ColorQuantizationModes){
    var ditherAlgorithms = Algorithms.model();
    var messageHeader = {};
    var pixelBufferOriginal;
    
    
    function histogramAction(messageHeader){
        let messageTypeId = messageHeader.messageTypeId;
        //don't need to copy the original imagedata, since we are not modifying it
        let pixels = new Uint8ClampedArray(pixelBufferOriginal);
        let histogramBuffer;
        
        if(messageTypeId === WorkerHeaders.HUE_HISTOGRAM){
            histogramBuffer = WorkerUtil.createHistogramBuffer(360, messageTypeId);
            Histogram.createHueHistogram(pixels, histogramBuffer.array);
        }
        else{
            histogramBuffer = WorkerUtil.createHistogramBuffer(256, messageTypeId);
            Histogram.createBwHistogram(pixels, histogramBuffer.array);   
        }
        postMessage(histogramBuffer.buffer);
    }
    
    function ditherAction(messageHeader){
        //dither the image
        var selectedAlgorithm = ditherAlgorithms[messageHeader.algorithmId];
        
        var pixelBufferCopy = WorkerUtil.copyBufferWithMessageType(pixelBufferOriginal, messageHeader.messageTypeId);
        var pixels = pixelBufferCopy.pixels;
        var imageDataBuffer = pixelBufferCopy.buffer;
        
        var imageHeight = messageHeader.imageHeight;
        var imageWidth = messageHeader.imageWidth;
        var threshold = messageHeader.threshold;
        
        Timer.megapixelsPerSecond(`${selectedAlgorithm.title} processed in webworker`, imageHeight * imageWidth, ()=>{
          selectedAlgorithm.algorithm(pixels, imageWidth, imageHeight, threshold, messageHeader.blackPixel, messageHeader.whitePixel); 
        });
        
        postMessage(imageDataBuffer);
    }
    
    function optimizePaletteAction(messageHeader){
        //don't need to copy the original imagedata, since we are not modifying it
        let pixels = new Uint8ClampedArray(pixelBufferOriginal);
        let paletteBuffer;
        const colorQuantizationId = messageHeader.colorQuantizationModeId;
        Timer.megapixelsPerSecond('Optimize palette', pixels.length / 4, ()=>{
            let algoName = ColorQuantizationModes[colorQuantizationId].algo;
            paletteBuffer = OptimizePalette[algoName](pixels, messageHeader.numColors, colorQuantizationId); 
        });
        
        postMessage(WorkerUtil.createOptimizePaletteBuffer(paletteBuffer, messageHeader.messageTypeId, colorQuantizationId));
    }
    
    
    onmessage = function(e){
        var messageData = e.data;
        
        //previous message was load image header, so load image
        if(messageHeader.messageTypeId === WorkerHeaders.LOAD_IMAGE){
            if(messageData.byteLength > 0){
                pixelBufferOriginal = messageData;
            }
            messageHeader = {};
            return;
        }
        //get new headers
        messageHeader = WorkerUtil.parseMessageHeader(messageData);
        //perform action based on headers
        switch(messageHeader.messageTypeId){
            case WorkerHeaders.DITHER:
            case WorkerHeaders.DITHER_BW:
                ditherAction(messageHeader);
                break;
            case WorkerHeaders.HISTOGRAM:
            case WorkerHeaders.HUE_HISTOGRAM:
                histogramAction(messageHeader);
                break;
            case WorkerHeaders.OPTIMIZE_PALETTE:
                optimizePaletteAction(messageHeader);
                break;
            //LOAD_IMAGE just returns
            default:
                return;
        }
        
    };
})(App.Timer, App.WorkerUtil, App.Pixel, App.Algorithms, App.WorkerHeaders, App.Histogram, App.OptimizePalette, App.ColorQuantizationModes);

