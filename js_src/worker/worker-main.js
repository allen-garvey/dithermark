import Timer from 'app-performance-timer'; //symbol resolved in webpack config
import WorkerUtil from './worker-util.js';
import WorkerHeaders from '../shared/worker-headers.js';
import Algorithms from '../generated_output/worker/algorithm-model.js';
import Histogram from './histogram.js';
import { getColorQuantizationModes } from '../shared/models/color-quantization-modes.js';
import { getColorQuantizationAlgo } from './models/optimize-palette-translation.js';

const colorQuantizationModes = getColorQuantizationModes();

const ditherAlgorithms = Algorithms.model();
let imageId;
let pixelBufferOriginal;
let imageHeight = 0;
let imageWidth = 0;

function histogramAction(imageId, messageHeader) {
    const messageTypeId = messageHeader.messageTypeId;
    //don't need to copy the original imagedata, since we are not modifying it
    const pixels = new Uint8ClampedArray(pixelBufferOriginal);
    let histogramPixels;

    if (messageTypeId === WorkerHeaders.HUE_HISTOGRAM) {
        histogramPixels = WorkerUtil.createHistogramBuffer(360);
        Histogram.createHueHistogram(pixels, histogramPixels);
    } else {
        histogramPixels = WorkerUtil.createHistogramBuffer(256);
        Histogram.createBwHistogram(pixels, histogramPixels);
    }
    self.postMessage({
        messageTypeId,
        imageId,
        pixels: histogramPixels,
    });
}

function bwDitherAction(imageId, messageHeader) {
    const selectedAlgorithm = ditherAlgorithms[messageHeader.algorithmIndex];

    const pixels = WorkerUtil.copyPixels(pixelBufferOriginal);

    const imageHeight = messageHeader.imageHeight;
    const imageWidth = messageHeader.imageWidth;
    const threshold = messageHeader.threshold;

    Timer.megapixelsPerSecond(
        `${selectedAlgorithm.title} processed in webworker`,
        imageHeight * imageWidth,
        () => {
            selectedAlgorithm.algorithm(
                pixels,
                imageWidth,
                imageHeight,
                threshold,
                messageHeader.blackPixel,
                messageHeader.whitePixel
            );
        }
    );

    self.postMessage(
        WorkerUtil.createDitherResponse(
            imageId,
            messageHeader.messageTypeId,
            pixels
        )
    );
}

function colorDitherAction(imageId, messageHeader) {
    const selectedAlgorithm = ditherAlgorithms[messageHeader.algorithmIndex];

    const pixels = WorkerUtil.copyPixels(pixelBufferOriginal);

    const imageHeight = messageHeader.imageHeight;
    const imageWidth = messageHeader.imageWidth;
    const colorDitherModeId = messageHeader.colorDitherModeId;
    const colors = messageHeader.colors;

    Timer.megapixelsPerSecond(
        `${selectedAlgorithm.title} processed in webworker`,
        imageHeight * imageWidth,
        () => {
            selectedAlgorithm.algorithm(
                pixels,
                imageWidth,
                imageHeight,
                colorDitherModeId,
                colors
            );
        }
    );

    self.postMessage(
        WorkerUtil.createDitherResponse(
            imageId,
            messageHeader.messageTypeId,
            pixels
        )
    );
}

function createOptimizePaletteProgressCallback(
    imageId,
    colorQuantizationModeId,
    numColors,
    messageHeader
) {
    return (percentage) => {
        self.postMessage(
            WorkerUtil.createOptimizePaletteProgressBuffer(
                imageId,
                colorQuantizationModeId,
                numColors,
                percentage
            )
        );
    };
}

function optimizePaletteAction(
    imageId,
    messageHeader,
    imageWidth,
    imageHeight
) {
    //don't need to copy the original imagedata, since we are not modifying it
    const pixels = new Uint8ClampedArray(pixelBufferOriginal);
    const colorQuantizationId = messageHeader.colorQuantizationModeId;
    const colorQuantization = colorQuantizationModes[colorQuantizationId];
    const colorQuantizationAlgo = getColorQuantizationAlgo(colorQuantization);
    const messageTypeId = messageHeader.messageTypeId;
    const numColors = messageHeader.numColors;
    const progressCallback = createOptimizePaletteProgressCallback(
        imageId,
        colorQuantizationId,
        numColors,
        messageHeader
    );
    const quantizationFunction = colorQuantizationAlgo.algo;
    let paletteBuffer;

    Timer.megapixelsPerSecond(
        `Optimize palette ${colorQuantization.title}`,
        pixels.length / 4,
        () => {
            paletteBuffer = quantizationFunction(
                pixels,
                numColors,
                colorQuantizationAlgo.options,
                imageWidth,
                imageHeight,
                progressCallback
            );
        }
    );

    self.postMessage(
        WorkerUtil.createOptimizePaletteBuffer(
            imageId,
            paletteBuffer,
            messageTypeId,
            colorQuantizationId
        )
    );
}

self.onmessage = (e) => {
    const messageData = e.data;

    switch (messageData.messageTypeId) {
        case WorkerHeaders.DITHER:
        case WorkerHeaders.DITHER_BW:
            bwDitherAction(imageId, messageData);
            break;
        case WorkerHeaders.DITHER_COLOR:
            colorDitherAction(imageId, messageData);
            break;
        case WorkerHeaders.HISTOGRAM:
        case WorkerHeaders.HUE_HISTOGRAM:
            histogramAction(imageId, messageData);
            break;
        case WorkerHeaders.OPTIMIZE_PALETTE:
            optimizePaletteAction(
                imageId,
                messageData,
                imageWidth,
                imageHeight
            );
            break;
        //LOAD_IMAGE case
        default:
            imageHeight = messageData.imageHeight;
            imageWidth = messageData.imageWidth;
            imageId = messageData.imageId;
            pixelBufferOriginal = messageData.buffer;
            break;
    }
};
