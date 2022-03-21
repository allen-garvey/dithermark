<?php 
    require_once('inc'.DIRECTORY_SEPARATOR.'config.php');
    require_once(MODELS_PATH.'algorithm-model.php');
?>

/**
* Generated output: from <?= __FILE__."\n"; ?>
*/

import BwDither from '../../app/webgl-bw-dither.js';
import ColorDither from '../../app/webgl-color-dither.js';

const bwDitherGroups = <?= bwAlgoGroups(); ?>;

const bwDitherAlgorithms = [
    <?php printAppAlgoModel(bwAlgorithmModel()); ?>
];
const colorDitherGroups = <?= colorAlgoGroups(); ?>;
        
const colorDitherAlgorithms = [
    <?php printAppAlgoModel(colorAlgorithmModel()); ?>
];

export default {
    bwDitherGroups,
    bwDitherAlgorithms,
    colorDitherGroups,
    colorDitherAlgorithms,
};