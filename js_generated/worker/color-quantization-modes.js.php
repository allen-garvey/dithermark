<?php 
    require_once('inc'.DIRECTORY_SEPARATOR.'config.php');
    require_once(MODELS_PATH.'color-quantization-modes.php');
?>

/**
* Generated output from: <?= __FILE__."\n"; ?>
*/

import Popularity from '../../worker/optimize-palette/popularity.js';
import MedianCut from '../../worker/optimize-palette/median-cut.js';
import RgbQuant from '../../worker/optimize-palette/rgb-quant.js';
import Perceptual from '../../worker/optimize-palette/perceptual.js';
import Octree from '../../worker/optimize-palette/octree.js';
import KMeans from '../../worker/optimize-palette/k-means.js';
import Random from '../../worker/optimize-palette/random.js';
import ColorChannel from '../../worker/optimize-palette/color-channel.js';
import Uniform from '../../worker/optimize-palette/uniform.js';
import NeuQuant from '../../worker/optimize-palette/neu-quant.js';

export default [
    <?php foreach(colorQuantizationModesWorker() as $quantizationMode): ?>
        {
            <?php foreach($quantizationMode as $key => $value): ?>
                <?= $key; ?>: <?= encodeQuantizationValueForWorkerJs($key, $value); ?>,
                <?php endforeach; ?>
        },
    <?php endforeach; ?>
];