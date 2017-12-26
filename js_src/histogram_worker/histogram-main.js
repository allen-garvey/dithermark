var messageInSequence = 0;
var messageHeader = {};

onmessage = function(e) {
    messageInSequence++;
    var messageData = e.data;
    
    //header
    if(messageInSequence === 1){
        messageHeader.imageWidth = messageData[0];
        messageHeader.imageHeight = messageData[1];
        return;
    }
    //buffer, or blank, if we have already received the image
    else{
        messageInSequence = 0;
    }
    
    var imageBuffer = messageData;
    var pixels = new Uint8ClampedArray(imageBuffer);
    var histogramBuffer = App.Histogram.createHistogram(pixels, messageHeader.imageWidth, messageHeader.imageHeight);
    
    postMessage(histogramBuffer);
}