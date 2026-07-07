<template>
    <div :class="$style.batchConvertOverlay">
        <div v-if="batchConvertState === batchConvertStates.PROCESSING_FRAMES">
            <div>Processing image {{ currentFileName }}</div>
            <div>{{ currentImageIndex }}/{{ batchImageCount }}</div>
        </div>
        <div v-else>
            <div :class="$style.messageContainer">
                {{ progressMessage }}
                <span v-if="videoConvertPercentage"
                    >{{ videoConvertPercentage }}%</span
                >
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
        batchConvertStates() {
            return BATCH_CONVERT_STATE;
        },
        currentImageIndex() {
            return this.batchImageCount - this.batchImagesLeft + 1;
        },
        progressMessage() {
            if (
                this.batchConvertState ===
                BATCH_CONVERT_STATE.MEDIABUNNY_FINALIZING_VIDEO
            ) {
                return 'Finalizing video';
            }
            return 'Converting video';
        },
    },
};
</script>
