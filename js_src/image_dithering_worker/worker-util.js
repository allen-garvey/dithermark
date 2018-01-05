App.WorkerUtil = (function(WorkerHeaders){
    //based on: https://stackoverflow.com/questions/10100798/whats-the-most-straightforward-way-to-copy-an-arraybuffer-object
    function copyBuffer(pixelBufferOriginal){
        //faster than using for loop
        var copiedBuffer = new ArrayBuffer(pixelBufferOriginal.byteLength);
        var copiedPixels = new Uint8Array(copiedBuffer);
        copiedPixels.set(new Uint8Array(pixelBufferOriginal));
        return {buffer: copiedBuffer, pixels: copiedPixels};
        
        
        
    }
    return {
        copyBuffer: copyBuffer,
    };
})(App.WorkerHeaders);