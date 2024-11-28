<template>
    <div :class="$style.canvasSupercontainer">
        <div :class="$style.canvasContainer">
            <canvas 
                ref="sourceCanvasOutput" 
                v-show="showOriginalImage">
            </canvas>
            <canvas 
                ref="transformCanvasOutput">
            </canvas>
        </div>
    </div>
</template>

<style lang="scss" module>
.canvasSupercontainer{
    display: flex;
    overflow-x: scroll;
    max-width: calc(100vw - #{variables.$chrome_fullscreen_horizontal_scrollbar_height});
}

.canvasContainer{
    display: flex;
    column-gap: 25px;
    margin-top: 12px;
}

@include mixins.pinned_controls_mq{
    .canvasSupercontainer{
        overflow-x: initial;
        max-width: none;
    }
    
    .canvasContainer{
        &::before, &::after{
            content: '';
            width: variables.$pinned_controls_canvas_padding;
        }
    }
}
</style>

<script>
export default {
    expose: ['sourceCanvasOutput', 'transformCanvasOutput'],
    props: {
        showOriginalImage: {
            type: Boolean,
            required: true,
        },
    },
    computed: {
        sourceCanvasOutput(){
            return this.$refs.sourceCanvasOutput;
        },
        transformCanvasOutput(){
            return this.$refs.transformCanvasOutput;
        },
    },
};
</script>