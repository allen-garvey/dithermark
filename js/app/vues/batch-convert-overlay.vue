<template>
    <div :class="$style.container">
        <div v-if="progressStagesCount > 1">
            {{ currentProgressStage }} / {{ progressStagesCount }}
        </div>
        <div v-if="batchConvertState === batchConvertStates.PROCESSING_FRAMES">
            <div>Processing image {{ currentFileName }}</div>
            <div>{{ currentImageIndex }}/{{ batchImageCount }}</div>
        </div>
        <div
            v-if="
                batchConvertState === batchConvertStates.FRAMES_TO_VIDEO ||
                batchConvertState === batchConvertStates.VIDEO_TO_FRAMES
            "
        >
            <div>
                {{ progressMessage }}
                <span v-if="videoConvertPercentage">
                    {{ videoConvertPercentage }}%
                </span>
            </div>
            <spinner :class="$style.spinner" />
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
.spinner {
    margin-top: 0.5rem;
}
</style>

<script>
import { BATCH_CONVERT_STATE } from '../models/batch-convert-states.js';
import { stagesMap } from '../models/batch-export-modes.js';
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
        batchImageMode: {
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
        currentProgressStage() {
            return stagesMap
                .get(this.batchImageMode)
                .get(this.batchConvertState);
        },
        progressStagesCount() {
            return stagesMap.get(this.batchImageMode).size;
        },
        batchConvertStates() {
            return BATCH_CONVERT_STATE;
        },
        currentImageIndex() {
            return this.batchImageCount - this.batchImagesLeft + 1;
        },
        progressMessage() {
            if (
                this.batchConvertState === BATCH_CONVERT_STATE.VIDEO_TO_FRAMES
            ) {
                return 'Converting video to images';
            }
            return 'Converting images to video';
        },
    },
};
</script>
