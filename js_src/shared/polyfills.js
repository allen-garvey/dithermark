App.Polyfills = (function(){
    //have to do it exactly like this, with same variable name and 'var'
    //or we will throw exception
    var SharedArrayBuffer = SharedArrayBuffer || ArrayBuffer;
    
    return {
        SharedArrayBuffer: SharedArrayBuffer,
    };
})();