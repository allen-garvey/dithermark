App.Polyfills = (function(){    
    return {
        SharedArrayBuffer: typeof SharedArrayBuffer === 'undefined' ? ArrayBuffer : SharedArrayBuffer,
    };
})();