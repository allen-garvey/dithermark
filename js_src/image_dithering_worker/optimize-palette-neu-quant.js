/* NeuQuant Neural-Net Quantization Algorithm
 * ------------------------------------------
 *
 * Copyright (c) 1994 Anthony Dekker
 *
 * NEUQUANT Neural-Net quantization algorithm by Anthony Dekker, 1994.
 * See "Kohonen neural networks for optimal colour quantization"
 * in "Network: Computation in Neural Systems" Vol. 5 (1994) pp 351-367.
 * for a discussion of the algorithm.
 * See also  http://members.ozemail.com.au/~dekker/NEUQUANT.HTML
 * and https://scientificgems.wordpress.com/stuff/neuquant-fast-high-quality-image-quantization/
 *
 * Any party obtaining a copy of these files from the author, directly or
 * indirectly, is granted, free of charge, a full and unrestricted irrevocable,
 * world-wide, paid up, royalty-free, nonexclusive right and license to deal
 * in this software and documentation files (the "Software"), including without
 * limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons who receive
 * copies from any such party to do so, with the only requirement being
 * that this copyright notice remain intact.
 *
 * (based on JavaScript port 2012 by Johan Nordberg)
 * https://github.com/jnordberg/gif.js/blob/master/src/TypedNeuQuant.js
 */
