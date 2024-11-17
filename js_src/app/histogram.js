import Canvas from './canvas.js';

export const HISTOGRAM_HEIGHT = 96;
export const HISTOGRAM_BW_WIDTH = 256;
export const HISTOGRAM_COLOR_WIDTH = 360;

function drawIndicator(targetCanvasObject, threshold) {
    Canvas.clear(targetCanvasObject);
    targetCanvasObject.context.fillStyle = 'magenta';
    targetCanvasObject.context.fillRect(threshold, 0, 1, HISTOGRAM_HEIGHT);
}

function drawBwHistogram(targetCanvasObject, heightPercentages) {
    let context = targetCanvasObject.context;
    let histogramHeight = HISTOGRAM_HEIGHT;
    let histogramWidth = HISTOGRAM_BW_WIDTH;
    let barWidth = Math.floor(histogramWidth / heightPercentages.length);

    //clear canvas
    context.fillStyle = 'white';
    context.fillRect(0, 0, histogramWidth, histogramHeight);

    context.beginPath();
    context.fillStyle = 'black';

    let xIndex = 0;
    heightPercentages.forEach((heightPercentage) => {
        let height = Math.ceil((heightPercentage / 100) * histogramHeight);
        let yIndex = histogramHeight - height;
        context.rect(xIndex, yIndex, barWidth, height);
        xIndex += barWidth;
    });
    context.fill();
}

function drawColorHistogram(targetCanvasObject, heightPercentages) {
    let context = targetCanvasObject.context;
    let histogramHeight = HISTOGRAM_HEIGHT;
    let histogramWidth = HISTOGRAM_COLOR_WIDTH;
    let barWidth = Math.floor(histogramWidth / heightPercentages.length);

    //clear canvas
    context.fillStyle = 'white';
    context.fillRect(0, 0, histogramWidth, histogramHeight);

    let xIndex = 0;
    heightPercentages.forEach((heightPercentage, hue) => {
        let height = Math.ceil((heightPercentage / 100) * histogramHeight);
        let yIndex = histogramHeight - height;

        context.fillStyle = `hsl(${hue}, 100%, 50%)`;
        context.fillRect(xIndex, yIndex, barWidth, height);
        xIndex += barWidth;
    });
}

export default {
    drawIndicator,
    drawBwHistogram,
    drawColorHistogram,
};
