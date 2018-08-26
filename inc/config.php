<?php
    //find out if we are running from makefile, or directly through fastcgi
    if(!empty($argv)){
        define('IS_FASTCGI', false);
    }
    else{
        define('IS_FASTCGI', true);
    }

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
    define('MODELS_PATH', INC_PATH.'models'.DIRECTORY_SEPARATOR);
    
    //php templates paths
    define('TEMPLATES_PATH', ROOT_PATH.'templates'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_INDEX_PATH', TEMPLATES_PATH.'index'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_INDEX_PARTIALS_PATH', TEMPLATES_INDEX_PATH.'partials'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_VUE_COMPONENTS_PATH', TEMPLATES_INDEX_PATH.'vue_components'.DIRECTORY_SEPARATOR);
    define('TEMPLATES_GLOBAL_CONTROLS_TABS_PATH', TEMPLATES_VUE_COMPONENTS_PATH.'global-controls-tabs'.DIRECTORY_SEPARATOR);
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
    define('CSS_URL_BASE', BASE_URL.'styles/');
    define('JS_URL_BASE', BASE_URL.'js/');

    define('CSS_APP_URL', CSS_URL_BASE.'style.css');

    define('API_URL', BASE_URL.'api/');
    define('UNSPLASH_RANDOM_IMAGES_JSON', 'unsplash.json');
    define('UNSPLASH_API_URL', API_URL.UNSPLASH_RANDOM_IMAGES_JSON);
    define('UNSPLASH_DOWNLOAD_URL', API_URL.'unsplash-download.php');

    define('APP_SUPPORT_SITE_URL_BASE', '//dithermark.com/');
    define('APP_SUPPORT_SITE_FAQ_PAGE_URL', APP_SUPPORT_SITE_URL_BASE.'faq');

    if(IS_FASTCGI){
        define('JS_APP_URL', JS_URL_BASE.'app.php');
        define('JS_DITHER_WORKER_URL', JS_URL_BASE.'worker.php');
    }
    else{
        if(BUILD_MODE_RELEASE){
            define('JS_APP_URL', JS_URL_BASE.'app.min.js');
            define('JS_DITHER_WORKER_URL', JS_URL_BASE.'worker.min.js');
        }
        else{
            define('JS_APP_URL', JS_URL_BASE.'app.js');
            define('JS_DITHER_WORKER_URL', JS_URL_BASE.'worker.js');
        }
    }
    define('JS_BUNDLE_URL', JS_URL_BASE.'bundle.js');
    define('JS_VUE_URL', JS_URL_BASE.'vue.min.js');
    
    /*
    * JS application constants
    */
    define('APP_NAME', 'Dithermark');
    
    define('HISTOGRAM_HEIGHT', 96);
    //has to be multiple of 256, since there are 256 lightness values
    define('HISTOGRAM_BW_WIDTH', 1 * 256);
    //must be a multiple of 360, since there are 360 hues
    define('HISTOGRAM_COLOR_WIDTH', 1 * 360);
    
    //color dither stuff
    //needs to be here because webgl shaders also rely on this constant
    define('COLOR_DITHER_MAX_COLORS', 18);
    //this is used for yliluoma 1 dither for largest dimensions used
    //dimensions are 8 instead of 16, since at dimensions 16 it is very slow, while not being much different than 8
    define('YLILUOMA_1_ORDERED_MATRIX_MAX_LENGTH', 8*8);

    //for unsplash referral links
    define('UNSPLASH_REFERRAL_APP_NAME', 'dithermark');
    //for when downoading Unsplash image
    define('UNSPLASH_PHOTO_ID_QUERY_KEY', 'photo_id');

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