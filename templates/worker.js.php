<?php
    require_once('config'.DIRECTORY_SEPARATOR.'config.php');
    require_once(CONFIG_PATH.'js-files.php');
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