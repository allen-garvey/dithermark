<?php
/**
 * Used to follow Unsplash API guidelines for triggering a download
 * https://medium.com/unsplash/unsplash-api-guidelines-triggering-a-download-c39b24e99e02
 */

require_once(__DIR__ . '/../config.php');

function openJson(string $path): array{
    return json_decode(file_get_contents($path), true);
}

$unsplashJsonPath = __DIR__ . '/../../public_html/api/' . UNSPLASH_RANDOM_IMAGES_JSON;

?>
<?= '<?php'; ?>

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
    $unsplashImageData = <?= '[' . implode(', ', array_map(fn($item): string => "'".$item['download']."'", openJson($unsplashJsonPath))) . ']'; ?>;

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
