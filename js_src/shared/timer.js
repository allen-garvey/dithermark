/**
 * Used for performance timing
 * if changing public functions, make sure to update timer-dummy.js for release builds
*/

function timeFunctionBase(functionToTime, done){
    const start = performance.now();
    functionToTime();
    const end = performance.now();
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

export default {
    megapixelsPerSecond: timeFunctionMegapixels,
};
