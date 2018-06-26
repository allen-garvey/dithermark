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
                const paletteIndex = paletteBufferIndexOffset + j;
                hasConverged = hasConverged && mean === paletteBuffer[paletteIndex];
                paletteBuffer[paletteIndex] = mean;
            }
        }

        return hasConverged;
    }

    //creates histogram of unique colors
    //improvement from https://arxiv.org/abs/1101.0395 to reduce number of distance calculations
    //32 bit pixel manipulation from rgb quant
    function createColorHistogram(pixels){
        const buf32 = new Uint32Array(pixels.buffer);
        const histogram = new Map();
        const length = buf32.length;
        
        for(let i=0;i<length;i++){
			const pixel = buf32[i];

			// skip transparent
			if((pixel & 0xff000000) >> 24 === 0){
                continue;
            }
            //technically we are not normalizing the transparency values,
            //however this does not effect accuracy, it just means for semi-transparent values
            //we might be doing a little extra unneeded work
            const previousValue = histogram.get(pixel) || 0;
            histogram.set(pixel, previousValue + 1);
        }
        return histogram; 
    }
    
    function kMeans(pixels, numColors, colorQuantization, imageWidth, imageHeight, progressCallback){
        //initializing palette with spatial average boxed not because it is the best color quantization algorithm, but because it is the fastest
        //using a better algorithm, such as octree, is slower and doesn't improve results anyway
        const paletteBuffer = OptimizePalettePopularity.spatialAverageBoxed(pixels, numColors, {}, imageWidth, imageHeight);
        const palette = bufferToPixelArray(paletteBuffer);
        const colorDitherModeKey = colorQuantization.distanceLuma ? 'LUMA' : 'RGB';
        const distanceFunc = ColorDitherModeFunctions[ColorDitherModes.get(colorDitherModeKey).id].distance;
        const meansBuffer = new Float32Array(4 * numColors);
        const colorHistogram = createColorHistogram(pixels);

        progressCallback(10);

        //generally converges between 39-59 iterations
        const maximumIterations = 64;
        const halfway = Math.floor(maximumIterations / 2);
        const pixelBuffer = new Uint8ClampedArray(3);
        for(let currentIteration=0,hasConverged=false;!hasConverged && currentIteration<maximumIterations;currentIteration++){
            colorHistogram.forEach((count, color32)=>{
                pixelBuffer[0] = (color32 & 0xff);
                pixelBuffer[1] = (color32 & 0xff00) >> 8;
                pixelBuffer[2] = (color32 & 0xff0000) >> 16;

                const paletteIndex = findClosestPaletteIndex(pixelBuffer, palette, distanceFunc);
                const meansBufferIndexOffset = paletteIndex * 4;
                for(let j=0;j<3;j++){
                    meansBuffer[meansBufferIndexOffset+j] += pixelBuffer[j] * count;
                }
                meansBuffer[meansBufferIndexOffset+3] += count;
            });
            hasConverged = convergeMeans(paletteBuffer, meansBuffer, numColors);
            if(currentIteration === halfway){
                progressCallback(50);
            }
            meansBuffer.fill(0);
        }

        return paletteBuffer;
    }


    return {
        kMeans
    };
})(App.ColorDitherModes, App.ColorDitherModeFunctions, App.OptimizePalettePopularity);