App.OptimizePaletteNeuQuant = (function(ArrayUtil){
    // networkSize is number of colors returned - need to reduce this if palette size is less than this
    //reducing to 64 when numColors is <= 64 is 2-4 times faster but generally looks worse
    //reducing to 128 when numColors is <= 128 is 1.5-2 times faster and sometimes looks better, but generally worse
    
    function NeuQuant(networkSize){
        /**
         * Constants
         */
        const ncycles = 100; // number of learning cycles
        const maxnetpos = networkSize - 1;

        // defs for freq and bias
        const netbiasshift = 4; // bias for colour values
        const intbiasshift = 16; // bias for fractions
        const intbias = (1 << intbiasshift);
        const gammashift = 10;
        const betashift = 10;
        const beta = (intbias >> betashift); /* beta = 1/1024 */
        const betagamma = (intbias << (gammashift - betashift));

        // defs for decreasing radius factor
        const initrad = (networkSize >> 3); // for 256 cols, radius starts
        const radiusbiasshift = 6; // at 32.0 biased by 6 bits
        const radiusbias = (1 << radiusbiasshift);
        const initradius = (initrad * radiusbias); //and decreases by a
        const radiusdec = 30; // factor of 1/30 each cycle

        // defs for decreasing alpha factor
        const alphabiasshift = 10; // alpha starts at 1.0
        const initalpha = (1 << alphabiasshift);

        /* radbias and alpharadbias used for radpower calculation */
        const radbiasshift = 8;
        const radbias = (1 << radbiasshift);
        const alpharadbshift = (alphabiasshift + radbiasshift);
        const alpharadbias = (1 << alpharadbshift);
        
        
        /**
         * Variables initialized by init
         */
        let network; // int[netsize][4]
        let netindex; // for network lookup - really 256

        // bias and freq arrays for learning
        let bias;
        let freq;
        let radpower;

        /*
            Private Method: init
            sets up arrays
        */
        function init(){
            network = [];
            netindex = new Int32Array(256);
            bias = new Int32Array(networkSize);
            freq = new Int32Array(networkSize);
            radpower = new Int32Array(networkSize >> 3);

            for(let i = 0; i < networkSize; i++){
                const v = (i << (netbiasshift + 8)) / networkSize;
                network[i] = new Float64Array([v, v, v, 0]);
                freq[i] = intbias / networkSize;
                bias[i] = 0;
            }
        }

        /*
            Private Method: unbiasnet
            unbiases network to give byte values 0..255 and record position i to prepare for sort
        */
        function unbiasnet(){
            for(let i = 0; i < networkSize; i++){
                network[i][0] >>= netbiasshift;
                network[i][1] >>= netbiasshift;
                network[i][2] >>= netbiasshift;
                network[i][3] = i; // record color number
            }
        }

        /*
            Private Method: altersingle
            moves neuron *i* towards biased (b,g,r) by factor *alpha*
        */
        function altersingle(alpha, i, b, g, r){
            network[i][0] -= (alpha * (network[i][0] - b)) / initalpha;
            network[i][1] -= (alpha * (network[i][1] - g)) / initalpha;
            network[i][2] -= (alpha * (network[i][2] - r)) / initalpha;
        }

        /*
            Private Method: alterneigh
            moves neurons in *radius* around index *i* towards biased (b,g,r) by factor *alpha*
        */
        function alterneigh(radius, i, b, g, r) {
            const lo = Math.abs(i - radius);
            const hi = Math.min(i + radius, networkSize);

            let j = i + 1;
            let k = i - 1;
            let m = 1;

            while((j < hi) || (k > lo)){
                const a = radpower[m++];

                if (j < hi) {
                    const p = network[j++];
                    p[0] -= (a * (p[0] - b)) / alpharadbias;
                    p[1] -= (a * (p[1] - g)) / alpharadbias;
                    p[2] -= (a * (p[2] - r)) / alpharadbias;
                }

                if(k > lo){
                    const p = network[k--];
                    p[0] -= (a * (p[0] - b)) / alpharadbias;
                    p[1] -= (a * (p[1] - g)) / alpharadbias;
                    p[2] -= (a * (p[2] - r)) / alpharadbias;
                }
            }
        }

        /*
            Private Method: contest
            searches for biased BGR values
        */
        function contest(b, g, r) {
            /*
            finds closest neuron (min dist) and updates freq
            finds best neuron (min dist-bias) and returns position
            for frequently chosen neurons, freq[i] is high and bias[i] is negative
            bias[i] = gamma * ((1 / netsize) - freq[i])
            */

            let bestd = ~(1 << 31);
            let bestbiasd = bestd;
            let bestpos = -1;
            let bestbiaspos = bestpos;

            for(let i = 0; i < networkSize; i++){
                const n = network[i];

                const dist = Math.abs(n[0] - b) + Math.abs(n[1] - g) + Math.abs(n[2] - r);
                if(dist < bestd){
                    bestd = dist;
                    bestpos = i;
                }

                const biasdist = dist - ((bias[i]) >> (intbiasshift - netbiasshift));
                if(biasdist < bestbiasd){
                    bestbiasd = biasdist;
                    bestbiaspos = i;
                }

                const betafreq = (freq[i] >> betashift);
                freq[i] -= betafreq;
                bias[i] += (betafreq << gammashift);
            }

            freq[bestpos] += beta;
            bias[bestpos] -= betagamma;

            return bestbiaspos;
        }

        /*
            Private Method: inxbuild
            sorts network and builds netindex[0..255]
        */
        function inxbuild() {
            let previouscol = 0;
            let startpos = 0;
            for (let i = 0; i < networkSize; i++) {
                const p = network[i];
                let smallpos = i;
                let smallval = p[1]; // index on g
                // find smallest in i..netsize-1
                for (let j = i + 1; j < networkSize; j++) {
                    const q = network[j];
                    if (q[1] < smallval) { // index on g
                        smallpos = j;
                        smallval = q[1]; // index on g
                    }
                }
                const q = network[smallpos];

                if(i !== smallpos){
                    // swap p (i) and q (smallpos) entries
                    for(let j=0;j<4;j++){
                        const temp = q[j];
                        q[j] = p[j];
                        p[j] = temp;
                    }
                }
                // smallval entry is now in position i
                if(smallval !== previouscol){
                    netindex[previouscol] = (startpos + i) >> 1;
                    for(let j = previouscol + 1; j < smallval; j++){
                        netindex[j] = i;
                    }
                    previouscol = smallval;
                    startpos = i;
                }
            }
            netindex[previouscol] = (startpos + maxnetpos) >> 1;
            for(let j = previouscol + 1; j < 256; j++){
                netindex[j] = maxnetpos; // really 256
            }        
        }

        /*
            Private Method: learn
            "Main Learning Loop"
            Note that you will get infinite loop if image that is completely transparent is used
        */
        function learn(pixels, samplefac, progressCallback) {
            //these calculations were done supposing pixels had no alpha, so divide by 4 * 3 to get length of pixels without alpha
            const pixelLength = pixels.length;
            //originally was divided by 3, but not sure if we should be 
            //dividing by 4 now that we are using rgb instead of rgba
            //however, with samplefac 10 with colors less than 256, divide by 4 gives better results
            //compared to dividing by 3, which gives duller, less saturated result
            const alphadec = 30 + ((samplefac - 1) / 4);
            const samplepixels = pixelLength / (4 * samplefac);
            let delta = ~~(samplepixels / ncycles);
            let alpha = initalpha;
            let radius = initradius;

            let rad = radius >> radiusbiasshift;
            if(rad <= 1){ 
                rad = 0;
            }
            for(let i = 0; i < rad; i++){
                radpower[i] = alpha * (((rad * rad - i * i) * radbias) / (rad * rad));
            }
            
            const DEFAULT_STEP = 4;
            let step = DEFAULT_STEP;

            // four primes near 500 - assume no image has a length so large that it is
            // divisible by all four primes
            const prime1 = 499;
            const prime2 = 491;
            const prime3 = 487;
            const prime4 = 503;
            const minpicturebytes = (4 * prime4);
            if(pixelLength >= minpicturebytes){
                if((pixelLength % prime1) !== 0){
                    step *= prime1;
                } 
                else if ((pixelLength % prime2) !== 0){
                    step *= prime2;
                } 
                else if((pixelLength % prime3) !== 0){
                    step *= prime3;
                } 
                else{
                    step *= prime4;
                }
            }
            
            let pixelIndex = 0; // current pixel
            let i = 0;
            let hasTransparentPixels = false;
            let hasUsedProgressCallback = samplefac > 5;
            const halfDone = Math.floor(samplepixels / 2);
            while(i < samplepixels){
                //skip transparent pixels
                if(pixels[pixelIndex+3] === 0){
                    hasTransparentPixels = true;
                    pixelIndex += step;

                    //to avoid infinite loops
                    if(pixelIndex >= pixelLength){
                        pixelIndex = 0;
                        step = DEFAULT_STEP;
                    }
                    continue;
                }
                const b = (pixels[pixelIndex] & 0xff) << netbiasshift;
                const g = (pixels[pixelIndex + 1] & 0xff) << netbiasshift;
                const r = (pixels[pixelIndex + 2] & 0xff) << netbiasshift;
                const j = contest(b, g, r);

                altersingle(alpha, j, b, g, r);
                if (rad !== 0){
                    alterneigh(rad, j, b, g, r); // alter neighbours
                }

                i++;
                delta = delta === 0 ? 1 : delta;
                if(i % delta === 0){
                    alpha -= alpha / alphadec;
                    radius -= radius / radiusdec;
                    rad = radius >> radiusbiasshift;
                    rad = rad <= 1 ? 0 : rad;

                    for(let j = 0; j < rad; j++){
                        radpower[j] = alpha * (((rad * rad - j * j) * radbias) / (rad * rad));
                    }
                }
                pixelIndex += step;
                if(pixelIndex >= pixelLength){
                    pixelIndex = 0;
                    //if we get past the end of pixels array, and there are transparent pixels reset step to every pixel,
                    //so we don't get caught in a potentially infinite loop if there are transparent pixels
                    //don't do this unless we have to, since this leads to worse results
                    if(hasTransparentPixels){
                        step = DEFAULT_STEP;
                    }
                    if(!hasUsedProgressCallback && i >= halfDone){
                        hasUsedProgressCallback = true;
                        progressCallback(50);
                    }
                }
            }
        }

        /*
            Method: buildColormap
            1. initializes network
            2. trains it
            3. removes misconceptions
            4. builds colorindex
            
            Arguments:
            pixels - array of pixels in RGBA format; e.g. [r, g, b, a, r, g, b, a]
            samplefac - sampling factor 1 to 30 where lower is better quality
        */
        this.buildColormap = function(pixels, samplefac, progressCallback){
            init();
            learn(pixels, samplefac, progressCallback);
            unbiasnet();
            inxbuild();
            return getColormap();
        };

        /*
            Method: getColormap
            builds colormap from the index
            returns array in the format:
            >
            > [r, g, b, r, g, b, r, g, b, ..]
            >
        */
        function getColormap(){
            const map = new Uint8Array(networkSize*3);
            const index = [];

            for(let i = 0; i < networkSize; i++){
                index[network[i][3]] = i;
            }

            for(let i = 0, k=0; i < networkSize; i++){
                const j = index[i];
                map[k++] = network[j][0];
                map[k++] = network[j][1];
                map[k++] = network[j][2];
            }
            return map;
        }
    }

    //while rgb and luma distance look similar at high number of colors,
    //when the number of colors is low luma distance has much better results
    function lumaDistance(r1, g1, b1, r2, g2, b2){
        const redDistance = r1 - r2;
        const greenDistance = g1 - g2;
        const blueDistance = b1 - b2;

        return redDistance * redDistance * 0.299 + greenDistance * greenDistance * 0.587 + blueDistance * blueDistance * 0.114;
    }

    //palette reduction suggestion from: https://scientificgems.wordpress.com/stuff/neuquant-fast-high-quality-image-quantization/
    //find the most similar colors and discard one
    function reducePaletteSize(palette, numColors){
        const numPaletteColors = palette.length / 3;
        const numColorsToCut = numPaletteColors - numColors;

        const colorIndexes = ArrayUtil.create(numPaletteColors, (i)=>{
            return i * 3;
        }, Uint16Array);
        let colorIndexesLength = colorIndexes.length;
        //keep track of color total distances, so when culling colors, we keep the color that has the greatest total
        //distance from everything, as it will be the most unique
        const colorTotalDistances = new Float32Array(colorIndexesLength);

        for(let i=0;i<numColorsToCut;i++){
            let shortestDistance = Infinity;
            //shortestIndex1 only needed if we are reducing by averaging 2 closest indexes, instead of just discarding second
            let shortestIndex1 = -1;
            let shortestIndex2 = -1;

            //technically this has a bug, in that not all the distances are calculated
            //(e.g. the last index total distance will always be 0), but somehow fixing this causes the results to be worse for images with wide ranges of color (most images), though slightly better on images with a reduced color palette
            for(let j=0;j<colorIndexesLength-1;j++){
                const color1Index = colorIndexes[j];
                const color1Red = palette[color1Index];
                const color1Green = palette[color1Index+1];
                const color1Blue = palette[color1Index+2];
                let totalDistance = 0;
                for(let k=j+1;k<colorIndexesLength;k++){
                    const color2Index = colorIndexes[k];
                    const color2Red = palette[color2Index];
                    const color2Green = palette[color2Index+1];
                    const color2Blue = palette[color2Index+2];

                    const distance = lumaDistance(color1Red, color1Green, color1Blue, color2Red, color2Green, color2Blue);
                    totalDistance += distance;
                    if(distance < shortestDistance){
                        shortestDistance = distance;
                        shortestIndex1 = j;
                        shortestIndex2 = k;

                        if(distance === 0){
                            break;
                        }
                    }
                }
                colorTotalDistances[j] = totalDistance;
                if(shortestDistance === 0){
                    break;
                }
            }
            //delete the index with shortest distance, as it is less unique
            const keyToDelete = shortestDistance > 0 && colorTotalDistances[shortestIndex2] > colorTotalDistances[shortestIndex1] ? shortestIndex1 : shortestIndex2;
            //delete key by swapping the last value with value at the index to be deleted
            colorIndexesLength--;
            colorIndexes[keyToDelete] = colorIndexes[colorIndexesLength];
            //don't need to swap colorTotalDistances, since we reset it at each iteration of the loop
        }
        const reducedPalette = new Uint8Array(numColors * 3);
        for(let i=0,reducedPaletteIndex=0;i<colorIndexesLength;i++){
            let colorIndex = colorIndexes[i];
            reducedPalette[reducedPaletteIndex++] = palette[colorIndex++];
            reducedPalette[reducedPaletteIndex++] = palette[colorIndex++];
            reducedPalette[reducedPaletteIndex++] = palette[colorIndex];
        }
        return reducedPalette;
    }

    function getNetworkSize(numColors, startingSize){
        let currentSize = startingSize;
        while(currentSize < numColors){
            currentSize *= 2;
        }
        return currentSize;
    }

    function neuQuant(pixels, numColors, colorQuantization, _imageWidth, _imageHeight, progressCallback){
        const networkSize = getNetworkSize(numColors, colorQuantization.networkSize || 256);
        const quantizer = new NeuQuant(networkSize);
        let palette = quantizer.buildColormap(pixels, colorQuantization.sample, progressCallback);
        if(numColors < networkSize){
            palette = reducePaletteSize(palette, numColors);
        }
        return palette;
    }

    return {
       neuQuant,
    };
})(App.ArrayUtil);