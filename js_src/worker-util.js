var App = App || {};

App.WorkerUtil = (function(){
    //polyfill for Chrome older than version 60
    var SharedArrayBuffer = window.SharedArrayBuffer || ArrayBuffer;
    
    function createDitherWorkerHeader(imageWidth, imageHeight, threshold, algorithmId, blackPixel, whitePixel){
        //(4 + (3 * 2)) * 2
        var buffer = new SharedArrayBuffer(20);
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
    
    return {
        ditherWorkerHeader: createDitherWorkerHeader,
        ditherWorkerLoadImageHeader: createDitherWorkerLoadImageHeader,
    };
})();