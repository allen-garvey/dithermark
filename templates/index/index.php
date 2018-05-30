<?php
    require_once('inc'.DIRECTORY_SEPARATOR.'config.php');
    require_once(MODELS_PATH.'js-files.php');
    require_once(VIEWS_PATH.'index-view.php');
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
        <header class="header">
            <nav class="nav">
                <h1 class="brand"><?= APP_NAME; ?></h1>
                <ul>
                    <li><a href="<?= APP_SUPPORT_SITE_FAQ_PAGE_URL; ?>">FAQ</a></li>
                    <li><a href="<?= GITHUB_SOURCE_URL; ?>">Source</a></li>
                </ul>
            </nav>
        </header>
        <main>
            <noscript><?= APP_NAME; ?> requires JavaScript to run. Please enable JavaScript in your browser settings and reload this page.</noscript>
            <div id="app">
                <dither-studio/>
            </div>
        </main>
        <?php foreach(vueComponentsWithTemplates() as $componentName): ?>
            <script type="vue/template" id="<?= $componentName; ?>">
                <?php require(TEMPLATES_VUE_COMPONENTS_PATH."${componentName}.php"); ?>
            </script>
        <?php endforeach; ?>
        <?php require(TEMPLATES_WEBGL_SHADERS_PATH.'vertex-shaders.php'); ?>
        <?php require(TEMPLATES_WEBGL_SHADERS_PATH.'hsl-functions.php'); ?>
        <?php require(TEMPLATES_WEBGL_SHADERS_PATH.'arithmetic-dither-functions.php'); ?>
        <?php require(TEMPLATES_WEBGL_SHADERS_PATH.'pixel-distance-functions.php'); ?>
        <?php require(TEMPLATES_WEBGL_SHADERS_PATH.'fragment-shaders-shared-dither.php'); ?>
        <?php require(TEMPLATES_WEBGL_SHADERS_PATH.'fragment-shaders-bw-dither.php'); ?>
        <?php require(TEMPLATES_WEBGL_SHADERS_PATH.'fragment-shaders-color-dither.php'); ?>
        <?php require(TEMPLATES_WEBGL_SHADERS_PATH.'fragment-shaders-bilateral-filter.php'); ?>
        <?php require(TEMPLATES_WEBGL_SHADERS_PATH.'fragment-shaders-smoothing.php'); ?>
        <?php require(TEMPLATES_WEBGL_SHADERS_PATH.'fragment-shaders-canvas-filters.php'); ?>
        <?php require(TEMPLATES_WEBGL_SHADERS_PATH.'fragment-shaders-yliluoma1.php'); ?>
        <?php require(TEMPLATES_WEBGL_SHADERS_PATH.'fragment-shaders-yliluoma2.php'); ?>
        <script type="text/javascript" src="<?= JS_VUE_URL; ?>"></script>
        <script type="text/javascript" src="<?= JS_APP_URL; ?>"></script>
    </body>
</html>