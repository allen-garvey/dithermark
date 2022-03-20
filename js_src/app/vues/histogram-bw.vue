<template>
    <div 
        class="histogram-container" 
        :style="{ width: `${histogramWidth}px`, height: `${histogramHeight}px` }"
    >
        <canvas 
            ref="histogramCanvasIndicator" 
            :class="$style.histogramIndicator" 
            :width="histogramWidth" 
            :height="histogramHeight" 
            title="Lightness histogram"
        >
        </canvas>
        <canvas 
            ref="histogramCanvas" 
            :class="$style.histogramCanvas" 
            :width="histogramWidth" 
            :height="histogramHeight" 
            title="Lightness histogram"
        >
        </canvas>
    </div>
</template>

<style lang="scss" module>

.histogramIndicator{
    z-index: 10;
}

.histogramCanvas{
    z-index: 1;
}

</style>

<script>
import Constants from '../../generated_output/app/constants.js';

export default {
    expose: ['histogramCanvasIndicator', 'histogramCanvas'],
    computed: {
        histogramCanvasIndicator(){
            return this.$refs.histogramCanvasIndicator;
        },
        histogramCanvas(){
            return this.$refs.histogramCanvas;
        },
        histogramWidth() {
            return Constants.histogramBwWidth;
        },
        histogramHeight() {
            return Constants.histogramHeight;
        },
    },
};
</script>