
onmessage = function(e) {
    var messageData = e.data;
    var imageBuffer = messageData;
    var pixels = new Uint8ClampedArray(imageBuffer);
    var histogramBuffer = App.Histogram.createHistogram(pixels);
    
    postMessage(histogramBuffer);
}