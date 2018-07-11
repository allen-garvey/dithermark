
App.Algorithms = (function(Threshold, OrderedDither, ErrorPropDither, ErrorPropColorDither){
    function ditherAlgorithms(){
        return {
			<?php foreach(array_merge(bwAlgorithmModel(), colorAlgorithmModel()) as $algorithm): ?>
			<?= $algorithm->id(); ?>: {
					title: '<?= $algorithm->name(); ?>',
					<?php if($algorithm->workerFunc() !== ''): ?>
						algorithm: <?= $algorithm->workerFunc(); ?>,
					<?php endif; ?>
				},
			<?php endforeach; ?>
        };
    }
    
    
    
    return {
        model: ditherAlgorithms,
    };
})(App.Threshold, App.OrderedDither, App.ErrorPropDither, App.ErrorPropColorDither);