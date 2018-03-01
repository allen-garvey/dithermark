App.Polyfills = (function(){
    var SharedArrayBuffer = SharedArrayBuffer || ArrayBuffer;
    
    return {
        SharedArrayBuffer: SharedArrayBuffer,
    };
})();