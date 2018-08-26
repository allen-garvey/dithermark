import Constants from '../generated_output/app/constants.js';
import Canvas from './canvas.js';

    
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
    
    //clear canvas
    context.fillStyle = 'white';
    context.fillRect(0, 0, histogramWidth, histogramHeight);
    
    context.beginPath();
    context.fillStyle = 'black';
    
    let xIndex = 0;
    heightPercentages.forEach((heightPercentage)=>{
        let height = Math.ceil(heightPercentage / 100 * histogramHeight);
        let yIndex = histogramHeight - height;
        context.rect(xIndex, yIndex, barWidth, height);
        xIndex += barWidth;
    });
    context.fill();
}


function drawColorHistogram(targetCanvasObject, heightPercentages){
    let context = targetCanvasObject.context;
    let histogramHeight = Constants.histogramHeight;
    let histogramWidth = Constants.histogramColorWidth;
    let barWidth = Math.floor(histogramWidth / heightPercentages.length);
    
    //clear canvas
    context.fillStyle = 'white';
    context.fillRect(0, 0, histogramWidth, histogramHeight);
    
    let xIndex = 0;
    heightPercentages.forEach((heightPercentage, hue)=>{
        let height = Math.ceil(heightPercentage / 100 * histogramHeight);
        let yIndex = histogramHeight - height;
        
        context.fillStyle = `hsl(${hue}, 100%, 50%)`;
        context.fillRect(xIndex, yIndex, barWidth, height);
        xIndex += barWidth;
    });
}

export default {
    height: Constants.histogramHeight,
    width: Constants.histogramBwWidth,
    colorWidth: Constants.histogramColorWidth,
    drawIndicator: drawIndicator,
    drawBwHistogram: drawBwHistogram,
    drawColorHistogram: drawColorHistogram,
};