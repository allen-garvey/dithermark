(function(Timer, WorkerUtil, Pixel, Algorithms, WorkerHeaders, Histogram){
    var ditherAlgorithms = Algorithms.model();
    var messageHeader = {};
    var pixelBufferOriginal;
    
    
    function histogramAction(messageHeader){
        //don't need to copy the original imagedata, since we are not modifying it
        var pixels = new Uint8ClampedArray(pixelBufferOriginal);
        var histogramBuffer;
        if(messageHeader.messageTypeId === WorkerHeaders.HUE_HISTOGRAM){
            histogramBuffer = Histogram.createHueHistogram(pixels, messageHeader.messageTypeId);
        }
        else{
            histogramBuffer = Histogram.createBwHistogram(pixels, messageHeader.messageTypeId);   
        }
        //add messageTypeId
        var histogramBufferReturn = WorkerUtil.copyBufferWithMessageType(histogramBuffer, messageHeader.messageTypeId);
        postMessage(histogramBufferReturn.buffer);
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
            //LOAD_IMAGE just returns
            default:
                return;
        }
        
    };
})(App.Timer, App.WorkerUtil, App.Pixel, App.Algorithms, App.WorkerHeaders, App.Histogram);

