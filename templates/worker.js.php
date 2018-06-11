<?php
    if(!IS_FASTCGI){
        require_once('inc'.DIRECTORY_SEPARATOR.'config.php');
    }
    require_once(MODELS_PATH.'js-files.php');
    require_once(MODELS_PATH.'algorithm-model.php');
    require_once(MODELS_PATH.'color-quantization-modes.php');
?>
(function(){
    "use strict";
    var App = {};
    <?php 
        foreach (workerJsFiles() as $filePath) {
            require($filePath);
        }
    ?>
})();