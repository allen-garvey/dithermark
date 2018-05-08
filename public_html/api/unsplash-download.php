<?php
/**
 * Used to follow Unsplash API guidelines for triggering a download
 * https://medium.com/unsplash/unsplash-api-guidelines-triggering-a-download-c39b24e99e02
 */


if(empty($_REQUEST['photo_id'])){
    echo 'No photo_id given';
    die();
}

function openJson(string $path): array{
    return json_decode(file_get_contents($path), true);
}

function isPhotoIdValid(string $photoId, array $imageData): bool{
    foreach($imageData as $image){
        if($image['id'] === $photoId){
            return true;
        }
    }

    return false;
}

require_once('../../inc/config.php');
$unsplashApiKeys = openJson(INC_PATH.'unsplash-api-secret.json');
$unsplashAccessKey = $unsplashApiKeys['accessKey'];
$photoId = $_REQUEST['photo_id'];
//to check to make sure $photoId is valid
$unsplashImageData = openJson(UNSPLASH_RANDOM_IMAGES_JSON);

if(!isPhotoIdValid($photoId, $unsplashImageData)){
    echo 'Invalid photo_id';
    die();
}

//format is: https://api.unsplash.com/photos/:image_id/download
$unsplashDownloadUrl = "https://api.unsplash.com/photos/$photoId/download?client_id=$unsplashAccessKey";

try{
    file_get_contents($unsplashDownloadUrl);
}
catch(Exception $ex){
    echo 'Problem contacting unsplash download url';
}


