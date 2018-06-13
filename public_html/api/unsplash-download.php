<?php
/**
 * Used to follow Unsplash API guidelines for triggering a download
 * https://medium.com/unsplash/unsplash-api-guidelines-triggering-a-download-c39b24e99e02
 */

require_once('../../inc/config.php');

if(!isset($_REQUEST[UNSPLASH_PHOTO_ID_QUERY_KEY])){
    http_response_code(400);
    if(!BUILD_MODE_RELEASE){
        echo 'No '.UNSPLASH_PHOTO_ID_QUERY_KEY.' given';
    }
    die();
}

require_once(INC_PATH.'unsplash-api-secret.php');

function openJson(string $path): array{
    return json_decode(file_get_contents($path), true);
}

function isPhotoIdValid(int $photoId, array $imageData): bool{
    return $photoId >=0 && $photoId < count($imageData);
}
$photoId = $_REQUEST[UNSPLASH_PHOTO_ID_QUERY_KEY];

//make sure photoId is an integer
if(!filter_var($photoId, FILTER_VALIDATE_INT)){
    http_response_code(400);
    if(!BUILD_MODE_RELEASE){
        echo 'Invalid '.UNSPLASH_PHOTO_ID_QUERY_KEY;
    }
    die();
}
$photoId = (int) $photoId;
$unsplashImageData = openJson(UNSPLASH_RANDOM_IMAGES_JSON);

if(!isPhotoIdValid($photoId, $unsplashImageData)){
    http_response_code(400);
    if(!BUILD_MODE_RELEASE){
        echo 'Invalid '.UNSPLASH_PHOTO_ID_QUERY_KEY;
    }
    die();
}

$unsplashDownloadUrl = $unsplashImageData[$photoId]['download'].'?client_id='.UNSPLASH_ACCESS_KEY;

try{
    $response = file_get_contents($unsplashDownloadUrl);
    if(!BUILD_MODE_RELEASE){
        header('Content-Type: application/json');
        echo $response;
    }
}
catch(Exception $ex){
    http_response_code(500);
    if(!BUILD_MODE_RELEASE){
        echo 'Problem contacting unsplash download url';
    }
}


