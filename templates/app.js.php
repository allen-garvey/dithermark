<?php
    require_once('config'.DIRECTORY_SEPARATOR.'config.php');
    require_once(CONFIG_PATH.'js-files.php');
?>
(function(){
    var App = {};
    <?php 
        foreach (appJsFiles() as $filePath) {
            require($filePath);
        }
    ?>
})();