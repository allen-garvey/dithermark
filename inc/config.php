<?php
    //find out if we are running from makefile, or directly through fastcgi
    if(!empty($argv)){
        define('IS_FASTCGI', false);
    }
    else{
        define('IS_FASTCGI', true);
    }

    //get build mode from command-line arguments
    if(!IS_FASTCGI && !empty($argv) && count($argv) > 1 && $argv[1] === 'release'){
        define('BUILD_MODE_RELEASE', true);
    }
    else{
        define('BUILD_MODE_RELEASE', false);
    }

    /*
    * File path constants
    */
    define('ROOT_PATH', dirname(__FILE__, 2).DIRECTORY_SEPARATOR);
    define('INC_PATH', ROOT_PATH.'inc'.DIRECTORY_SEPARATOR);
    define('MODELS_PATH', INC_PATH.'models'.DIRECTORY_SEPARATOR);
    
    //js source file paths
    define('JS_SRC_PATH', ROOT_PATH.'js_src'.DIRECTORY_SEPARATOR);
    define('JS_APP_PATH', JS_SRC_PATH.'app'.DIRECTORY_SEPARATOR);
    define('JS_VUES_PATH', JS_APP_PATH.'vues'.DIRECTORY_SEPARATOR);
    define('JS_SHARED_PATH', JS_SRC_PATH.'shared'.DIRECTORY_SEPARATOR);
    define('JS_WORKER_PATH', JS_SRC_PATH.'image_dithering_worker'.DIRECTORY_SEPARATOR);

    /**
     * URLs
     * */
    define('BASE_URL', '/');
    define('JS_URL_BASE', BASE_URL.'assets/');

    if(BUILD_MODE_RELEASE){
        define('JS_BUNDLE_URL', JS_URL_BASE.'bundle.min.js');
    }
    else{
        define('JS_BUNDLE_URL', JS_URL_BASE.'bundle.js');
    }