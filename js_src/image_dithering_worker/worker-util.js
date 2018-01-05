App.WorkerUtil = (function(WorkerHeaders, Pixel){
    /*
    //based on: https://stackoverflow.com/questions/10100798/whats-the-most-straightforward-way-to-copy-an-arraybuffer-object
    function copyBuffer(pixelBufferOriginal){
        //faster than using for loop
        var copiedBuffer = new ArrayBuffer(pixelBufferOriginal.byteLength);
        var copiedPixels = new Uint8Array(copiedBuffer);
        copiedPixels.set(new Uint8Array(pixelBufferOriginal));
        
        return {buffer: copiedBuffer, pixels: copiedPixels};
    }
    */
    
    //based on: https://stackoverflow.com/questions/10100798/whats-the-most-straightforward-way-to-copy-an-arraybuffer-object
    function copyBufferWithMessageType(pixelBufferOriginal, messageTypeId){
        //faster than using for loop
        var copiedBuffer = new ArrayBuffer(pixelBufferOriginal.byteLength + 1);
        var copiedPixels = new Uint8Array(copiedBuffer);
        
        //add messagetypeid to start of pixelbuffer
        copiedPixels[0] = messageTypeId;
        var copiedPixelsSubarray = copiedPixels.subarray(1, copiedPixels.length);
        copiedPixelsSubarray.set(new Uint8Array(pixelBufferOriginal));
        
        return {buffer: copiedBuffer, pixels: copiedPixelsSubarray};
    }
    
    
    function parseDitherMessageHeader(messageData){
        let messageTypeId = messageData[0];
        
        let messageHeader = {
            messageTypeId: messageTypeId,
            imageWidth : messageData[1],
            imageHeight : messageData[2],
            algorithmId : messageData[3],
            threshold : messageData[4],
        };
        if(messageTypeId === WorkerHeaders.DITHER){
            messageHeader.blackPixel = Pixel.create(messageData[5], messageData[6], messageData[7]);
            messageHeader.whitePixel = Pixel.create(messageData[8], messageData[9], messageData[10]);   
        }
        else{
            messageHeader.blackPixel = Pixel.create(0, 0, 0);
            messageHeader.whitePixel = Pixel.create(255, 255, 255);
        }
        return messageHeader;
    }
    
    function parseLoadImageMessageHeader(messageData){
        let messageHeader = {
            messageTypeId: messageData[0],
            imageWidth : messageData[1],
            imageHeight : messageData[2],
        };

        return messageHeader;
    }
    
    function parseMessageHeader(headerBuffer){
        let messageData = new Uint16Array(headerBuffer);
        let messageTypeId = messageData[0];
        
        switch(messageTypeId){
            case WorkerHeaders.LOAD_IMAGE:
                return parseLoadImageMessageHeader(messageData);
            case WorkerHeaders.DITHER:
            case WorkerHeaders.DITHER_BW:
                return parseDitherMessageHeader(messageData);
            default:
                return null;
        }
    }
    
    
    return {
        // copyBuffer: copyBuffer,
        copyBufferWithMessageType: copyBufferWithMessageType,
        parseMessageHeader: parseMessageHeader,
    };
})(App.WorkerHeaders, App.Pixel);