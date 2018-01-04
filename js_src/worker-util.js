var App = App || {};

App.WorkerUtil = (function(Polyfills){
    function createDitherWorkerHeader(imageWidth, imageHeight, threshold, algorithmId, blackPixel, whitePixel){
        //(4 + (3 * 2)) * 2
        var buffer = new Polyfills.SharedArrayBuffer(20);
        var bufferView = new Uint16Array(buffer);
        
        bufferView[0] = imageWidth;
        bufferView[1] = imageHeight;
        
        //createDitherWorkerLoadImageHeader only has first 2 arguments defined
        if(threshold !== undefined){
            bufferView[2] = threshold;
            bufferView[3] = algorithmId;
            
            bufferView[4] = blackPixel[0];
            bufferView[5] = blackPixel[1];
            bufferView[6] = blackPixel[2];
            
            bufferView[7] = whitePixel[0];
            bufferView[8] = whitePixel[1];
            bufferView[9] = whitePixel[2];
        }
        
        return bufferView;
    }
    
    function createDitherWorkerLoadImageHeader(imageWidth, imageHeight){
        return createDitherWorkerHeader(imageWidth, imageHeight);
    }
    
    //creates queue of webworkers
    function createWorkers(ditherWorkerUrl){
        var numWorkers = 1;
        var navigator = window.navigator;
        if(navigator.hardwareConcurrency){
            numWorkers = navigator.hardwareConcurrency * 2;
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
    
    function createQueue(){
        function Queue(){
            this.length = 0;
            this.lowestIndex = 0;
            this.queue = {};
        }
        
        Queue.prototype.insert = function(item){
            let index = this.lowestIndex + this.length;
            this.queue[index] = item;
            this.length++;
        };
        
        Queue.prototype.getNext = function(defaultValue=null){
            if(this.length === 0){
                return defaultValue;
            }
            let ret = this.queue[this.lowestIndex];
            this.queue[this.lowestIndex] = null;
            this.length--;
            if(this.length === 0){
                this.lowestIndex = 0;
            }
            else{
                this.lowestIndex++;
            }
            return ret;
        };
        
        let ret = new Queue();
        return ret;
    }
    
    return {
        ditherWorkerHeader: createDitherWorkerHeader,
        ditherWorkerLoadImageHeader: createDitherWorkerLoadImageHeader,
        createDitherWorkers: createWorkers,
        createQueue: createQueue,
    };
})(App.Polyfills);