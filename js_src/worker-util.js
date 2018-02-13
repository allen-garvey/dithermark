var App = App || {};

App.WorkerUtil = (function(Polyfills, WorkerHeaders){
    function createDitherWorkerHeader(imageWidth, imageHeight, threshold, algorithmId, blackPixel, whitePixel){
        //(5 + (3 * 2)) * 2
        var buffer = new Polyfills.SharedArrayBuffer(22);
        var bufferView = new Uint16Array(buffer);
        
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
        var buffer = new Polyfills.SharedArrayBuffer(10);
        var bufferView = new Uint16Array(buffer);
        
        bufferView[0] = WorkerHeaders.DITHER_BW;
        bufferView[1] = imageWidth;
        bufferView[2] = imageHeight;
        
        bufferView[3] = algorithmId;
        bufferView[4] = threshold;

        return buffer;
    }
    
    function createDitherWorkerLoadImageHeader(imageWidth, imageHeight){
        var buffer = new Polyfills.SharedArrayBuffer(6);
        var bufferView = new Uint16Array(buffer);
        
        bufferView[0] = WorkerHeaders.LOAD_IMAGE;
        bufferView[1] = imageWidth;
        bufferView[2] = imageHeight;
        
        return buffer;
    }
    
    function createHistogramWorkerHeader(){
        var buffer = new Polyfills.SharedArrayBuffer(2);
        var bufferView = new Uint16Array(buffer);
        
        bufferView[0] = WorkerHeaders.HISTOGRAM;
        
        return buffer;
    }
    
    function createColorHistogramWorkerHeader(){
        var buffer = new Polyfills.SharedArrayBuffer(2);
        var bufferView = new Uint16Array(buffer);
        
        bufferView[0] = WorkerHeaders.HUE_HISTOGRAM;
        
        return buffer;
    }
    
    //creates queue of webworkers
    function createWorkers(ditherWorkerUrl){
        var numWorkers = 1;
        var navigator = window.navigator;
        if(navigator.hardwareConcurrency){
            numWorkers = Math.min(navigator.hardwareConcurrency * 2, 8);
        }
        var workers = new Array(numWorkers);
        for(let i=0;i<numWorkers;i++){
            workers[i] = new Worker(ditherWorkerUrl);
        }
        
        var workerCurrentIndex = 0;
    
        function getNextWorker(){
            let worker = workers[workerCurrentIndex];
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
    
    return {
        ditherWorkerHeader: createDitherWorkerHeader,
        ditherWorkerBwHeader: createDitherWorkerBwHeader,
        ditherWorkerLoadImageHeader: createDitherWorkerLoadImageHeader,
        histogramWorkerHeader: createHistogramWorkerHeader,
        colorHistogramWorkerHeader: createColorHistogramWorkerHeader,
        createDitherWorkers: createWorkers,
    };
})(App.Polyfills, App.WorkerHeaders);