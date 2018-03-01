App.Histogram = (function(Pixel){
    var histogramHeight = 64;
    var histogramWidth = 256;
    var colorHistogramWidth = 360;
    
    function drawIndicator(targetCanvasObject, threshold){
        //clear indicator
        targetCanvasObject.context.clearRect(0, 0, targetCanvasObject.canvas.width, targetCanvasObject.canvas.height);
        targetCanvasObject.context.fillStyle = "magenta";
        targetCanvasObject.context.fillRect(threshold, 0, 1, histogramHeight);
    }
    
    return {
        height: histogramHeight,
        width: histogramWidth,
        colorWidth: colorHistogramWidth,
        drawIndicator: drawIndicator,
    };
})(App.Pixel);