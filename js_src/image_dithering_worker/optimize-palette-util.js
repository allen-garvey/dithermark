/**
 * Shared functions used by optimize palette algorithms
*/
App.OptimizePaletteUtil = (function(PixelMath, ArrayUtil){
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

    //turns JavaScript array of pixels into a single Uint8Array
    //need palette count for octree, since length of pixelArray
    //might be less than number of colors returned
    function pixelArrayToBuffer(pixelArray, paletteCount=0){
        let ret = new Uint8Array(Math.max(pixelArray.length, paletteCount) * 3);
        for(let i=0,offset=0;i<pixelArray.length;i++, offset+=3){
            const pixel = pixelArray[i];
            ret[offset] = pixel[0];
            ret[offset+1] = pixel[1];
            ret[offset+2] = pixel[2];
        }

        return ret;
    }

    //flattens 2d array to 1d
    //does not flatten more than 2 dimensions
    function flattenArray(array){
        return array.reduce((total, value)=>{
            return total.concat(value);
        }, []);
    }

    function countingSort(iterable, valueFunc, valueRange=256){
        const valueMap = ArrayUtil.create(valueRange, ()=>{return [];});
        iterable.forEach((value)=>{
            valueMap[valueFunc(value)].push(value);
        });
        return flattenArray(valueMap);
    }

    function countingSortPixels(pixels, valueFunc, valueRange=256){
        const valueMap = ArrayUtil.create(valueRange, ()=>{return [];});
        for(let i=0;i<pixels.length;i+=4){
            const pixel = pixels.subarray(i, i+4);
            valueMap[valueFunc(pixel)].push(pixel);
        }
        return flattenArray(valueMap);
    }


    return {
        filterTransparentPixels,
        createPixelArray,
        pixelArrayToBuffer,
        countingSort,
        countingSortPixels,
    };
})(App.PixelMath, App.ArrayUtil);