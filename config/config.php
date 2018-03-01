<?php
    /*
    * File path constants
    */
    define('ROOT_PATH', dirname(__FILE__, 2).DIRECTORY_SEPARATOR);
    define('CONFIG_PATH', ROOT_PATH.DIRECTORY_SEPARATOR.'config'.DIRECTORY_SEPARATOR);
    
    //php templates paths
    define('TEMPLATES_PATH', ROOT_PATH.'templates'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_INDEX_PATH', TEMPLATES_PATH.DIRECTORY_SEPARATOR.'index'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_VUE_COMPONENTS_PATH', TEMPLATES_INDEX_PATH.DIRECTORY_SEPARATOR.'vue_components'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_WEBGL_SHADERS_PATH', TEMPLATES_INDEX_PATH.DIRECTORY_SEPARATOR.'webgl_shaders'.DIRECTORY_SEPARATOR);
    
    //js source file paths
    define('JS_SRC_PATH', ROOT_PATH.DIRECTORY_SEPARATOR.'js_src'.DIRECTORY_SEPARATOR);
    define('JS_VUES_PATH', JS_SRC_PATH.DIRECTORY_SEPARATOR.'vues'.DIRECTORY_SEPARATOR);
    define('JS_WORKER_PATH', JS_SRC_PATH.DIRECTORY_SEPARATOR.'image_dithering_worker'.DIRECTORY_SEPARATOR);
    
    /*
    * JS application constants
    */
    define('MAX_WEBWORKERS', 8);
    define('RANDOM_IMAGE_MAX_WIDTH', 800);
    define('RANDOM_IMAGE_MAX_HEIGHT', 600);
    
    //color dither stuff
    define('COLOR_DITHER_MAX_COLORS', 12);