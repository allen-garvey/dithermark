App.AlgorithmModel = (function(BwDither, ColorDither){
	function assignStart(item, index, array){
		let start = 0;
		if(index > 0){
			let previousItem = array[index-1];
			start = previousItem.start + previousItem.length;
		}
		item.start = start;
		return item;
	}

	let bwDitherGroups = [
		{
			title: 'Threshold',
			length: 2,
		},
		{
			title: 'Arithmetic',
			length: 6,
		},
		{
			title: 'Error Propagation',
			length: 7,
		},
		{
			title: 'Error Propagation Reduced Bleed',
			length: 2,
		},
		{
			title: 'Ordered (Bayer)',
			length: 4,
		},
		{
			title: 'Ordered (Cluster)',
			length: 2,
		},
	].map(assignStart);
    const bwDitherAlgorithms = [
                {
                    title: "Threshold", 
                    id: 1,
                    webGlFunc: BwDither.threshold,
                },
                {
                    title: "Random Threshold", 
                    id: 2,
                    webGlFunc: BwDither.randomThreshold,
                },
                {
            	    title: "Arithmetic Dither Xor 1",
            	    id: 16,
            	    webGlFunc: BwDither.aDitherXor1,
            	},
            	{
            	    title: "Arithmetic Dither Xor 2",
            	    id: 17,
            	    webGlFunc: BwDither.aDitherXor2,
            	},
            	{
            	    title: "Arithmetic Dither Xor 3",
            	    id: 18,
            	    webGlFunc: BwDither.aDitherXor3,
            	},
            	{
            	    title: "Arithmetic Dither Add 1",
            	    id: 19,
            	    webGlFunc: BwDither.aDitherAdd1,
            	},
            	{
            	    title: "Arithmetic Dither Add 2",
            	    id: 20,
            	    webGlFunc: BwDither.aDitherAdd2,
            	},
            	{
            	    title: "Arithmetic Dither Add 3",
            	    id: 21,
            	    webGlFunc: BwDither.aDitherAdd3,
            	},
                {
                    title: "Floyd-Steinberg", 
                    id: 4,
                },
                {
            		title: "Javis-Judice-Ninke",
            		id: 5,
            	},
            	{
            		title: "Stucki",
            		id: 6,
            	},
            	{
            		title: "Burkes",
            		id: 7,
            	},
            	{
            		title: "Sierra3",
            		id: 8,
            	},
            	{
            		title: "Sierra2",
            		id: 9,
            	},
            	{
            		title: "Sierra1",
            		id: 10,
				},
				{
                    title: "Atkinson", 
                    id: 3,
                },
            	{
            	    title: "Garvey",
            	    id: 15,
            	},
            	{
            	    title: "Ordered Dither 2x2",
            	    id: 11,
            	    webGlFunc: BwDither.createOrderedDither(2),
            	},
            	{
            	    title: "Ordered Dither 4x4",
            	    id: 12,
            	    webGlFunc: BwDither.createOrderedDither(4),
            	},
            	{
            	    title: "Ordered Dither 8x8",
            	    id: 13,
            	    webGlFunc: BwDither.createOrderedDither(8),
            	},
            	{
            	    title: "Ordered Dither 16x16",
            	    id: 14,
            	    webGlFunc: BwDither.createOrderedDither(16),
				},
				{
					title: "Cluster Ordered Dither 4x4",
					id: 22,
					webGlFunc: BwDither.clusterOrderedDither,
				},
				{
					title: "Dot Cluster Ordered Dither 4x4",
					id: 23,
					webGlFunc: BwDither.dotClusterOrderedDither,
				},
			];
	let colorDitherGroups = [
		{
			title: 'Closest',
			length: 2,
		},
		{
			title: 'Arithmetic',
			length: 6,
		},
		// {
		// 	title: 'Error Propagation',
		// 	length: 7,
		// },
		// {
		// 	title: 'Error Propagation Reduced Bleed',
		// 	length: 2,
		// },
		{
			title: 'Ordered (Bayer)',
			length: 5,
		},
		{
			title: 'Ordered (Cluster)',
			length: 2,
		},
	].map(assignStart);
            
    const colorDitherAlgorithms = [
                {
                    title: "Closest Color", 
                    id: 101,
                    webGlFunc: ColorDither.closestColor,
                },
                {
                    title: "Random Closest Color", 
                    id: 102,
                    webGlFunc: ColorDither.randomClosestColor,
                },
                {
            	    title: "Arithmetic Dither Xor 1",
            	    id: 103,
            	    webGlFunc: ColorDither.aDitherXor1,
            	},
            	{
            	    title: "Arithmetic Dither Xor 2",
            	    id: 104,
            	    webGlFunc: ColorDither.aDitherXor2,
            	},
            	{
            	    title: "Arithmetic Dither Xor 3",
            	    id: 105,
            	    webGlFunc: ColorDither.aDitherXor3,
            	},
            	{
            	    title: "Arithmetic Dither Add 1",
            	    id: 106,
            	    webGlFunc: ColorDither.aDitherAdd1,
            	},
            	{
            	    title: "Arithmetic Dither Add 2",
            	    id: 107,
            	    webGlFunc: ColorDither.aDitherAdd2,
            	},
            	{
            	    title: "Arithmetic Dither Add 3",
            	    id: 108,
            	    webGlFunc: ColorDither.aDitherAdd3,
            	},
                {
                    title: "Ordered Dither 2x2", 
                    id: 109,
                    webGlFunc: ColorDither.createOrderedDither(2),
                },
                {
                    title: "Ordered Dither 4x4", 
                    id: 110,
                    webGlFunc: ColorDither.createOrderedDither(4),
                },
                {
                    title: "Ordered Dither 8x8", 
                    id: 111,
                    webGlFunc: ColorDither.createOrderedDither(8),
                },
                {
                    title: "Ordered Dither 16x16", 
                    id: 112,
                    webGlFunc: ColorDither.createOrderedDither(16),
                },
                {
                    title: "Hue-Lightness Ordered Dither 16x16", 
                    id: 113,
                    webGlFunc: ColorDither.createHueLightnessOrderedDither(16),
				},
				{
					title: "Cluster Ordered Dither 4x4",
					id: 114,
					webGlFunc: ColorDither.createClusterOrderedDither(4),
				},
				{
					title: "Dot Cluster Ordered Dither 4x4",
					id: 115,
					webGlFunc: ColorDither.createDotClusterOrderedDither(4),
				},
            ];
            
    
    
    return {
		bwDitherGroups: bwDitherGroups,
		bwDitherAlgorithms: bwDitherAlgorithms,
		colorDitherGroups: colorDitherGroups,
        colorDitherAlgorithms: colorDitherAlgorithms,
    };
    
})(App.WebGlBwDither, App.WebGlColorDither);