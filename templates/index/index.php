<?php
    require_once('config'.DIRECTORY_SEPARATOR.'config.php');
?>

<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8"/>
        <title>Dithermark</title>
        <meta name="description" content=""/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="stylesheet" type="text/css" href="/styles/style.css"/>
        <!-- Place favicon.ico and apple-touch-icon.png in the root directory -->
    </head>
    <body>
        <header class="header">
            <div>
                <h1 class="brand">Dithermark</h1>
            </div>
        </header>
        <main>
            <div id="app">
                <dither-studio/>
            </div>
        </main>
        <script type="vue/template" id="dither-studio-component">
            <?php require(TEMPLATES_VUE_COMPONENTS_PATH.'dither-studio-component.php'); ?>
        </script>
        <script type="vue/template" id="bw-dither-component">
            <?php require(TEMPLATES_VUE_COMPONENTS_PATH.'bw-dither-component.php'); ?>
        </script>
        <script type="vue/template" id="color-dither-component">
            <?php require(TEMPLATES_VUE_COMPONENTS_PATH.'color-dither-component.php'); ?>
        </script>
        <?php require(TEMPLATES_WEBGL_SHADERS_PATH.'webgl-shaders.php') ?>
        <script type="text/javascript" src="/js/vue.min.js"></script>
        <script type="text/javascript" src="/js/app.js"></script>
    </body>
</html>