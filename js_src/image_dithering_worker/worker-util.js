App.WorkerUtil = (function(){
    function copyBuffer(pixelBufferOriginal){
        var ditheredPixelBuffer = new App.Polyfills.SharedArrayBuffer(pixelBufferOriginal.byteLength);
        var ditheredPixels = new Uint8ClampedArray(ditheredPixelBuffer);
        var originalPixels = new Uint8ClampedArray(pixelBufferOriginal);
        for(let i=0;i<originalPixels.length;i++){
            ditheredPixels[i] = originalPixels[i];
        }
        return  {buffer: ditheredPixelBuffer, pixels: ditheredPixels};
    }
    return {
        copyBuffer: copyBuffer,
    };
})();