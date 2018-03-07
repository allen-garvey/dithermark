App.Histogram = (function(Pixel, Constants, Canvas){
    
    function drawIndicator(targetCanvasObject, threshold){
        Canvas.clear(targetCanvasObject);
        targetCanvasObject.context.fillStyle = "magenta";
        targetCanvasObject.context.fillRect(threshold, 0, 1, Constants.histogramHeight);
    }
    
    function drawBwHistogram(targetCanvasObject, heightPercentages){
        let context = targetCanvasObject.context;
        let histogramHeight = Constants.histogramHeight;
        let histogramWidth = Constants.histogramBwWidth;
        let barWidth = Math.floor(histogramWidth / heightPercentages.length);
        
        Canvas.clear(targetCanvasObject);
        //need to do this or canvas will not be cleared
        //https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clearRect
        context.beginPath();
        context.fillStyle = 'black';
        
        let xIndex = 0;
        heightPercentages.forEach((heightPercentage)=>{
            let height = Math.ceil(heightPercentage / 100 * histogramHeight);
            let yIndex = histogramHeight - height;
            context.rect(xIndex, yIndex, barWidth, height)
            xIndex += barWidth;
        });
        context.fill();
    }
    
    return {
        height: Constants.histogramHeight,
        width: Constants.histogramBwWidth,
        colorWidth: Constants.histogramColorWidth,
        drawIndicator: drawIndicator,
        drawBwHistogram: drawBwHistogram,
    };
})(App.Pixel, App.Constants, App.Canvas);