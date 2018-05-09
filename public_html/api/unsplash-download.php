<?php
/**
 * Used to follow Unsplash API guidelines for triggering a download
 * https://medium.com/unsplash/unsplash-api-guidelines-triggering-a-download-c39b24e99e02
 */


if(!isset($_REQUEST['photo_id'])){
    echo 'No photo_id given';
    die();
}

function openJson(string $path): array{
    return json_decode(file_get_contents($path), true);
}

function isPhotoIdValid(int $photoId, array $imageData): bool{
    return $photoId >=0 && $photoId < count($imageData);
}

require_once('../../inc/config.php');
$unsplashApiKeys = openJson(INC_PATH.'unsplash-api-secret.json');
$unsplashAccessKey = $unsplashApiKeys['accessKey'];
$photoId = $_REQUEST['photo_id'];

//make sure photoId is an integer
if(!filter_var($photoId, FILTER_VALIDATE_INT)){
    echo 'Invalid photo_id';
    die();
}
$photoId = (int) $photoId;
$unsplashImageData = openJson(UNSPLASH_RANDOM_IMAGES_JSON);

if(!isPhotoIdValid($photoId, $unsplashImageData)){
    echo 'Invalid photo_id';
    die();
}

$unsplashDownloadUrl = $unsplashImageData[$photoId]['download']."?client_id=$unsplashAccessKey";

try{
    file_get_contents($unsplashDownloadUrl);
}
catch(Exception $ex){
    echo 'Problem contacting unsplash download url';
}


