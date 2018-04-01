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
		<?php printAppAlgoModel(bwAlgorithmModel()); ?>
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
		<?php printAppAlgoModel(colorAlgorithmModel()); ?>
    ];
            
    
    
    return {
		bwDitherGroups: bwDitherGroups,
		bwDitherAlgorithms: bwDitherAlgorithms,
		colorDitherGroups: colorDitherGroups,
        colorDitherAlgorithms: colorDitherAlgorithms,
    };
    
})(App.WebGlBwDither, App.WebGlColorDither);