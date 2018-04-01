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
			length: 5,
		},
	].map(assignStart);
    const bwDitherAlgorithms = [
		<?php foreach(bwAlgorithmModel() as $algorithm): ?>
			{
				title: '<?= $algorithm->name(); ?>',
				id: <?= $algorithm->id(); ?>,
				<?php if($algorithm->webGlFunc() !== ''): ?>
					webGlFunc: <?= $algorithm->webGlFunc(); ?>,
				<?php endif; ?>
			},
		<?php endforeach; ?>
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
			length: 5,
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
					title: "Cluster Ordered Dither 2x2",
					id: 114,
					webGlFunc: ColorDither.createClusterOrderedDither(2),
				},
				{
					title: "Cluster Ordered Dither 4x4",
					id: 115,
					webGlFunc: ColorDither.createClusterOrderedDither(4),
				},
				{
					title: "Cluster Ordered Dither 8x8",
					id: 116,
					webGlFunc: ColorDither.createClusterOrderedDither(8),
				},
				{
					title: "Cluster Ordered Dither 16x16",
					id: 117,
					webGlFunc: ColorDither.createClusterOrderedDither(16),
				},
				{
					title: "Dot Cluster Ordered Dither 4x4",
					id: 118,
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