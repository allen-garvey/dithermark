var ditherAlgorithms = App.Algorithms.model();

var messageInSequence = 0;
var messageHeader = {};
var pixelBufferOriginal;

onmessage = function(e) {
    messageInSequence++;
    var messageData = e.data;
    
    //header
    if(messageInSequence === 1){
        messageHeader.imageWidth = messageData[0];
        messageHeader.imageHeight = messageData[1];
        messageHeader.threshold = messageData[2];
        messageHeader.algorithmId = messageData[3];
        messageHeader.blackPixel = App.Pixel.create(messageData[4], messageData[5], messageData[6]);
        messageHeader.whitePixel = App.Pixel.create(messageData[7], messageData[8], messageData[9]);
        return;
    }
    //buffer, or blank, if we have already received the image
    else{
        messageInSequence = 0;
        if(messageData.byteLength > 0){
            pixelBufferOriginal = messageData;
        }
    }
    var selectedAlgorithm = ditherAlgorithms[messageHeader.algorithmId];
    if(!selectedAlgorithm){
        return;
    }
    
    var pixelBufferCopy = App.WorkerUtil.copyBuffer(pixelBufferOriginal);
    var pixels = pixelBufferCopy.pixels;
    var imageDataBuffer = pixelBufferCopy.buffer;
    
    var imageHeight = messageHeader.imageHeight;
    var imageWidth = messageHeader.imageWidth;
    var threshold = messageHeader.threshold;
    
    App.Timer.megapixelsPerSecond(selectedAlgorithm.title + '          ', imageHeight * imageWidth, ()=>{
       imageDataBuffer = selectedAlgorithm.algorithm(pixels, imageWidth, imageHeight, threshold, messageHeader.blackPixel, messageHeader.whitePixel); 
    });
    
    postMessage(imageDataBuffer);
}