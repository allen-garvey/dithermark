App.AlgorithmModel = (function(BwDither, ColorDither){
	const bwDitherGroups = <?= bwAlgoGroups(); ?>;

    const bwDitherAlgorithms = [
		<?php printAppAlgoModel(bwAlgorithmModel()); ?>
	];
	const colorDitherGroups = <?= colorAlgoGroups(); ?>;
            
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