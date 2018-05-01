<?php
    require_once('inc'.DIRECTORY_SEPARATOR.'config.php');
    require_once(MODELS_PATH.'js-files.php');
    require_once(MODELS_PATH.'algorithm-model.php');
    require_once(MODELS_PATH.'color-quantization-modes.php');
?>
(function(){
    "use strict";
    var App = {};
    <?php 
        foreach (appJsFiles() as $filePath) {
            require($filePath);
        }
    ?>
})();