<?php 
    require_once('inc'.DIRECTORY_SEPARATOR.'config.php');
?>
/**
* Generated output from: <?= __FILE__."\n"; ?>
*/

export default {
    appName: '<?= APP_NAME; ?>',
    colorDitherMaxColors: <?= COLOR_DITHER_MAX_COLORS; ?>,
    histogramHeight: <?= HISTOGRAM_HEIGHT; ?>,
    histogramBwWidth: <?= HISTOGRAM_BW_WIDTH; ?>,
    histogramColorWidth: <?= HISTOGRAM_COLOR_WIDTH; ?>,
    unsplashReferralAppName: '<?= UNSPLASH_REFERRAL_APP_NAME; ?>',
    unsplashApiUrl: '<?= UNSPLASH_API_URL; ?>',
    unsplashApiPhotoIdQueryKey: '<?= UNSPLASH_PHOTO_ID_QUERY_KEY; ?>',
    unsplashDownloadUrl: '<?= UNSPLASH_DOWNLOAD_URL; ?>',
};