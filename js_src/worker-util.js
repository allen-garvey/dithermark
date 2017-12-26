var App = App || {};

App.WorkerUtil = (function(){
    //polyfill for Chrome older than version 60
    var SharedArrayBuffer = window.SharedArrayBuffer || ArrayBuffer;
    
    function createDitherWorkerHeader(imageWidth, imageHeight, threshold, algorithmId){
        var buffer = new SharedArrayBuffer(4 * 2);
        var bufferView = new Uint16Array(buffer);
        
        bufferView[0] = imageWidth;
        bufferView[1] = imageHeight;
        bufferView[2] = threshold;
        bufferView[3] = algorithmId;
        
        return bufferView;
    }
    
    function createDitherWorkerLoadImageHeader(imageWidth, imageHeight){
        return createDitherWorkerHeader(imageWidth, imageHeight, 0, 0);
    }
    
    function createHistogramWorkerHeader(imageWidth, imageHeight,){
        var buffer = new SharedArrayBuffer(2 * 2);
        var bufferView = new Uint16Array(buffer);
        
        bufferView[0] = imageWidth;
        bufferView[1] = imageHeight;
        
        return bufferView;
    }
    
    
    return {
        ditherWorkerHeader: createDitherWorkerHeader,
        ditherWorkerLoadImageHeader: createDitherWorkerLoadImageHeader,
        histogramWorkerHeader: createHistogramWorkerHeader,
    };
})();