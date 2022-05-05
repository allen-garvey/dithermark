import Polyfills from '../shared/polyfills.js';
import WorkerHeaders from '../shared/worker-headers.js';
import ColorPicker from './color-picker.js';
import ArrayUtil from '../shared/array-util.js';


function createDitherWorkerHeader(imageWidth, imageHeight, threshold, algorithmId, blackPixel, whitePixel){
    //(5 + (3 * 2)) * 2
    const buffer = new Polyfills.SharedArrayBuffer(22);
    const bufferView = new Uint16Array(buffer);
    
    bufferView[0] = WorkerHeaders.DITHER;
    bufferView[1] = imageWidth;
    bufferView[2] = imageHeight;
    
    bufferView[3] = algorithmId;
    bufferView[4] = threshold;
    
    bufferView[5] = blackPixel[0];
    bufferView[6] = blackPixel[1];
    bufferView[7] = blackPixel[2];
    
    bufferView[8] = whitePixel[0];
    bufferView[9] = whitePixel[1];
    bufferView[10] = whitePixel[2];

    return buffer;
}

function createDitherWorkerBwHeader(imageWidth, imageHeight, threshold, algorithmId){
    //5 * 2
    const buffer = new Polyfills.SharedArrayBuffer(10);
    const bufferView = new Uint16Array(buffer);
    
    bufferView[0] = WorkerHeaders.DITHER_BW;
    bufferView[1] = imageWidth;
    bufferView[2] = imageHeight;
    
    bufferView[3] = algorithmId;
    bufferView[4] = threshold;

    return buffer;
}

function createDitherWorkerColorHeader(imageWidth, imageHeight, algorithmId, colorDitherMode, colorsHex){
    //(5 * 2) + 2 *(colorsHex * 3)
    const buffer = new Polyfills.SharedArrayBuffer(10 + (colorsHex.length * 6));
    const bufferView = new Uint16Array(buffer);
    
    bufferView[0] = WorkerHeaders.DITHER_COLOR;
    bufferView[1] = imageWidth;
    bufferView[2] = imageHeight;
    
    bufferView[3] = algorithmId;
    bufferView[4] = colorDitherMode;
    
    ColorPicker.prepareForWorker(colorsHex, bufferView.subarray(5));

    return buffer;
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
function createLoadImageHeader(imageId, imageWidth, imageHeight){
    const buffer = new Polyfills.SharedArrayBuffer(8);
    const bufferView = new Uint16Array(buffer);
    
    bufferView[0] = WorkerHeaders.LOAD_IMAGE;
    bufferView[1] = imageWidth;
    bufferView[2] = imageHeight;
    bufferView[3] = imageId;
    
    return buffer;
}
function createEmptyHeader(messageType){
    const buffer = new Polyfills.SharedArrayBuffer(2);
    const bufferView = new Uint16Array(buffer);
    
    bufferView[0] = messageType;
    
    return buffer;
}

function createHistogramWorkerHeader(){
    return createEmptyHeader(WorkerHeaders.HISTOGRAM);
}
//filterId for memorization purpores
function createOptimizePaletteHeader(numColors, colorQuantizationModeId){
    const buffer = new Polyfills.SharedArrayBuffer(6);
    const bufferView = new Uint16Array(buffer);
    
    bufferView[0] = WorkerHeaders.OPTIMIZE_PALETTE;
    bufferView[1] = numColors;
    bufferView[2] = colorQuantizationModeId;
    
    return buffer;
}

function createColorHistogramWorkerHeader(){
    const buffer = new Polyfills.SharedArrayBuffer(2);
    const bufferView = new Uint16Array(buffer);
    
    bufferView[0] = WorkerHeaders.HUE_HISTOGRAM;
    
    return buffer;
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
    createLoadImageHeader,
    histogramWorkerHeader: createHistogramWorkerHeader,
    colorHistogramWorkerHeader: createColorHistogramWorkerHeader,
    getDitherWorkers: getWorkers,
};