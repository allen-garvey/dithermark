var App = App || {};

App.Timer = (function(){
    
    function timeInMilliseconds(){
        var d = new Date();
        return d.getTime();
    }
    
    function timeFunctionBase(functionToTime, done){
        var start = timeInMilliseconds();
        functionToTime();
        var end = timeInMilliseconds();
        var seconds = (end - start) / 1000;
        done(seconds);
    }
    
    function timeFunction(name, functionToTime){
        timeFunctionBase(functionToTime, (seconds)=>{
            console.log(name + ' took ' + seconds);
        });
    }
    
    function timeFunctionMegapixels(name, numPixels, functionToTime){
        timeFunctionBase(functionToTime, (seconds)=>{
            var megapixels = numPixels / 1000000;
            var megapixelsPerSecond = megapixels / seconds;
            console.log(`${name}: ${seconds}s, ${megapixelsPerSecond.toFixed(2)} megapixels/s`);
        });
    }
    
    return {
        time: timeFunction,
        megapixelsPerSecond: timeFunctionMegapixels,
        timeInMilliseconds: timeInMilliseconds,
    };
})();