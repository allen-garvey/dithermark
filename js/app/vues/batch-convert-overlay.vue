<template>
    <div :class="$style.container">
        <div v-if="batchConvertState === batchConvertStates.PROCESSING_FRAMES">
            <div>Processing image {{ currentFileName }}</div>
            <div>{{ currentImageIndex }}/{{ batchImageCount }}</div>
        </div>
        <div v-if="batchConvertState === batchConvertStates.FRAMES_TO_VIDEO">
            <div>Converting images to video <span v-if="videoConvertPercentage">{{ videoConvertPercentage }}%</span></div>
            <spinner />
        </div>
    </div>
</template>

<style lang="scss" module>
    .container {
        position: absolute;
        z-index: 100;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: var(--main-bg-color);
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        font-size: 1.25rem;
    }
</style>

<script>
import { BATCH_CONVERT_STATE } from '../models/batch-convert-states.js';
import spinner from './widgets/spinner.vue';

export default {
    props: {
        currentFileName: {
            type: String,
            required: true,
        },
        batchImageCount: {
            type: Number,
            required: true,
        },
        batchImagesLeft: {
            type: Number,
            required: true,
        },
        batchConvertState: {
            type: Number,
            required: true,
        },
        videoConvertPercentage: {
            type: Number,
            required: true,
        },
    },
    components: {
        spinner,
    },
    computed: {
        batchConvertStates(){
            return BATCH_CONVERT_STATE;
        },
        currentImageIndex(){
            return this.batchImageCount - this.batchImagesLeft + 1;
        },
    },
};
</script>