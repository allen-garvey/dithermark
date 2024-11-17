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
    
    //php templates paths
    define('TEMPLATES_PATH', ROOT_PATH.'templates'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_INDEX_PATH', TEMPLATES_PATH.'index'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_INDEX_PARTIALS_PATH', TEMPLATES_INDEX_PATH.'partials'.DIRECTORY_SEPARATOR);
    //webgl shaders
    define('TEMPLATES_WEBGL_SHADERS_PATH', TEMPLATES_INDEX_PATH.'webgl_shaders'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_WEBGL_VERTEX_SHADERS_PATH', TEMPLATES_INDEX_PATH.'webgl_shaders'.DIRECTORY_SEPARATOR.'vertex'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_WEBGL_FRAGMENT_SHADERS_PATH', TEMPLATES_INDEX_PATH.'webgl_shaders'.DIRECTORY_SEPARATOR.'fragment'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_WEBGL_SHARED_FRAGMENT_SHADERS_PATH', TEMPLATES_INDEX_PATH.'webgl_shaders'.DIRECTORY_SEPARATOR.'fragment'.DIRECTORY_SEPARATOR.'shared'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_WEBGL_DITHER_FRAGMENT_SHADERS_PATH', TEMPLATES_INDEX_PATH.'webgl_shaders'.DIRECTORY_SEPARATOR.'fragment'.DIRECTORY_SEPARATOR.'dithers'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_WEBGL_FILTER_FRAGMENT_SHADERS_PATH', TEMPLATES_INDEX_PATH.'webgl_shaders'.DIRECTORY_SEPARATOR.'fragment'.DIRECTORY_SEPARATOR.'filters'.DIRECTORY_SEPARATOR);
    
    //js source file paths
    define('JS_SRC_PATH', ROOT_PATH.'js_src'.DIRECTORY_SEPARATOR);
    define('JS_APP_PATH', JS_SRC_PATH.'app'.DIRECTORY_SEPARATOR);
    define('JS_VUES_PATH', JS_APP_PATH.'vues'.DIRECTORY_SEPARATOR);
    define('JS_SHARED_PATH', JS_SRC_PATH.'shared'.DIRECTORY_SEPARATOR);
    define('JS_WORKER_PATH', JS_SRC_PATH.'image_dithering_worker'.DIRECTORY_SEPARATOR);

    /**
     * URLs
     * */
    define('GITHUB_SOURCE_URL', 'https://github.com/allen-garvey/dithermark');
    define('BASE_URL', '/');
    define('CSS_URL_BASE', BASE_URL.'assets/');
    define('JS_URL_BASE', BASE_URL.'assets/');

    define('CSS_APP_URL', CSS_URL_BASE.'style.css');

    define('APP_SUPPORT_SITE_FAQ_PAGE_URL', 'https://www.dithermark.com/faq');


    if(BUILD_MODE_RELEASE){
        define('JS_BUNDLE_URL', JS_URL_BASE.'bundle.min.js');
    }
    else{
        define('JS_BUNDLE_URL', JS_URL_BASE.'bundle.js');
    }
    
    /*
    * JS application constants
    */
    define('APP_NAME', 'Dithermark');
    
    //color dither stuff
    //needs to be here because webgl shaders also rely on this constant
    define('COLOR_DITHER_MAX_COLORS', 18);
    //this is used for yliluoma 1 dither for largest dimensions used
    //dimensions are 8 instead of 16, since at dimensions 16 it is very slow, while not being much different than 8
    define('YLILUOMA_1_ORDERED_MATRIX_MAX_LENGTH', 8*8);

    if(BUILD_MODE_RELEASE){
        define('ENABLE_TEXTURE_COMBINE', false);
    }
    else{
        //used in bw dither to combine the outputs of 3 separate dithers into 1 result image
        //while interesting, not as cool as hoped, and adds user complexity, so it is not included
        //in the release
        define('ENABLE_TEXTURE_COMBINE', true);
    }