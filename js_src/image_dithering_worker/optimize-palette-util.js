/**
 * Shared functions used by optimize palette algorithms
*/
App.OptimizePaletteUtil = (function(PixelMath){
    //creates new UInt8ClampedArray of pixels from
    //source pixels, with fully transparent pixels removed
    function filterTransparentPixels(pixels){
        let originalLength = pixels.length;
        let ret = new Uint8ClampedArray(pixels);

        let currentLength = 0;
        for(let i=0;i<originalLength;i+=4){
            if(pixels[i+3] === 0){
                continue;
            }
            ret[i] = pixels[i];
            ret[i+1] = pixels[i+1];
            ret[i+2] = pixels[i+2];
            ret[i+3] = pixels[i+3];
            currentLength += 4;
        }


        return ret.subarray(0, currentLength + 1);
    }

    //create Javascript array of pixels from UInt8ClampedArray
    //discards alpha value, and filters fully-transparent pixels
    //usefull for when pixels need to be sorted
    function createPixelArray(pixels){
        let ret = [];
        for(let i=0;i<pixels.length;i+=4){
            //ignore transparent pixels
            if(pixels[i+3] > 0){
                //don't save alpha value, since we don't need it
                ret.push(pixels.subarray(i, i+3));
            }
        }
        return ret;
    }


    return {
        filterTransparentPixels,
        createPixelArray,
    };
})(App.PixelMath);