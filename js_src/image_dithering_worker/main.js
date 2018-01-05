(function(Timer, WorkerUtil, Pixel, Algorithms, WorkerHeaders){
    var ditherAlgorithms = Algorithms.model();
    var messageInSequence = 0;
    var messageHeader = {};
    var pixelBufferOriginal;
    
    onmessage = function(e) {
        messageInSequence++;
        var messageData = e.data;
        
        //header
        if(messageInSequence === 1){
            messageHeader = WorkerUtil.parseMessageHeader(messageData);
            return;
        }
        //buffer, or blank, if we have already received the image
        else{
            messageInSequence = 0;
            if(messageData.byteLength > 0){
                pixelBufferOriginal = messageData;
            }
        }
        if(messageHeader.messageTypeId === WorkerHeaders.LOAD_IMAGE){
            return;
        }
        
        var selectedAlgorithm = ditherAlgorithms[messageHeader.algorithmId];
        
        var pixelBufferCopy = WorkerUtil.copyBuffer(pixelBufferOriginal);
        var pixels = pixelBufferCopy.pixels;
        var imageDataBuffer = pixelBufferCopy.buffer;
        
        var imageHeight = messageHeader.imageHeight;
        var imageWidth = messageHeader.imageWidth;
        var threshold = messageHeader.threshold;
        
        Timer.megapixelsPerSecond(selectedAlgorithm.title + '          ', imageHeight * imageWidth, ()=>{
           imageDataBuffer = selectedAlgorithm.algorithm(pixels, imageWidth, imageHeight, threshold, messageHeader.blackPixel, messageHeader.whitePixel); 
        });
        
        postMessage(imageDataBuffer);
    }
})(App.Timer, App.WorkerUtil, App.Pixel, App.Algorithms, App.WorkerHeaders);

