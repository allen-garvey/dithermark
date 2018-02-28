<?php
    require_once('config'.DIRECTORY_SEPARATOR.'config.php');
    require_once(CONFIG_PATH.'js-files.php');
    
    
    foreach (workerJsFiles() as $filePath) {
        require($filePath);
    }