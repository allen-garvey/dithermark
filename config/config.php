<?php
    /*
    * File path constants
    */
    define('ROOT_PATH', dirname(__FILE__, 2).DIRECTORY_SEPARATOR);
    define('CONFIG_PATH', ROOT_PATH.'config'.DIRECTORY_SEPARATOR);
    
    //php templates paths
    define('TEMPLATES_PATH', ROOT_PATH.'templates'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_INDEX_PATH', TEMPLATES_PATH.'index'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_VUE_COMPONENTS_PATH', TEMPLATES_INDEX_PATH.'vue_components'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_TABS_PATH', TEMPLATES_VUE_COMPONENTS_PATH.'tabs'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_WEBGL_SHADERS_PATH', TEMPLATES_INDEX_PATH.'webgl_shaders'.DIRECTORY_SEPARATOR);
    
    //js source file paths
    define('JS_SRC_PATH', ROOT_PATH.'js_src'.DIRECTORY_SEPARATOR);
    define('JS_APP_PATH', JS_SRC_PATH.'app'.DIRECTORY_SEPARATOR);
    define('JS_VUES_PATH', JS_APP_PATH.'vues'.DIRECTORY_SEPARATOR);
    define('JS_SHARED_PATH', JS_SRC_PATH.'shared'.DIRECTORY_SEPARATOR);
    define('JS_WORKER_PATH', JS_SRC_PATH.'image_dithering_worker'.DIRECTORY_SEPARATOR);
    
    /*
    * JS application constants
    */
    define('MAX_WEBWORKERS', 8);
    define('RANDOM_IMAGE_MAX_WIDTH', 800);
    define('RANDOM_IMAGE_MAX_HEIGHT', 600);
    
    define('HISTOGRAM_HEIGHT', 96);
    //histogram widths cannot be safely changed without also changing the generation code as well
    define('HISTOGRAM_BW_WIDTH', 256);
    define('HISTOGRAM_COLOR_WIDTH', 360);
    
    //color dither stuff
    define('COLOR_DITHER_MAX_COLORS', 12);