<?php
/**
 * Used to follow Unsplash API guidelines for triggering a download
 * https://medium.com/unsplash/unsplash-api-guidelines-triggering-a-download-c39b24e99e02
 */

$photoIdKey = 'photo_id';

if(!isset($_REQUEST[$photoIdKey])){
    echo 'No photo_id given';
    die();
}

require_once('../../inc/config.php');
require_once(INC_PATH.'unsplash-api-secret.php');

function openJson(string $path): array{
    return json_decode(file_get_contents($path), true);
}

function isPhotoIdValid(int $photoId, array $imageData): bool{
    return $photoId >=0 && $photoId < count($imageData);
}
$photoId = $_REQUEST[$photoIdKey];

//make sure photoId is an integer
if(!filter_var($photoId, FILTER_VALIDATE_INT)){
    echo "Invalid $photoIdKey";
    die();
}
$photoId = (int) $photoId;
$unsplashImageData = openJson(UNSPLASH_RANDOM_IMAGES_JSON);

if(!isPhotoIdValid($photoId, $unsplashImageData)){
    echo "Invalid $photoIdKey";
    die();
}

$unsplashDownloadUrl = $unsplashImageData[$photoId]['download'].'?client_id='.UNSPLASH_ACCESS_KEY;

try{
    file_get_contents($unsplashDownloadUrl);
}
catch(Exception $ex){
    echo 'Problem contacting unsplash download url';
}


