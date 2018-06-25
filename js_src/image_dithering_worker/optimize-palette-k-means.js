App.OptimizePaletteKMeans = (function(ColorDitherModes, ColorDitherModeFunctions, OptimizePalettePopularity){
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
        //initializing palette with spatial average boxed not because it is the best color quantization algorithm, but because it is the fastest
        //using a better algorithm, such as octree, is slower and doesn't improve results anyway
        const paletteBuffer = OptimizePalettePopularity.spatialAverageBoxed(pixels, numColors, null, imageWidth, imageHeight);
        const palette = bufferToPixelArray(paletteBuffer);
        const colorDitherModeKey = colorQuantization.distanceLuma ? 'LUMA' : 'RGB';
        const distanceFunc = ColorDitherModeFunctions[ColorDitherModes.get(colorDitherModeKey).id].distance;
        const meansBuffer = new Float32Array(4 * numColors);

        progressCallback(10);
        //TODO, find out what this should be
        const maximumIterations = 48;
        const halfway = Math.floor(maximumIterations / 2);
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
            if(currentIteration === halfway){
                progressCallback(50);
            }
            if(hasConverged){
                console.log(`K Means converged at iteration ${currentIteration}`);
            }
        }

        return paletteBuffer;
    }


    return {
        kMeans
    };
})(App.ColorDitherModes, App.ColorDitherModeFunctions, App.OptimizePalettePopularity);