/*
* Copyright (c) 2015, Leon Sorokin
* All rights reserved. (MIT Licensed)
*
* RgbQuant.js - an image quantization lib
*/

//based on https://github.com/leeoniya/RgbQuant.js
//reduced options are:
// const opts = {
//     colors: 256,             // desired palette size
//     method: 2,               // histogram method, 2: min-population threshold within subregions; 1: global top-population
//     boxSize: [64,64],        // subregion dims (if method = 2)
//     boxPxls: 2,              // min-population threshold (if method = 2)
//     initColors: 4096,        // # of top-occurring colors  to start with (if method = 1)
//     colorDist: "euclidean",  // method used to determine color distance, can also be "manhattan"
// };

App.OptimizePaletteRgbQuant = (function(){
	/**
	 * Distances
	 */
	//distance constants
	// Rec. 709 (sRGB) luma coef
	const Pr = .2126;
	const Pg = .7152;
	const Pb = .0722;

	const rgbMaxValue = 255;
	const euclMax = Math.sqrt(rgbMaxValue * rgbMaxValue * (Pr + Pg + Pb));
	const manhMax = rgbMaxValue * (Pr + Pg + Pb);

	// perceptual Euclidean color distance
	function distEuclidean(rgb0, rgb1) {
		const rDist = rgb1[0]-rgb0[0];
		const gDist = rgb1[1]-rgb0[1];
		const bDist = rgb1[2]-rgb0[2];

		return Math.sqrt(rDist*rDist*Pr + gDist*gDist*Pg + bDist*bDist*Pb);
	}

	// perceptual Manhattan color distance
	function distManhattan(rgb0, rgb1) {
		const rDist = Math.abs(rgb1[0]-rgb0[0]);
		const gDist = Math.abs(rgb1[1]-rgb0[1]);
		const bDist = Math.abs(rgb1[2]-rgb0[2]);

		return Pr*rDist + Pg*gDist + Pb*bDist;
	}


	function RgbQuant(numColors, opts){
		opts = opts || {};

		// 1 = by global population, 2 = subregion population threshold
		this.method = opts.method || 2;
		// desired final palette size
		this.colors = numColors;
		// # of highest-frequency colors to start with for palette reduction
		this.initColors = opts.initColors || 4096;

		// subregion partitioning box size
		this.boxSize = opts.boxSize || [64,64];
		// number of same pixels required within box for histogram inclusion
		this.boxPixels = opts.boxPxls || 2;
		
		// color-distance threshold for initial reduction pass
		this.initDist = opts.initDist || 0.01;
		// subsequent passes threshold
		this.distIncr = opts.distIncr || 0.005;
		// selection of color-distance equation
		
		//normalize distances so that distance functions have to do less work
		if(opts.colorDist == 'manhattan'){
			this.colorDist = distManhattan;
			this.initDist *= manhMax;
			this.distIncr *= manhMax;
		}
		else{
			this.colorDist = distEuclidean;
			this.initDist *= euclMax;
			this.distIncr *= euclMax;

			// this.initDist = this.initDist * this.initDist;
			// this.distIncr = this.distIncr * this.distIncr;
		}
	}

	//pixels is UInt8ClampedArray of pixel data
	RgbQuant.prototype.sample = function(pixels, imageWidth){
		let buf32 = new Uint32Array(pixels.buffer);
		if(this.method === 1){
			return this.colorStats1D(buf32);
		}
		return this.colorStats2D(buf32, imageWidth);
	};

	// reduces histogram to palette, remaps & memoizes reduced colors
	RgbQuant.prototype.buildPalette = function(histogram){
		let sorted = sortedHashKeys(histogram);
		let idxi32 = sorted;

		if(this.method === 1){
			//take the most popular colors in image
			const mostPopularColorsCount = this.initColors;
			idxi32 = sorted.slice(0, mostPopularColorsCount);
			const leastPopularColorFrequency = histogram[idxi32[idxi32.length - 1]];

			//continue to add colors if they appear with the same frequency
			//as the least popular color in slice
			let currentIndex = mostPopularColorsCount;
			const len = sorted.length;
			while(currentIndex < len && histogram[sorted[currentIndex]] === leastPopularColorFrequency){
				idxi32.push(sorted[currentIndex++]);
			}
		}

		// int32-ify values
		idxi32 = idxi32.map(function(v){ return +v; });

		return this.reducePalette(idxi32);
	};

	RgbQuant.prototype.palette = function(histogram){
		return new Uint8Array((new Uint32Array(this.buildPalette(histogram))).buffer);
	};

	// reduces similar colors from an importance-sorted Uint32 rgba array
	RgbQuant.prototype.reducePalette = function(idxi32){
		// reduce histogram to create initial palette
		// build full rgb palette
		let idxrgb = idxi32.map((i32)=>{
			return [
				(i32 & 0xff),
				(i32 & 0xff00) >> 8,
				(i32 & 0xff0000) >> 16,
			];
		});

		const len = idxrgb.length;
		let paletteLength = len;
		let threshold = this.initDist;
		let memDist = [];
		while(paletteLength > this.colors){
			memDist = [];

			// iterate palette
			for(let pixel1Index = 0; pixel1Index < len; pixel1Index++){
				const pixel1 = idxrgb[pixel1Index];
				if(!pixel1){
					continue;
				}
				for(let pixel2Index = pixel1Index + 1; pixel2Index < len; pixel2Index++){
					const pixel2 = idxrgb[pixel2Index];
					if(!pixel2){
						continue;
					}
					const distance = this.colorDist(pixel1, pixel2);

					if(distance < threshold){
						// store index,rgb,dist
						memDist.push([pixel2Index, pixel2, distance]);

						// kill squashed value
						delete(idxrgb[pixel2Index]);
						paletteLength--;
					}
				}
			}

			// if palette is still much larger than target, increment by larger initDist
			threshold += (paletteLength > this.colors * 3) ? this.initDist : this.distIncr;
		}

		// if palette is over-reduced, re-add removed colors with largest distances from last round
		if(paletteLength < this.colors){
			// sort descending
			sort.call(memDist, function(a,b){
				return b[2] - a[2];
			});
			for(let k=0;paletteLength<this.colors;paletteLength++,k++){
				// re-inject rgb into final palette
				idxrgb[memDist[k][0]] = memDist[k][1];
			}
		}
		const idxi32Ret = [];
		//can't use forEach() here, since it will omit deleted items
		for(let i=0;i<len;i++) {
			if(!idxrgb[i]){
				continue;
			}
			idxi32Ret.push(idxi32[i]);
		}
		return idxi32Ret;
	};

	// global top-population
	RgbQuant.prototype.colorStats1D = function(buf32){
		const histogram = {};
		const len = buf32.length;

		for(let i=0;i<len;i++){
			let pixel = buf32[i];

			// skip transparent
			if((pixel & 0xff000000) >> 24 == 0){
                continue;
            }

			if(pixel in histogram){
                histogram[pixel]++;
            }
			else{
                histogram[pixel] = 1;
            }
		}
		return histogram;
	};

	// population threshold within subregions
	// FIXME: this can over-reduce (few/no colors same?), need a way to keep
	// important colors that dont ever reach local thresholds (gradients?)
	RgbQuant.prototype.colorStats2D = function(buf32, imageWidth){
		const boxWidth = this.boxSize[0];
		const boxHeight = this.boxSize[1];
		let boxArea = boxWidth * boxHeight;
		const boxes = makeBoxes(imageWidth, buf32.length / imageWidth, boxWidth, boxHeight);
		const histogram = {};
		const boxPixels = this.boxPixels;

		boxes.forEach((box)=>{
			//need to find actual area of box and compare it with boxArea, since it might be less
			//pixelFrequencyThreshold is the minimum number of identical pixels in box needed for it to be added to
			//global histogram
			const pixelFrequencyThreshold = Math.max(Math.round((box.width * box.height) / boxArea) * boxPixels, 2);
			const boxHistogram = {};

			iteratePixelsInBox(box, imageWidth, (i)=>{
				const pixel = buf32[i];

				// skip transparent
				if((pixel & 0xff000000) >> 24 == 0){
					return;
				}

				if(pixel in histogram){
					histogram[pixel]++;
				}
				else if(pixel in boxHistogram){
					if (++boxHistogram[pixel] >= pixelFrequencyThreshold){
						histogram[pixel] = boxHistogram[pixel];
					}
				}
				else{
					boxHistogram[pixel] = 1;
				}
			});
		});
		return histogram;
	};

	const sort = isArrSortStable() ? Array.prototype.sort : stableSort;

	// must be used via stableSort.call(arr, fn)
	function stableSort(fn){
		const initialOrder = new Map();
		this.forEach((item, index)=>{
			if(!initialOrder.has(item)){
				initialOrder.set(item, index);
			}
		});

		return this.sort((a,b)=>{
			return fn(a,b) || initialOrder.get(a) - initialOrder.get(b);
		});
	}

	// test if js engine's Array#sort implementation is stable
	function isArrSortStable(){
		const str = 'abcdefghijklmnopqrstuvwxyz';

		return 'xyzvwtursopqmnklhijfgdeabc' == str.split('').sort((a,b)=>{
			return ~~(str.indexOf(b)/2.3) - ~~(str.indexOf(a)/2.3);
		}).join('');
	}

	// partitions a rect of wid x hgt into
	// array of bboxes of w0 x h0 (or less)
	function makeBoxes(width, height, boxWidth, boxHeight){
		const wrem = width % boxWidth;
		const hrem = height % boxHeight;
		const xend = width - wrem;
		const yend = height - hrem;

		let bxs = [];
		for(let y = 0; y < height; y += boxHeight){
			for(let x = 0; x < width; x += boxWidth){
				bxs.push({
					x,
					y, 
					width: (x == xend ? wrem : boxWidth),
					height: (y == yend ? hrem : boxHeight),
				});
			}
		}
		return bxs;
	}

	// iterates @bbox within a parent rect of width @wid; calls @fn, passing index within parent
	function iteratePixelsInBox(box, imageWidth, fn){
		let i = box.y * imageWidth + box.x;
		const i1 = (box.y + box.height - 1) * imageWidth + (box.x + box.width - 1);
		let cnt = 0;
		const incr = imageWidth - box.width + 1;

		do{
			fn(i);
			i += (++cnt % box.width == 0) ? incr : 1;
		}while(i <= i1);
	}

	// returns array of hash keys sorted by their values
	function sortedHashKeys(obj){
		return sort.call(Object.keys(obj), (a,b)=>{
			return obj[b] - obj[a];
		});
	}
	

	/**
	 * Added shim functions for optimize palette compatibility
	*/
	function formatPaletteBuffer(paletteBuffer, numColors){
		const ret = new Uint8Array(numColors * 3);
		for(let sourceIndex=0,destIndex=0;sourceIndex<paletteBuffer.length;sourceIndex+=4,destIndex+=3){
			ret[destIndex] = paletteBuffer[sourceIndex];
			ret[destIndex+1] = paletteBuffer[sourceIndex+1];
			ret[destIndex+2] = paletteBuffer[sourceIndex+2];
		}
		return ret;
	}
    
    function rgbQuant(pixels, numColors, colorQuantization, imageWidth, _imageHeight, progressCallback){
        let options = {
			method: colorQuantization.method,
		};
		if(colorQuantization.colorDist){
			options.colorDist = colorQuantization.colorDist;
		}
		const q = new RgbQuant(numColors, options);
		const histogram = q.sample(pixels, imageWidth);
		//roughly half done here
		progressCallback(50);
        const palette = q.palette(histogram);
		return formatPaletteBuffer(palette, numColors);
    }


    return {
        rgbQuant
    };
})();