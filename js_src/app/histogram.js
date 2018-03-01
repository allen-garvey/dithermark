App.Histogram = (function(Pixel){
    var histogramHeight = <?= HISTOGRAM_HEIGHT; ?>;
    var histogramWidth = <?= HISTOGRAM_BW_WIDTH; ?>;
    var colorHistogramWidth = <?= HISTOGRAM_COLOR_WIDTH; ?>;
    
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