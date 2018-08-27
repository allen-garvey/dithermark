<?php
    
function vueComponentsWithTemplates(): array{
    $ret = [];
    if(ENABLE_PRINT_COLOR_PALETTE_BUTTON){
        $ret[] = 'print-palette-button-component';
    }
    if(ENABLE_TEXTURE_COMBINE){
        $ret[] = 'texture-combine-component';
    }
    $ret[] = 'cycle-property-list-component';
    $ret[] = 'unsplash-attribution-component';
    $ret[] = 'modal-prompt-component';
    $ret[] = 'color-input-component';
    $ret[] = 'color-picker-component';
    $ret[] = 'zoom-bar-component';
    $ret[] = 'outline-filters-controls-component';
    $ret[] = 'export-tab-component';
    $ret[] = 'open-tab-component';
    $ret[] = 'full-screen-mode-control-component';
    $ret[] = 'bw-dither-component';
    $ret[] = 'color-dither-component';
    $ret[] = 'dither-studio-component';
    return $ret;
}