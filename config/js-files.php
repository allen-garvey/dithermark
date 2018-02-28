<?php
    
    function sharedJsFiles(): array{
        return [
            JS_SRC_PATH.'polyfills.js',
            JS_SRC_PATH.'worker-headers.js',
            JS_SRC_PATH.'color-dither-modes.js',
            JS_SRC_PATH.'timer.js',
            JS_SRC_PATH.'pixel.js',
            JS_SRC_PATH.'bayer-matrix.js',
        ];
    }
    
    function appJsFiles(): array{
        return array_merge(sharedJsFiles(), [
            JS_SRC_PATH.'fs.js',
            JS_SRC_PATH.'worker-util.js',
            JS_SRC_PATH.'color-picker.js',
            JS_SRC_PATH.'canvas.js',
            JS_SRC_PATH.'bayer-webgl.js',
            JS_SRC_PATH.'webgl-m4.js',
            JS_SRC_PATH.'webgl.js',
            JS_SRC_PATH.'webgl-bw-dither.js',
            JS_SRC_PATH.'webgl-color-dither.js',
            JS_SRC_PATH.'histogram.js',
            JS_SRC_PATH.'algorithm-model.js',
            JS_VUES_PATH.'bw-dither-component.js',
            JS_VUES_PATH.'color-dither-component.js',
            JS_VUES_PATH.'dither-studio-component.js',
            JS_VUES_PATH.'app.js'
        ]);
    }
    
    
    function workerJsFiles(): array{
        return array_merge(sharedJsFiles(), [
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