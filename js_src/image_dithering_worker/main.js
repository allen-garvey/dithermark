(function(Timer, WorkerUtil, Pixel, Algorithms, WorkerHeaders){
    var ditherAlgorithms = Algorithms.model();
    var messageHeader = {};
    var pixelBufferOriginal;
    
    
    function ditherAction(messageHeader){
        //dither the image
        var selectedAlgorithm = ditherAlgorithms[messageHeader.algorithmId];
        
        var pixelBufferCopy = WorkerUtil.copyBufferWithMessageType(pixelBufferOriginal, messageHeader.messageTypeId);
        var pixels = pixelBufferCopy.pixels;
        var imageDataBuffer = pixelBufferCopy.buffer;
        
        var imageHeight = messageHeader.imageHeight;
        var imageWidth = messageHeader.imageWidth;
        var threshold = messageHeader.threshold;
        
        Timer.megapixelsPerSecond(selectedAlgorithm.title + '          ', imageHeight * imageWidth, ()=>{
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
            //LOAD_IMAGE just returns
            default:
                return;
        }
        
    };
})(App.Timer, App.WorkerUtil, App.Pixel, App.Algorithms, App.WorkerHeaders);

