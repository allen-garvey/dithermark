import Polyfills from '../shared/polyfills.js';
import WorkerHeaders from '../shared/worker-headers.js';
import ColorPicker from './color-picker.js';
import ArrayUtil from '../shared/array-util.js';
import Pixel from '../shared/pixel.js';


function createDitherWorkerHeader(imageWidth, imageHeight, threshold, algorithmId, blackPixel, whitePixel){
    return {
        messageTypeId: WorkerHeaders.DITHER,
        imageWidth,
        imageHeight,
        algorithmId,
        threshold,
        blackPixel,
        whitePixel,
    };
}

function createDitherWorkerBwHeader(imageWidth, imageHeight, threshold, algorithmId){
    return {
        messageTypeId: WorkerHeaders.DITHER_BW,
        imageWidth,
        imageHeight,
        algorithmId,
        threshold,
        blackPixel: Pixel.create(0, 0, 0),
        whitePixel: Pixel.create(255, 255, 255),
    };
}

function createDitherWorkerColorHeader(imageWidth, imageHeight, algorithmId, colorDitherModeId, colorsHex){
    return {
        messageTypeId: WorkerHeaders.DITHER_COLOR,
        imageWidth,
        imageHeight,
        algorithmId,
        colorDitherModeId,
        colors: ColorPicker.prepareForWorker(colorsHex),
    };
}
//used to reduce race conditions when image
//changes while worker is still working on previous image
//doesn't 100% eliminate problem because if image changes
//256 times before worker is done, will still have a problem,
//but Uint8 is limit for worker return message, and this 
//seems like a reasonable compromise
function generateImageId(previousImageId){
    if(previousImageId >= 255){
        return 0;
    }
    return previousImageId + 1;
}

function createLoadImageMessage(imageId, imageWidth, imageHeight, buffer){
    return {
        messageTypeId: WorkerHeaders.LOAD_IMAGE,
        imageId,
        imageHeight,
        imageWidth,
        buffer,
    };
}

function createHistogramWorkerHeader(){
    return {
        messageTypeId: WorkerHeaders.HISTOGRAM,
    };
}
//filterId for memorization purpores
function createOptimizePaletteHeader(numColors, colorQuantizationModeId){
    return {
        messageTypeId: WorkerHeaders.OPTIMIZE_PALETTE,
        numColors,
        colorQuantizationModeId,
    };
}

function createColorHistogramWorkerHeader(){
    return {
        messageTypeId: WorkerHeaders.HUE_HISTOGRAM,
    };
}

//returns promise;
//gets worker src code, and then initializes queue of workers
//very loosely based on: https://stackoverflow.com/questions/10343913/how-to-create-a-web-worker-from-a-string
function getWorkers(){
    return new Promise((resolve, reject)=>{
        resolve(createWorkers());
    });
}

//creates queue of webworkers
function createWorkers(){
    const hardwareConcurrency = window.navigator.hardwareConcurrency;
    //limit webworkers to 8 because hardwareConcurrency doesn't distinguish between
    //real cores and hyperthreads, and running on 4 core machine at least having more than 8 workers shows no benefit
    //multiply by 2 because some browsers lie about cores (i.e. Safari)
    const numWorkers = hardwareConcurrency ? Math.min(hardwareConcurrency * 2, 8) : 1;
    const workers = ArrayUtil.create(numWorkers, ()=>{
        return new Worker(new URL('../worker/worker-main.js', import.meta.url));
    });
    
    let workerCurrentIndex = 0;

    function getNextWorker(){
        const worker = workers[workerCurrentIndex];
        workerCurrentIndex++;
        if(workerCurrentIndex === workers.length){
            workerCurrentIndex = 0;
        }
        return worker;
    }
    
    function forEach(callback){
        workers.forEach(callback);
    }
    
    return {
        getNextWorker: getNextWorker,
        forEach: forEach,
    };
}

export default {
    ditherWorkerHeader: createDitherWorkerHeader,
    ditherWorkerBwHeader: createDitherWorkerBwHeader,
    ditherWorkerColorHeader: createDitherWorkerColorHeader,
    optimizePaletteHeader: createOptimizePaletteHeader,
    generateImageId,
    createLoadImageMessage,
    histogramWorkerHeader: createHistogramWorkerHeader,
    colorHistogramWorkerHeader: createColorHistogramWorkerHeader,
    getDitherWorkers: getWorkers,
};