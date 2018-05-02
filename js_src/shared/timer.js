App.Timer = (function(){
    
    let timeInMilliseconds;
    if(performance){
        timeInMilliseconds = ()=> {return performance.now();};
    }
    else{
        timeInMilliseconds = ()=> {return Date.now();};
    }
    
    function timeFunctionBase(functionToTime, done){
        const start = timeInMilliseconds();
        functionToTime();
        const end = timeInMilliseconds();
        const seconds = (end - start) / 1000;
        done(seconds);
    }
    
    function timeFunctionMegapixels(name, numPixels, functionToTime){
        timeFunctionBase(functionToTime, (seconds)=>{
            console.log(megapixelsMessage(name, numPixels, seconds));
        });
    }
    
    function megapixelsMessage(name, numPixels, seconds){
        const megapixels = numPixels / 1000000;
        const megapixelsPerSecond = megapixels / seconds;
        return `${name}: ${seconds}s, ${megapixelsPerSecond.toFixed(2)} megapixels/s`;
    }
    
    return {
        megapixelsPerSecond: timeFunctionMegapixels,
    };
})();