<?php 
    require_once('inc'.DIRECTORY_SEPARATOR.'config.php');
    require_once(MODELS_PATH.'algorithm-model.php');
?>

/**
* Generated output: from <?= __FILE__."\n"; ?>
*/

import Threshold from '../../image_dithering_worker/threshold.js';
import OrderedDither from '../../image_dithering_worker/ordered-dither.js';
import ErrorPropDither from '../../image_dithering_worker/error-prop-dither.js';
import ErrorPropColorDither from '../../image_dithering_worker/error-prop-color-dither.js';

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