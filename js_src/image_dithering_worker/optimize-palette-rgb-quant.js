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
//     minHueCols: 0,           // # of colors per hue group to evaluate regardless of counts, to retain low-count hues
//     cacheFreq: 10,           // min color occurance count needed to qualify for caching
//     colorDist: "euclidean",  // method used to determine color distance, can also be "manhattan"
// };

App.RgbQuant = (function(){
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
		// palette grouping
		this.hueGroups = opts.hueGroups || 10;
		this.satGroups = opts.satGroups || 10;
		this.lumGroups = opts.lumGroups || 10;
		// if > 0, enables hues stats and min-color retention per group
		this.minHueCols = opts.minHueCols || 0;
		// HueStats instance
		this.hueStats = this.minHueCols ? new HueStats(this.hueGroups, this.minHueCols) : null;

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
		// enable color caching (also incurs overhead of cache misses and cache building)
		this.useCache = false;
		// min color occurance count needed to qualify for caching
		this.cacheFreq = opts.cacheFreq || 10;
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
		let histG  = this.histogram;
		let sorted = sortedHashKeys(histG);
		let idxi32 = sorted;

		if(this.method === 1){
			let cols = this.initColors;
			let freq = histG[sorted[cols - 1]];

			idxi32 = sorted.slice(0, cols);

			// add any cut off colors with same freq as last
			let pos = cols;
			const len = sorted.length;
			while(pos < len && histG[sorted[pos]] == freq){
				idxi32.push(sorted[pos++]);
			}

			// inject min huegroup colors
			if(this.hueStats){
				this.hueStats.inject(idxi32);
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

	RgbQuant.prototype.prunePal = function(keep){
		for(let j = 0; j < this.idxrgb.length; j++){
			if(!keep[j]){
				const i32 = this.idxi32[j];
				this.idxrgb[j] = null;
				this.idxi32[j] = null;
				delete this.i32idx[i32];
			}
		}
	};

	// reduces similar colors from an importance-sorted Uint32 rgba array
	RgbQuant.prototype.reducePal = function reducePal(idxi32) {
		// if pre-defined palette's length exceeds target
		if (this.idxrgb.length > this.colors) {
			// quantize histogram to existing palette
			var len = idxi32.length, keep = {}, uniques = 0, idx, pruned = false;

			for (var i = 0; i < len; i++) {
				// palette length reached, unset all remaining colors (sparse palette)
				if (uniques == this.colors && !pruned) {
					this.prunePal(keep);
					pruned = true;
				}

				idx = this.nearestIndex(idxi32[i]);

				if (uniques < this.colors && !keep[idx]) {
					keep[idx] = true;
					uniques++;
				}
			}

			if (!pruned) {
				this.prunePal(keep);
				pruned = true;
			}
		}
		// reduce histogram to create initial palette
		else {
			// build full rgb palette
			var idxrgb = idxi32.map(function(i32) {
				return [
					(i32 & 0xff),
					(i32 & 0xff00) >> 8,
					(i32 & 0xff0000) >> 16,
				];
			});

			var len = idxrgb.length,
				palLen = len,
				thold = this.initDist;

			// palette already at or below desired length
			if (palLen > this.colors) {
				while (palLen > this.colors) {
					var memDist = [];

					// iterate palette
					for (var i = 0; i < len; i++) {
						var pxi = idxrgb[i], i32i = idxi32[i];
						if (!pxi) continue;

						for (var j = i + 1; j < len; j++) {
							var pxj = idxrgb[j], i32j = idxi32[j];
							if (!pxj) continue;

							var dist = this.colorDist(pxi, pxj);

							if (dist < thold) {
								// store index,rgb,dist
								memDist.push([j, pxj, i32j, dist]);

								// kill squashed value
								delete(idxrgb[j]);
								palLen--;
							}
						}
					}

					// palette reduction pass
					// console.log("palette length: " + palLen);

					// if palette is still much larger than target, increment by larger initDist
					thold += (palLen > this.colors * 3) ? this.initDist : this.distIncr;
				}

				// if palette is over-reduced, re-add removed colors with largest distances from last round
				if (palLen < this.colors) {
					// sort descending
					sort.call(memDist, function(a,b) {
						return b[3] - a[3];
					});

					var k = 0;
					while (palLen < this.colors) {
						// re-inject rgb into final palette
						idxrgb[memDist[k][0]] = memDist[k][1];

						palLen++;
						k++;
					}
				}
			}

			var len = idxrgb.length;
			for (var i = 0; i < len; i++) {
				if (!idxrgb[i]) continue;

				this.idxrgb.push(idxrgb[i]);
				this.idxi32.push(idxi32[i]);

				this.i32idx[idxi32[i]] = this.idxi32.length - 1;
				this.i32rgb[idxi32[i]] = idxrgb[i];
			}
		}
	};

	// global top-population
	RgbQuant.prototype.colorStats1D = function(buf32){
		var histG = this.histogram,
			num = 0, col,
			len = buf32.length;

		for(let i=0;i<len;i++){
			col = buf32[i];

			// skip transparent
			if((col & 0xff000000) >> 24 == 0){
                continue;
            }

			// collect hue stats
			if(this.hueStats){
                this.hueStats.check(col);
            }

			if(col in histG){
                histG[col]++;
            }
			else{
                histG[col] = 1;
            }
		}
	};

	// population threshold within subregions
	// FIXME: this can over-reduce (few/no colors same?), need a way to keep
	// important colors that dont ever reach local thresholds (gradients?)
	RgbQuant.prototype.colorStats2D = function(buf32, width){
		var boxW = this.boxSize[0],
			boxH = this.boxSize[1],
			area = boxW * boxH,
			boxes = makeBoxes(width, buf32.length / width, boxW, boxH),
			histG = this.histogram,
			self = this;

		boxes.forEach(function(box) {
			var effc = Math.max(Math.round((box.w * box.h) / area) * self.boxPxls, 2),
				histL = {}, col;

			iterBox(box, width, function(i) {
				col = buf32[i];

				// skip transparent
				if ((col & 0xff000000) >> 24 == 0) return;

				// collect hue stats
				if (self.hueStats)
					self.hueStats.check(col);

				if (col in histG)
					histG[col]++;
				else if (col in histL) {
					if (++histL[col] >= effc)
						histG[col] = histL[col];
				}
				else
					histL[col] = 1;
			});
		});

		if (this.hueStats)
			this.hueStats.inject(histG);
	};

	// TOTRY: use HUSL - http://boronine.com/husl/
	RgbQuant.prototype.nearestIndex = function(i32){
		// alpha 0 returns null index
		if ((i32 & 0xff000000) >> 24 == 0)
			return null;

		if (this.useCache && (""+i32) in this.i32idx)
			return this.i32idx[i32];

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

	function HueStats(numGroups, minCols) {
		this.numGroups = numGroups;
		this.minCols = minCols;
		this.stats = {};

		for (var i = -1; i < numGroups; i++)
			this.stats[i] = {num: 0, cols: []};

		this.groupsFull = 0;
	}

	HueStats.prototype.check = function checkHue(i32) {
		if (this.groupsFull == this.numGroups + 1)
			this.check = function() {return;};

		var r = (i32 & 0xff),
			g = (i32 & 0xff00) >> 8,
			b = (i32 & 0xff0000) >> 16,
			hg = (r == g && g == b) ? -1 : hueGroup(rgb2hsl(r,g,b).h, this.numGroups),
			gr = this.stats[hg],
			min = this.minCols;

		gr.num++;

		if (gr.num > min)
			return;
		if (gr.num == min)
			this.groupsFull++;

		if (gr.num <= min)
			this.stats[hg].cols.push(i32);
	};

	HueStats.prototype.inject = function injectHues(histG) {
		for (var i = -1; i < this.numGroups; i++) {
			if (this.stats[i].num <= this.minCols) {
				switch (typeOf(histG)) {
					case "Array":
						this.stats[i].cols.forEach(function(col){
							if (histG.indexOf(col) == -1)
								histG.push(col);
						});
						break;
					case "Object":
						this.stats[i].cols.forEach(function(col){
							if (!histG[col])
								histG[col] = 1;
							else
								histG[col]++;
						});
						break;
				}
			}
		}
	};

	// Rec. 709 (sRGB) luma coef
	const Pr = .2126;
	const Pg = .7152;
	const Pb = .0722;

	// http://alienryderflex.com/hsp.html
	function rgb2lum(r,g,b) {
		return Math.sqrt(
			Pr * r*r +
			Pg * g*g +
			Pb * b*b
		);
	}

	const rd = 255;
	const gd = 255;
	const bd = 255;

	const euclMax = Math.sqrt(Pr*rd*rd + Pg*gd*gd + Pb*bd*bd);
	// perceptual Euclidean color distance
	function distEuclidean(rgb0, rgb1) {
		var rd = rgb1[0]-rgb0[0],
			gd = rgb1[1]-rgb0[1],
			bd = rgb1[2]-rgb0[2];

		return Math.sqrt(Pr*rd*rd + Pg*gd*gd + Pb*bd*bd) / euclMax;
	}

	const manhMax = Pr*rd + Pg*gd + Pb*bd;
	// perceptual Manhattan color distance
	function distManhattan(rgb0, rgb1) {
		var rd = Math.abs(rgb1[0]-rgb0[0]),
			gd = Math.abs(rgb1[1]-rgb0[1]),
			bd = Math.abs(rgb1[2]-rgb0[2]);

		return (Pr*rd + Pg*gd + Pb*bd) / manhMax;
	}

	// http://rgb2hsl.nichabi.com/javascript-function.php
	function rgb2hsl(r, g, b) {
		var max, min, h, s, l, d;
		r /= 255;
		g /= 255;
		b /= 255;
		max = Math.max(r, g, b);
		min = Math.min(r, g, b);
		l = (max + min) / 2;
		if (max == min) {
			h = s = 0;
		} else {
			d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g:	h = (b - r) / d + 2; break;
				case b:	h = (r - g) / d + 4; break
			}
			h /= 6;
		}
		return {
			h: h,
			s: s,
			l: rgb2lum(r,g,b),
		};
	}

	function hueGroup(hue, segs) {
		var seg = 1/segs,
			haf = seg/2;

		if (hue >= 1 - haf || hue <= haf)
			return 0;

		for (var i = 1; i < segs; i++) {
			var mid = i*seg;
			if (hue >= mid - haf && hue <= mid + haf)
				return i;
		}
	}

	function typeOf(val){
		return Object.prototype.toString.call(val).slice(8,-1);
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

		return this.sort(function(a,b) {
			return fn(a,b) || ord.get(a) - ord.get(b);
		});
	}

	// test if js engine's Array#sort implementation is stable
	function isArrSortStable(){
		const str = 'abcdefghijklmnopqrstuvwxyz';

		return 'xyzvwtursopqmnklhijfgdeabc' == str.split('').sort(function(a,b){
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
		return sort.call(Object.keys(obj), function(a,b){
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