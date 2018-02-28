App.Timer = (function(){
    
    var timeInMilliseconds;
    if(performance){
        timeInMilliseconds = ()=> {return performance.now();};
    }
    else{
        timeInMilliseconds = ()=> {return Date.now();};
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
            console.log(timeFunctionMegapixelsMessage(name, numPixels, seconds));
        });
    }
    
    function timeFunctionMegapixelsMessage(name, numPixels, seconds){
        var megapixels = numPixels / 1000000;
        var megapixelsPerSecond = megapixels / seconds;
        return `${name}: ${seconds}s, ${megapixelsPerSecond.toFixed(2)} megapixels/s`;
    }
    
    return {
        time: timeFunction,
        megapixelsPerSecond: timeFunctionMegapixels,
        timeInMilliseconds: timeInMilliseconds,
        megapixelsMessage: timeFunctionMegapixelsMessage,
    };
})();