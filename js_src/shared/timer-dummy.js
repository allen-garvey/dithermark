/**
 * Version of timer for release builds with timer logging off
 * make sure public functions are the same as timer.js
*/
App.Timer = (function(){
    
    function megapixelsPerSecond(a, b, func){
        func();
    }
    
    return {
        megapixelsPerSecond,
    };
})();