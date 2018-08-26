<?php 
    require_once('inc'.DIRECTORY_SEPARATOR.'config.php');
    require_once(MODELS_PATH.'color-quantization-modes.php');
?>

/**
* Generated output from: <?= __FILE__."\n"; ?>
*/

export default {
    modes: <?= json_encode(colorQuantizationModesApp()); ?>,
    groups: <?= json_encode(colorQuantizationGroups()); ?>,
};