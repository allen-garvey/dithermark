<?php 
    require_once('inc'.DIRECTORY_SEPARATOR.'config.php');
    require_once(MODELS_PATH.'algorithm-model.php');
?>

/**
* Generated output: from <?= __FILE__."\n"; ?>
*/

import Threshold from '../../worker/dither/threshold.js';
import OrderedDither from '../../worker/dither/ordered.js';
import ErrorPropDither from '../../worker/dither/error-prop.js';
import ErrorPropColorDither from '../../worker/dither/error-prop-color.js';

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

export default {
    model: ditherAlgorithms,
};