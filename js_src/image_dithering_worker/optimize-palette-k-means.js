App.OptimizePaletteKMeans = (function(ArrayUtil, ColorDitherModes, ColorDitherModeFunctions){
    
    function randomInitialPalette(numColors){
        return ArrayUtil.create(numColors * 3, ()=>{
            return Math.round(Math.random() * 255);
        }, Uint8Array);
    }

    function bufferToPixelArray(buffer){
        const numItems = buffer.length / 3;
        const ret = new Array(numItems)
        for(let i=0,baseIndex=0;i<numItems;i++,baseIndex+=3){
            ret[i] = buffer.subarray(baseIndex, baseIndex + 3);
        }
        return ret;
    }

    function findClosestPaletteIndex(pixel, palette, distanceFunc){
        let shortestDistance = Infinity;
        let closestPaletteIndex = 0;

        palette.forEach((color, index)=>{
            const currentDistance = distanceFunc(pixel, color);
            if(currentDistance < shortestDistance){
                shortestDistance = currentDistance;
                closestPaletteIndex = index;
            }
        });

        return closestPaletteIndex;
    }
    function convergeMeans(paletteBuffer, meansBuffer, numColors){
        let hasConverged = true;
        for(let i=0, paletteBufferIndexOffset=0,meansBufferIndexOffset=0;i<numColors;i++,paletteBufferIndexOffset+=3,meansBufferIndexOffset+=4){
            const numPixels = meansBuffer[meansBufferIndexOffset+3];
            for(let j=0;j<3;j++){
                const mean = Math.round(meansBuffer[meansBufferIndexOffset + j] / numPixels);
                hasConverged = hasConverged && mean === paletteBuffer[paletteBufferIndexOffset + j];
                paletteBuffer[paletteBufferIndexOffset + j] = mean;
            }
        }

        return hasConverged;
    }

    
    function kMeans(pixels, numColors, colorQuantization, imageWidth, imageHeight, progressCallback){
        const paletteBuffer = randomInitialPalette(numColors);
        const palette = bufferToPixelArray(paletteBuffer);
        const colorDitherModeKey = colorQuantization.distanceLuma ? 'LUMA' : 'RGB';
        const distanceFunc = ColorDitherModeFunctions[ColorDitherModes.get(colorDitherModeKey).id].distance;
        const meansBuffer = new Float32Array(4 * numColors);

        //TODO, find out what this should be
        const maximumIterations = 48;
        for(let currentIteration=0,hasConverged=false;!hasConverged && currentIteration<maximumIterations;currentIteration++){
            meansBuffer.fill(0);
            hasConverged = true;
            for(let i=0;i<pixels.length;i+=4){
                const pixel = pixels.subarray(i,i+4);
                //ignore transparent pixels
                if(pixel[3] === 0){
                    continue;
                }
                const paletteIndex = findClosestPaletteIndex(pixel, palette, distanceFunc);
                const meansBufferIndexOffset = paletteIndex * 4;
                for(let j=0;j<3;j++){
                    meansBuffer[meansBufferIndexOffset+j] = meansBuffer[meansBufferIndexOffset+j] + pixel[j];
                }
                meansBuffer[meansBufferIndexOffset+3]++;
            }
            hasConverged = hasConverged && convergeMeans(paletteBuffer, meansBuffer, numColors);
            if(hasConverged){
                console.log(`K Means converged at iteration ${currentIteration}`);
            }
        }

        return paletteBuffer;
    }


    return {
        kMeans
    };
})(App.ArrayUtil, App.ColorDitherModes, App.ColorDitherModeFunctions);