<?php 
    require_once('inc'.DIRECTORY_SEPARATOR.'config.php');
    require_once(MODELS_PATH.'color-quantization-modes.php');
?>

/**
* Generated output from: <?= __FILE__."\n"; ?>
*/

import Popularity from '../../image_dithering_worker/optimize-palette/popularity.js';
import MedianCut from '../../image_dithering_worker/optimize-palette/median-cut.js';
import RgbQuant from '../../image_dithering_worker/optimize-palette/rgb-quant.js';
import Perceptual from '../../image_dithering_worker/optimize-palette/perceptual.js';
import Octree from '../../image_dithering_worker/optimize-palette/octree.js';
import KMeans from '../../image_dithering_worker/optimize-palette/k-means.js';
import Random from '../../image_dithering_worker/optimize-palette/random.js';
import ColorChannel from '../../image_dithering_worker/optimize-palette/color-channel.js';
import Uniform from '../../image_dithering_worker/optimize-palette/uniform.js';
import NeuQuant from '../../image_dithering_worker/optimize-palette/neu-quant.js';

export default [
    <?php foreach(colorQuantizationModesWorker() as $quantizationMode): ?>
        {
            <?php foreach($quantizationMode as $key => $value): ?>
                <?= $key; ?>: <?= encodeQuantizationValueForWorkerJs($key, $value); ?>,
                <?php endforeach; ?>
        },
    <?php endforeach; ?>
];