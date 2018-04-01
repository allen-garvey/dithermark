
App.Algorithms = (function(Threshold, OrderedDither, ErrorPropDither){
    function ditherAlgorithms(){
        return {
			<?php foreach(bwAlgorithmModel() as $algorithm): ?>
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
})(App.Threshold, App.OrderedDither, App.ErrorPropDither);