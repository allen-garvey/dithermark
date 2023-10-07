<?php
    if(!defined('IS_FASTCGI') || !IS_FASTCGI){
        require_once('inc'.DIRECTORY_SEPARATOR.'config.php');
    }
?>

<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8"/>
        <title><?= APP_NAME; ?></title>
        <meta name="description" content="An interactive, in-browser exploration of image dithering and color quantization algorithms"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="stylesheet" type="text/css" href="<?= CSS_APP_URL; ?>"/>
        <link rel="apple-touch-icon" href="<?= BASE_URL.'apple-touch-icon.png' ?>"/>
    </head>
    <body>
        <?php //this extra .total-page div is unfortunately required for FireFox full screen mode to allow scrolling, instead of just cutting content off ?>
        <div class="total-page">
            <header class="header">
                <nav class="nav">
                    <h1 class="brand"><?= APP_NAME; ?></h1>
                    <ul>
                        <li>
                            <a href="<?= APP_SUPPORT_SITE_FAQ_PAGE_URL; ?>" target="_blank">FAQ</a>
                        </li>
                        <li>
                            <a href="<?= GITHUB_SOURCE_URL; ?>" target="_blank">Source</a>
                        </li>
                    </ul>
                </nav>
            </header>
            <main>
                <noscript><?= APP_NAME; ?> requires JavaScript to run. Please enable JavaScript in your browser settings and reload this page.</noscript>
                <div id="app"></div>
            </main>
        </div>
        <?php //vertex shaders ?>
        <?php require(TEMPLATES_WEBGL_VERTEX_SHADERS_PATH.'vertex-shaders.php'); ?>
        <?php //shared fragment shaders ?>
        <?php require(TEMPLATES_WEBGL_SHARED_FRAGMENT_SHADERS_PATH.'hsl-functions.php'); ?>
        <?php require(TEMPLATES_WEBGL_SHARED_FRAGMENT_SHADERS_PATH.'pixel-distance-functions.php'); ?>
        <?php require(TEMPLATES_WEBGL_SHARED_FRAGMENT_SHADERS_PATH.'transparency-check.php'); ?>
        <?php //dither fragment shaders ?>
        <?php require(TEMPLATES_WEBGL_DITHER_FRAGMENT_SHADERS_PATH.'shared-dither.php'); ?>
        <?php require(TEMPLATES_WEBGL_DITHER_FRAGMENT_SHADERS_PATH.'arithmetic-dither-functions.php'); ?>
        <?php require(TEMPLATES_WEBGL_DITHER_FRAGMENT_SHADERS_PATH.'bw-dither.php'); ?>
        <?php require(TEMPLATES_WEBGL_DITHER_FRAGMENT_SHADERS_PATH.'color-dither.php'); ?>
        <?php require(TEMPLATES_WEBGL_DITHER_FRAGMENT_SHADERS_PATH.'yliluoma1.php'); ?>
        <?php require(TEMPLATES_WEBGL_DITHER_FRAGMENT_SHADERS_PATH.'yliluoma2.php'); ?>
        <?php require(TEMPLATES_WEBGL_DITHER_FRAGMENT_SHADERS_PATH.'stark-ordered-color-dither.php'); ?>
        <?php //image filter fragment shaders shaders ?>
        <?php require(TEMPLATES_WEBGL_FILTER_FRAGMENT_SHADERS_PATH.'bilateral-filter.php'); ?>
        <?php require(TEMPLATES_WEBGL_FILTER_FRAGMENT_SHADERS_PATH.'smoothing.php'); ?>
        <?php require(TEMPLATES_WEBGL_FILTER_FRAGMENT_SHADERS_PATH.'canvas-filters.php'); ?>
        <?php require(TEMPLATES_WEBGL_FILTER_FRAGMENT_SHADERS_PATH.'contour-filters.php'); ?>
        <?php require(TEMPLATES_WEBGL_FILTER_FRAGMENT_SHADERS_PATH.'edge-filters.php'); ?>
        <script type="text/javascript" src="<?= JS_BUNDLE_URL; ?>"></script>
    </body>
</html>