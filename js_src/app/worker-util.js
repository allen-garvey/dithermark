
App.WorkerUtil = (function(Polyfills, WorkerHeaders, ColorPicker, Constants){
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
    
    function createDitherWorkerColorHeader(imageWidth, imageHeight, algorithmId, colorDitherMode, selectedColors){
        //(4 * 2) + selectedColors * 3
        let buffer = new Polyfills.SharedArrayBuffer(8 + (selectedColors * 3));
        let bufferView = new Uint16Array(buffer);
        
        bufferView[0] = WorkerHeaders.DITHER_COLOR;
        bufferView[1] = imageWidth;
        bufferView[2] = imageHeight;
        
        bufferView[3] = algorithmId;
        bufferView[4] = colorDitherMode;
        
        ColorPicker.prepareForWorker(selectedColors, bufferView.subarray(5));

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
    function createEmptyHeader(messageType){
        let buffer = new Polyfills.SharedArrayBuffer(2);
        let bufferView = new Uint16Array(buffer);
        
        bufferView[0] = messageType;
        
        return buffer;
    }
    
    function createHistogramWorkerHeader(){
        return createEmptyHeader(WorkerHeaders.HISTOGRAM);
    }
    function createOptimizePaletteHeader(numColors){
        let buffer = new Polyfills.SharedArrayBuffer(4);
        let bufferView = new Uint16Array(buffer);
        
        bufferView[0] = WorkerHeaders.OPTIMIZE_PALETTE;
        bufferView[1] = numColors;
        
        return buffer;
    }
    
    function createColorHistogramWorkerHeader(){
        var buffer = new Polyfills.SharedArrayBuffer(2);
        var bufferView = new Uint16Array(buffer);
        
        bufferView[0] = WorkerHeaders.HUE_HISTOGRAM;
        
        return buffer;
    }

    //returns promise;
    //gets worker src code, and then initializes queue of workers
    //very loosely based on: https://stackoverflow.com/questions/10343913/how-to-create-a-web-worker-from-a-string
    function getWorkers(workerUrl){
        return fetch(workerUrl).then((res)=>{ return res.blob(); }).then((blob)=>{ 
            return createWorkers(URL.createObjectURL(blob));
        });
    }
    
    //creates queue of webworkers
    function createWorkers(workerSrc){
        var numWorkers = 1;
        var navigator = window.navigator;
        if(navigator.hardwareConcurrency){
            numWorkers = Math.min(navigator.hardwareConcurrency * 2, Constants.maxWebworkers);
        }
        var workers = new Array(numWorkers);
        for(let i=0;i<numWorkers;i++){
            workers[i] = new Worker(workerSrc);
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
        ditherWorkerColorHeader: createDitherWorkerColorHeader,
        optimizePaletteHeader: createOptimizePaletteHeader,
        ditherWorkerLoadImageHeader: createDitherWorkerLoadImageHeader,
        histogramWorkerHeader: createHistogramWorkerHeader,
        colorHistogramWorkerHeader: createColorHistogramWorkerHeader,
        getDitherWorkers: getWorkers,
    };
})(App.Polyfills, App.WorkerHeaders, App.ColorPicker, App.Constants);