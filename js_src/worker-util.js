
App.WorkerUtil = (function(Polyfills, WorkerHeaders){
    function createDitherWorkerHeader(imageWidth, imageHeight, threshold, algorithmId, serpentineDither, blackPixel, whitePixel){
        //(6 + (3 * 2)) * 2
        var buffer = new Polyfills.SharedArrayBuffer(24);
        var bufferView = new Uint16Array(buffer);
        
        bufferView[0] = WorkerHeaders.DITHER;
        bufferView[1] = imageWidth;
        bufferView[2] = imageHeight;
        
        bufferView[3] = algorithmId;
        bufferView[4] = threshold;
        bufferView[5] = serpentineDither;
        
        bufferView[6] = blackPixel[0];
        bufferView[7] = blackPixel[1];
        bufferView[8] = blackPixel[2];
        
        bufferView[9] = whitePixel[0];
        bufferView[10] = whitePixel[1];
        bufferView[11] = whitePixel[2];

        return buffer;
    }
    
    function createDitherWorkerBwHeader(imageWidth, imageHeight, threshold, algorithmId, serpentineDither){
        //6 * 2
        var buffer = new Polyfills.SharedArrayBuffer(12);
        var bufferView = new Uint16Array(buffer);
        
        bufferView[0] = WorkerHeaders.DITHER_BW;
        bufferView[1] = imageWidth;
        bufferView[2] = imageHeight;
        
        bufferView[3] = algorithmId;
        bufferView[4] = threshold;
        bufferView[5] = serpentineDither;

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
            numWorkers = Math.min(navigator.hardwareConcurrency * 2, <?= MAX_WEBWORKERS; ?>);
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