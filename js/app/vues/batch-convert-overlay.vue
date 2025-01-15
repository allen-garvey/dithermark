<template>
    <div :class="$style.batchConvertOverlay">
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
            <div :class="$style.messageContainer">
                {{ progressMessage }}
                <template v-if="videoConvertPercentage">
                    <template v-if="videoConvertPercentage === 100">
                        <span>99.9%</span>
                        <div>Finalizing. This may take a while.</div>
                    </template>
                    <span v-else>{{ videoConvertPercentage }}%</span>
                </template>
            </div>
            <spinner :class="$style.spinner" />
        </div>
    </div>
</template>

<style lang="scss" module>
.batchConvertOverlay {
    background-color: var(--main-bg-color);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    font-size: 1.25rem;
    padding: 2em 1em;
}
.messageContainer {
    text-align: center;
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
