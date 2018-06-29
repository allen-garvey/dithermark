/**
 * Random palette color quantization
 */
App.OptimizePaletteRandom = (function(ArrayUtil){
    function randomPalette(_pixels, numColors, _colorQuantization, _imageWidth, _imageHeight){
        return ArrayUtil.create(numColors * 3, ()=>{
            return Math.round(Math.random() * 255);
        }, Uint8Array);
    }
    
    return {
       random: randomPalette,
    };
})(App.ArrayUtil);