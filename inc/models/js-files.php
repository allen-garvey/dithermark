<?php
    
    function sharedJsFiles(): array{
        $timerSource = JS_SHARED_PATH.'timer-dummy.js';
        if(ENABLE_TIMER_LOGGING){
            $timerSource = JS_SHARED_PATH.'timer.js';
        }
        return [
            JS_SHARED_PATH.'constants.js',
            JS_SHARED_PATH.'polyfills.js',
            JS_SHARED_PATH.'array-util.js',
            JS_SHARED_PATH.'worker-headers.js',
            JS_SHARED_PATH.'color-dither-modes.js',
            $timerSource,
            JS_SHARED_PATH.'pixel.js',
            JS_SHARED_PATH.'bayer-matrix.js',
        ];
    }
    
    function appVueComponents(): array{
        $ret = [];
        $ret[] = JS_VUES_PATH.'vue-mixins.js';
        if(ENABLE_PRINT_COLOR_PALETTE_BUTTON){
            $ret[] = JS_VUES_PATH.'print-palette-component.js';
        }
        if(ENABLE_TEXTURE_COMBINE){
            $ret[] = JS_VUES_PATH.'texture-combine-component.js';
        }
        $ret[] = JS_VUES_PATH.'modal-prompt-component.js';
        $ret[] = JS_VUES_PATH.'bw-dither-component.js';
        $ret[] = JS_VUES_PATH.'color-dither-component.js';
        $ret[] = JS_VUES_PATH.'dither-studio-component.js';
        $ret[] = JS_VUES_PATH.'app.js';

        return $ret;
    }

    function appJsFiles(): array{
        return array_merge(sharedJsFiles(), [
            JS_APP_PATH.'color-quantization-modes.js',
            JS_APP_PATH.'user-settings.js',
            JS_APP_PATH.'editor-themes.js',
            JS_APP_PATH.'fs.js',
            JS_APP_PATH.'color-picker.js',
            JS_APP_PATH.'color-palettes.js',
            JS_APP_PATH.'worker-util.js',
            JS_APP_PATH.'canvas.js',
            JS_APP_PATH.'bayer-webgl.js',
            JS_APP_PATH.'webgl-util.js',
            JS_APP_PATH.'webgl-m4.js',
            JS_APP_PATH.'webgl.js',
            JS_APP_PATH.'webgl-shader.js',
            JS_APP_PATH.'webgl-bw-dither.js',
            JS_APP_PATH.'webgl-color-dither.js',
            JS_APP_PATH.'histogram.js',
            JS_APP_PATH.'algorithm-model.js',
        ], appVueComponents());
    }
    
    
    function workerJsFiles(): array{
        return array_merge(sharedJsFiles(), [
            JS_WORKER_PATH.'color-quantization-modes.js',
            JS_WORKER_PATH.'pixel-math.js',
            JS_WORKER_PATH.'color-dither-mode-functions.js',
            JS_WORKER_PATH.'image.js',
            JS_WORKER_PATH.'threshold.js',
            JS_WORKER_PATH.'error-prop-model.js',
            JS_WORKER_PATH.'error-prop-dither.js',
            JS_WORKER_PATH.'error-prop-color-dither.js',
            JS_WORKER_PATH.'ordered-dither.js',
            JS_WORKER_PATH.'algorithm-model.js',
            JS_WORKER_PATH.'worker-util.js',
            JS_WORKER_PATH.'histogram.js',
            JS_WORKER_PATH.'optimize-palette-util.js',
            JS_WORKER_PATH.'optimize-palette-perceptual.js',
            JS_WORKER_PATH.'optimize-palette-popularity.js',
            JS_WORKER_PATH.'optimize-palette-median-cut.js',
            JS_WORKER_PATH.'optimize-palette-rgb-quant.js',
            JS_WORKER_PATH.'optimize-palette.js',
            JS_WORKER_PATH.'main.js'
        ]);
    }