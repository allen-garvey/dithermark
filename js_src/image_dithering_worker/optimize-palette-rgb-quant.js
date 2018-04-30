/*
* Copyright (c) 2015, Leon Sorokin
* All rights reserved. (MIT Licensed)
*
* RgbQuant.js - an image quantization lib
*/

//based on https://github.com/leeoniya/RgbQuant.js
//reduced options are:
// var opts = {
//     colors: 256,             // desired palette size
//     method: 2,               // histogram method, 2: min-population threshold within subregions; 1: global top-population
//     boxSize: [64,64],        // subregion dims (if method = 2)
//     boxPxls: 2,              // min-population threshold (if method = 2)
//     initColors: 4096,        // # of top-occurring colors  to start with (if method = 1)
//     colorDist: "euclidean",  // method used to determine color distance, can also be "manhattan"
// };

App.OptimizePaletteRgbQuant = (function(){
	function RgbQuant(opts){
		opts = opts || {};

		// 1 = by global population, 2 = subregion population threshold
		this.method = opts.method || 2;
		// desired final palette size
		this.colors = opts.colors;
		// # of highest-frequency colors to start with for palette reduction
		this.initColors = opts.initColors || 4096;
		// color-distance threshold for initial reduction pass
		this.initDist = opts.initDist || 0.01;
		// subsequent passes threshold
		this.distIncr = opts.distIncr || 0.005;

		// subregion partitioning box size
		this.boxSize = opts.boxSize || [64,64];
		// number of same pixels required within box for histogram inclusion
		this.boxPxls = opts.boxPxls || 2;

		// accumulated histogram
		this.histogram = {};
		// palette - rgb triplets
		this.idxrgb = [];
		// palette - int32 vals
		this.idxi32 = [];
		// reverse lookup {i32:idx}
		this.i32idx = {};
		// {i32:rgb}
		this.i32rgb = {};
		// selection of color-distance equation
		this.colorDist = opts.colorDist == 'manhattan' ? distManhattan : distEuclidean;
	}

	//pixels is UInt8ClampedArray of pixel data
	RgbQuant.prototype.sample = function(pixels, imageWidth){
		let buf32 = new Uint32Array(pixels.buffer);
		if(this.method === 1){
			this.colorStats1D(buf32);
		}
		else{
			this.colorStats2D(buf32, imageWidth);
		}
	};

	// reduces histogram to palette, remaps & memoizes reduced colors
	RgbQuant.prototype.buildPal = function(){
		let histogram  = this.histogram;
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

		this.reducePal(idxi32);
	};

	RgbQuant.prototype.palette = function palette() {
		this.buildPal();
		return new Uint8Array((new Uint32Array(this.idxi32)).buffer);
	};

	// reduces similar colors from an importance-sorted Uint32 rgba array
	RgbQuant.prototype.reducePal = function reducePal(idxi32) {
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

		//can't reuse old len variable, since we have modified idxrgb length in while loop
		for(let i=0;i<idxrgb.length;i++) {
			if(!idxrgb[i]){
				continue;
			}
			this.idxi32.push(idxi32[i]);
		}
	};

	// global top-population
	RgbQuant.prototype.colorStats1D = function(buf32){
		const histogram = this.histogram;
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
	};

	// population threshold within subregions
	// FIXME: this can over-reduce (few/no colors same?), need a way to keep
	// important colors that dont ever reach local thresholds (gradients?)
	RgbQuant.prototype.colorStats2D = function(buf32, imageWidth){
		const boxWidth = this.boxSize[0];
		const boxHeight = this.boxSize[1];
		let area = boxWidth * boxHeight;
		let boxes = makeBoxes(imageWidth, buf32.length / imageWidth, boxWidth, boxHeight);
		const histG = this.histogram;
		const self = this;

		boxes.forEach(function(box){
			const effc = Math.max(Math.round((box.w * box.h) / area) * self.boxPxls, 2);
			const histL = {};

			iterBox(box, imageWidth, function(i){
				const col = buf32[i];

				// skip transparent
				if((col & 0xff000000) >> 24 == 0){
					return;
				}

				if(col in histG){
					histG[col]++;
				}
				else if(col in histL){
					if (++histL[col] >= effc){
						histG[col] = histL[col];
					}
				}
				else{
					histL[col] = 1;
				}
			});
		});
	};

	// TOTRY: use HUSL - http://boronine.com/husl/
	RgbQuant.prototype.nearestIndex = function(i32){
		// alpha 0 returns null index
		if ((i32 & 0xff000000) >> 24 == 0)
			return null;

		var min = 1000,
			idx,
			rgb = [
				(i32 & 0xff),
				(i32 & 0xff00) >> 8,
				(i32 & 0xff0000) >> 16,
			],
			len = this.idxrgb.length;

		for (var i = 0; i < len; i++) {
			if (!this.idxrgb[i]) continue;		// sparse palettes

			var dist = this.colorDist(rgb, this.idxrgb[i]);

			if (dist < min) {
				min = dist;
				idx = i;
			}
		}

		return idx;
	};

	// Rec. 709 (sRGB) luma coef
	const Pr = .2126;
	const Pg = .7152;
	const Pb = .0722;

	const rgbMaxValue = 255;
	const rgbMaxValueSquared = rgbMaxValue * rgbMaxValue; 

	const euclMax = Math.sqrt(Pr*rgbMaxValueSquared + Pg*rgbMaxValueSquared + Pb*rgbMaxValueSquared);
	// perceptual Euclidean color distance
	function distEuclidean(rgb0, rgb1) {
		var rd = rgb1[0]-rgb0[0],
			gd = rgb1[1]-rgb0[1],
			bd = rgb1[2]-rgb0[2];

		return Math.sqrt(Pr*rd*rd + Pg*gd*gd + Pb*bd*bd) / euclMax;
	}

	const manhMax = Pr*rgbMaxValue + Pg*rgbMaxValue + Pb*rgbMaxValue;
	// perceptual Manhattan color distance
	function distManhattan(rgb0, rgb1) {
		var rd = Math.abs(rgb1[0]-rgb0[0]),
			gd = Math.abs(rgb1[1]-rgb0[1]),
			bd = Math.abs(rgb1[2]-rgb0[2]);

		return (Pr*rd + Pg*gd + Pb*bd) / manhMax;
	}

	const sort = isArrSortStable() ? Array.prototype.sort : stableSort;

	// must be used via stableSort.call(arr, fn)
	function stableSort(fn){
		const ord = new Map();
		this.forEach((item, index)=>{
			if(!ord.has(item)){
				ord.set(item, index);
			}
		});

		return this.sort((a,b)=>{
			return fn(a,b) || ord.get(a) - ord.get(b);
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
	function makeBoxes(width, height, w0, h0){
		const wrem = width % w0;
		const hrem = height % h0;
		const xend = width - wrem;
		const yend = height - hrem;

		let bxs = [];
		for (let y = 0; y < height; y += h0){
			for(let x = 0; x < width; x += w0){
				bxs.push({
					x,
					y, 
					w: (x == xend ? wrem : w0),
					h: (y == yend ? hrem : h0),
				});
			}
		}
		return bxs;
	}

	// iterates @bbox within a parent rect of width @wid; calls @fn, passing index within parent
	function iterBox(bbox, wid, fn){
		let i = bbox.y * wid + bbox.x;
		const i1 = (bbox.y + bbox.h - 1) * wid + (bbox.x + bbox.w - 1);
		let cnt = 0;
		const incr = wid - bbox.w + 1;

		do{
			fn.call(this, i);
			i += (++cnt % bbox.w == 0) ? incr : 1;
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
    
    function rgbQuant(pixels, numColors, colorQuantization, imageWidth, _imageHeight){
        let options = {
			colors: numColors,
			method: colorQuantization.method,
		};
		if(colorQuantization.colorDist){
			options.colorDist = colorQuantization.colorDist;
		}
        const q = new RgbQuant(options);
        q.sample(pixels, imageWidth);
        const palette = q.palette();
		return formatPaletteBuffer(palette, numColors);
    }


    return {
        rgbQuant
    };
})();