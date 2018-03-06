App.Histogram = (function(Pixel, Constants){
    
    function drawIndicator(targetCanvasObject, threshold){
        //clear indicator
        targetCanvasObject.context.clearRect(0, 0, targetCanvasObject.canvas.width, targetCanvasObject.canvas.height);
        targetCanvasObject.context.fillStyle = "magenta";
        targetCanvasObject.context.fillRect(threshold, 0, 1, Constants.histogramHeight);
    }
    
    return {
        height: Constants.histogramHeight,
        width: Constants.histogramBwWidth,
        colorWidth: Constants.histogramColorWidth,
        drawIndicator: drawIndicator,
    };
})(App.Pixel, App.Constants);