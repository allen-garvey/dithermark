<template>
    <div 
        class="histogram-container"
        :class="$style.colorHistogramContainer" 
        :style="{width: `${histogramWidth}px`, height: `${histogramHeight}px`}"
    >
        <canvas 
            ref="histogramCanvas" 
            :width="histogramWidth" 
            :height="histogramHeight" 
            title="Hue histogram"
        >
        </canvas>
    </div>
</template>

<style lang="scss" module>
//hide color histogram at small screen widths
//since it stretches screen, while not adding very much
@media screen and (max-width: 399px){
    .colorHistogramContainer{
        display: none;
    }
}
</style>

<script>
import { HISTOGRAM_COLOR_WIDTH, HISTOGRAM_HEIGHT } from '../histogram.js';

export default {
    expose: ['histogramCanvas'],
    computed: {
        histogramCanvas(){
            return this.$refs.histogramCanvas;
        },
        histogramWidth() {
            return HISTOGRAM_COLOR_WIDTH;
        },
        histogramHeight() {
            return HISTOGRAM_HEIGHT;
        },
    },
};
</script>