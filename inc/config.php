<?php
    //get build mode from command-line arguments
    if(!empty($argv) && count($argv) > 1 && $argv[1] === 'release'){
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
    define('VIEWS_PATH', INC_PATH.'views'.DIRECTORY_SEPARATOR);
    define('MODELS_PATH', INC_PATH.'models'.DIRECTORY_SEPARATOR);
    
    //php templates paths
    define('TEMPLATES_PATH', ROOT_PATH.'templates'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_INDEX_PATH', TEMPLATES_PATH.'index'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_INDEX_PARTIALS_PATH', TEMPLATES_INDEX_PATH.'partials'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_VUE_COMPONENTS_PATH', TEMPLATES_INDEX_PATH.'vue_components'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_GLOBAL_CONTROLS_TABS_PATH', TEMPLATES_VUE_COMPONENTS_PATH.'global-controls-tabs'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_WEBGL_SHADERS_PATH', TEMPLATES_INDEX_PATH.'webgl_shaders'.DIRECTORY_SEPARATOR);
    
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
    define('CSS_URL_BASE', BASE_URL.'styles/');
    define('JS_URL_BASE', BASE_URL.'js/');

    define('CSS_APP_URL', CSS_URL_BASE.'style.css');

    define('API_URL', BASE_URL.'api/');
    define('UNSPLASH_RANDOM_IMAGES_JSON', 'unsplash.json');
    define('UNSPLASH_API_URL', API_URL.UNSPLASH_RANDOM_IMAGES_JSON);
    define('UNSPLASH_DOWNLOAD_URL', API_URL.'unsplash-download.php');

    if(BUILD_MODE_RELEASE){
        define('JS_APP_URL', JS_URL_BASE.'app.min.js');
        define('JS_DITHER_WORKER_URL', JS_URL_BASE.'dither-worker.min.js');
    }
    else{
        define('JS_APP_URL', JS_URL_BASE.'app.js');
        define('JS_DITHER_WORKER_URL', JS_URL_BASE.'dither-worker.js');
    }
    define('JS_VUE_URL', JS_URL_BASE.'vue.min.js');
    
    /*
    * JS application constants
    */
    define('APP_NAME', 'Dithermark');
    define('MAX_WEBWORKERS', 8);
    
    define('HISTOGRAM_HEIGHT', 96);
    //has to be multiple of 256, since there are 256 lightness values
    define('HISTOGRAM_BW_WIDTH', 1 * 256);
    //must be a multiple of 360, since there are 360 hues
    define('HISTOGRAM_COLOR_WIDTH', 1 * 360);
    
    //color dither stuff
    //needs to be here because webgl shaders also rely on this constant
    define('COLOR_DITHER_MAX_COLORS', 12);

    if(BUILD_MODE_RELEASE){
        define('ENABLE_PRINT_COLOR_PALETTE_BUTTON', false);
        define('ENABLE_TIMER_LOGGING', false);
        define('ENABLE_TEXTURE_COMBINE', false);
    }
    else{
        //whether or not print color palette button is shown
        //(useful for when creating new color palettes)
        define('ENABLE_PRINT_COLOR_PALETTE_BUTTON', true);
        //used for performance logging for dither and optimize palette
        define('ENABLE_TIMER_LOGGING', true);
        //used in bw dither to combine the outputs of 3 separate dithers into 1 result image
        //while interesting, not as cool as hoped, and adds user complexity, so it is not included
        //in the release
        define('ENABLE_TEXTURE_COMBINE', true);
    }