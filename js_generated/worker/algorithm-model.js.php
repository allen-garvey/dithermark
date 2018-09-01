<?php 
    require_once('inc'.DIRECTORY_SEPARATOR.'config.php');
    require_once(MODELS_PATH.'algorithm-model.php');
?>

/**
* Generated output: from <?= __FILE__."\n"; ?>
*/

import Threshold from '../../worker/threshold.js';
import OrderedDither from '../../worker/ordered-dither.js';
import ErrorPropDither from '../../worker/error-prop-dither.js';
import ErrorPropColorDither from '../../worker/error-prop-color-dither.js';

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