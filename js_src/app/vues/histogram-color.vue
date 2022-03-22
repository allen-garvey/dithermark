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
@media screen and (max-width: $histogram_color_required_width){
    .colorHistogramContainer{
        display: none;
    }
}

</style>

<script>
import Constants from '../../generated_output/app/constants.js';

export default {
    expose: ['histogramCanvas'],
    computed: {
        histogramCanvas(){
            return this.$refs.histogramCanvas;
        },
        histogramWidth() {
            return Constants.histogramColorWidth;
        },
        histogramHeight() {
            return Constants.histogramHeight;
        },
    },
};
</script>