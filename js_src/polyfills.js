App.Polyfills = (function(){
    return {
        SharedArrayBuffer: SharedArrayBuffer || ArrayBuffer,
    };
})();