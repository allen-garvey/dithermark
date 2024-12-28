<template>
    <div :class="$style.container">
        <h4>Video Controls</h4>
        <p>{{ videoFile.name }}</p>
        <div :class="$style.controlsContainer">
            <input
                type="range"
                min="0"
                :max="videoDuration"
                step="0.5"
                :disabled="!isVideoLoaded"
                v-model.number="seekValue"
                :class="$style.videoRange"
            />
            <input
                type="number"
                min="0"
                :max="videoDuration"
                step="1"
                v-model.number="seekValue"
                :disabled="!isVideoLoaded"
            />
        </div>
        <video
            v-show="false"
            ref="video"
            @seeked="onSeeked"
            @loadedmetadata="onMetadataLoaded"
            @canplaythrough="onVideoReady"
        ></video>
    </div>
</template>

<style lang="scss" module>
.container {
}

.controlsContainer {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em;
}

.videoRange {
    flex-grow: 1;
    flex-basis: auto;
}
</style>

<script>
export default {
    props: {
        videoFile: {
            type: File,
            required: true,
        },
        onSeekChange: {
            type: Function,
            required: true,
        },
        videoDuration: {
            type: Number,
        },
    },
    emits: ['update:videoDuration'],
    created() {
        this.objectUrl = null;
    },
    mounted() {
        // have to do this here, instead of immediate watcher, because otherwise the video element will not be mounted
        this.loadVideoFile();
    },
    unmounted() {
        URL.revokeObjectURL(this.objectUrl);
    },
    data() {
        return {
            isVideoLoaded: false,
            seekValue: 0,
            objectUrl: null,
        };
    },
    computed: {},
    watch: {
        videoFile() {
            this.loadVideoFile();
        },
        seekValue(newValue) {
            if (
                this.isVideoLoaded &&
                newValue >= 0 &&
                newValue <= this.videoDuration
            ) {
                this.$refs.video.currentTime = newValue;
            }
        },
    },
    methods: {
        loadVideoFile() {
            this.isVideoLoaded = false;
            this.seekValue = -1;
            URL.revokeObjectURL(this.objectUrl);
            this.objectUrl = URL.createObjectURL(this.videoFile);
            const video = this.$refs.video;
            video.src = this.objectUrl;
            video.load();
        },
        onSeeked() {
            this.onSeekChange(this.$refs.video);
        },
        onMetadataLoaded() {
            this.$emit('update:videoDuration', this.$refs.video.duration);
        },
        onVideoReady() {
            if (!this.isVideoLoaded) {
                this.isVideoLoaded = true;
                this.seekValue = 0;
            }
        },
    },
};
</script>
