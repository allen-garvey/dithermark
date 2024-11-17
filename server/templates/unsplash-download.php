<?php
function main($args) {
    $photoIdQueryParamName = '<?= UNSPLASH_PHOTO_ID_QUERY_KEY ?>';
    if(!isset($args[$photoIdQueryParamName])){
        return [
            'statusCode' => 400,
            'body' => ['errors' => 'No '.$photoIdQueryParamName.' given']
        ];
    }
    $photoId = $args[$photoIdQueryParamName];

    //make sure photoId is an integer
    if(!filter_var($photoId, FILTER_VALIDATE_INT)){
        return [
            'statusCode' => 400,
            'body' => ['errors' => 'Invalid input argument']
        ];
    }

    $photoId = (int) $photoId;
    $unsplashImageData = <?= unsplashRandomImageData; ?>;

    if($photoId < 0 || $photoId >= count($unsplashImageData)){
        return [
            'statusCode' => 400,
            'body' => ['errors' => 'Invalid input argument']
        ];
    }

    $unsplashDownloadUrl = $unsplashImageData[$photoId].'?client_id='.getenv('UNSPLASH_ACCESS_KEY');

    try{
        $response = file_get_contents($unsplashDownloadUrl);
    }
    catch(Exception $ex){
        return [
            'statusCode' => 500,
            'body' => ['errors' => 'Problem contacting unsplash download url']
        ];
    }

    return [
        'body' => ['data' => true]
    ];
}
