<?php
    
    function sharedJsFiles(): array{
        return [
            JS_SHARED_PATH.'constants.js',
            JS_SHARED_PATH.'polyfills.js',
            JS_SHARED_PATH.'worker-headers.js',
            JS_SHARED_PATH.'color-dither-modes.js',
            JS_SHARED_PATH.'timer.js',
            JS_SHARED_PATH.'pixel.js',
            JS_SHARED_PATH.'bayer-matrix.js',
        ];
    }
    
    function appJsFiles(): array{
        return array_merge(sharedJsFiles(), [
            JS_APP_PATH.'fs.js',
            JS_APP_PATH.'worker-util.js',
            JS_APP_PATH.'color-picker.js',
            JS_APP_PATH.'canvas.js',
            JS_APP_PATH.'bayer-webgl.js',
            JS_APP_PATH.'webgl-m4.js',
            JS_APP_PATH.'webgl.js',
            JS_APP_PATH.'webgl-bw-dither.js',
            JS_APP_PATH.'webgl-color-dither.js',
            JS_APP_PATH.'histogram.js',
            JS_APP_PATH.'algorithm-model.js',
            JS_VUES_PATH.'bw-dither-component.js',
            JS_VUES_PATH.'color-dither-component.js',
            JS_VUES_PATH.'dither-studio-component.js',
            JS_VUES_PATH.'app.js'
        ]);
    }
    
    
    function workerJsFiles(): array{
        return array_merge(sharedJsFiles(), [
            JS_WORKER_PATH.'pixel-math.js',
            JS_WORKER_PATH.'image.js',
            JS_WORKER_PATH.'threshold.js',
            JS_WORKER_PATH.'error-prop-dither.js',
            JS_WORKER_PATH.'ordered-dither.js',
            JS_WORKER_PATH.'algorithm-model.js',
            JS_WORKER_PATH.'worker-util.js',
            JS_WORKER_PATH.'histogram.js',
            JS_WORKER_PATH.'main.js'
        ]);
    }