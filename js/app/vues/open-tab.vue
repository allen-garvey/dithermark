<template>
    <div class="controls-tab-container" :class="$style.container">
        <fieldset>
            <legend>Device</legend>
            <file-input-button
                buttonClass="btn-primary"
                label="Image file"
                tooltip="Open local image file"
                :onFilesChanged="onDeviceImageOpened"
            />
            <file-input-button
                label="Batch convert image files"
                tooltip="Dither and save multiple images"
                :onFilesChanged="onBatchFilesOpened"
                :multiple="true"
            />
            <file-input-button
                buttonClass="btn-primary"
                label="Video file"
                tooltip="Open local video file"
                :onFilesChanged="onVideoFileOpened"
            />
        </fieldset>
        <fieldset>
            <legend>Web</legend>
            <button
                class="btn btn-default"
                @click="showOpenImageUrlPrompt"
                :disabled="isCurrentlyLoadingImageUrl"
                title="Open image from Url"
            >
                Image url
            </button>
            <button
                class="btn btn-default"
                @click="openRandomImage"
                :disabled="isCurrentlyLoadingImageUrl"
                title="Open random image from Unsplash"
            >
                Random image
            </button>
        </fieldset>
        <batch-image-selector
            v-if="imageFiles?.length > 1"
            v-model:fileIndex="currentImageFileIndex"
            :fileCount="imageFiles.length"
            :currentFilename="imageFiles[currentImageFileIndex].name"
        />
        <video-player
            v-if="videoFile"
            :videoFile="videoFile"
            :onSeekChange="onVideoSeekChange"
        />
    </div>
</template>

<style lang="scss" module>
.container fieldset {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}
</style>

<script>
import Fs, { isImageFile, isVideoFile } from '../fs.js';
import { getRandomImage } from '../random-image.js';
import FileInputButton from './widgets/file-input-button.vue';
import VideoPlayer from './widgets/video-player.vue';
import BatchImageSelector from './widgets/batch-image-selector.vue';
import { BATCH_IMAGE_MODE_EXPORT_IMAGES } from '../models/batch-export-modes.js';
import {
    OPEN_FILE_MODE_BATCH_IMAGES,
    OPEN_FILE_MODE_SINGLE_IMAGE,
    OPEN_FILE_MODE_VIDEO,
} from '../models/open-file-modes.js';

export default {
    props: {
        videoFile: {
            type: File,
        },
        videoDimensions: {
            type: Object,
        },
        openFileMode: {
            type: Number,
            required: true,
        },
        imageOpened: {
            type: Function,
            required: true,
        },
        onBatchFilesSelected: {
            type: Function,
            required: true,
        },
        openImageError: {
            type: Function,
            required: true,
        },
        requestModal: {
            type: Function,
            required: true,
        },
        getFfmpegReady: {
            type: Function,
            required: true,
        },
    },
    emits: [
        'update:openFileMode',
        'update:videoFile',
        'update:videoDimensions',
    ],
    components: {
        FileInputButton,
        VideoPlayer,
        BatchImageSelector,
    },
    data() {
        return {
            isCurrentlyLoadingImageUrl: false,
            imageFiles: null,
            currentImageFileIndex: 0,
        };
    },
    watch: {
        openFileMode(newValue) {
            if (newValue !== OPEN_FILE_MODE_BATCH_IMAGES) {
                this.imageFiles = null;
            }
            if (newValue !== OPEN_FILE_MODE_VIDEO) {
                this.$emit('update:videoFile', null);
            }
        },
        imageFiles(newValue) {
            if (newValue && newValue.length > 0) {
                this.openImageFile(newValue[0]);
            }
        },
        currentImageFileIndex(newValue) {
            if (this.openFileMode !== OPEN_FILE_MODE_BATCH_IMAGES) {
                return;
            }
            if (newValue >= 0 && newValue < this.imageFiles.length) {
                this.openImageFile(this.imageFiles[newValue]);
            }
        },
    },
    methods: {
        getImageFiles() {
            return this.imageFiles.slice();
        },
        batchConvertImages() {
            this.onBatchFilesSelected(
                this.imageFiles,
                BATCH_IMAGE_MODE_EXPORT_IMAGES
            );
        },
        onBatchFilesOpened(rawFiles) {
            const files = Array.from(rawFiles).filter(file =>
                isImageFile(file)
            );
            if (files.length === 0) {
                return this.openImageError('No image files selected');
            }
            this.getFfmpegReady();
            this.imageFiles = files;
            const mode =
                files.length > 1
                    ? OPEN_FILE_MODE_BATCH_IMAGES
                    : OPEN_FILE_MODE_SINGLE_IMAGE;
            this.$emit('update:openFileMode', mode);
        },
        onDeviceImageOpened(files) {
            this.openImageFile(files[0]).then(() => {
                this.$emit('update:openFileMode', OPEN_FILE_MODE_SINGLE_IMAGE);
            });
        },
        /**
         *
         * @param {File} file
         * @returns {Promise}
         */
        openImageFile(file) {
            return Fs.openImageFile(file).then(([image, file]) => {
                if (!image) {
                    return this.openImageError(file);
                }
                this.imageOpened(image, file, {
                    height: image.height,
                    width: image.width,
                });
            });
        },
        openImageFromUrlFailed(error, imageUrl) {
            this.openImageError(
                Fs.messageForOpenImageUrlError(error, imageUrl)
            );
            this.isCurrentlyLoadingImageUrl = false;
        },
        showOpenImageUrlPrompt() {
            this.requestModal(
                'Open image from url',
                'Image Url',
                '',
                this.openImageUrl,
                {
                    okButtonValue: 'Open',
                    inputType: 'url',
                    placeholder: 'http://example.com/image.jpg',
                }
            );
        },
        openImageUrl(imageUrl) {
            if (!imageUrl) {
                return;
            }
            this.isCurrentlyLoadingImageUrl = true;
            Fs.openImageUrl(imageUrl)
                .then(([image, file]) => {
                    this.imageOpened(image, file, {
                        height: image.height,
                        width: image.width,
                    });
                    this.isCurrentlyLoadingImageUrl = false;
                    this.$emit(
                        'update:openFileMode',
                        OPEN_FILE_MODE_SINGLE_IMAGE
                    );
                })
                .catch(error => {
                    this.openImageFromUrlFailed(error, imageUrl);
                });
        },
        openRandomImage() {
            this.isCurrentlyLoadingImageUrl = true;

            getRandomImage(window.innerWidth, window.innerHeight)
                .then(({ image, file }) => {
                    this.imageOpened(image, file, {
                        height: image.height,
                        width: image.width,
                    });
                    this.isCurrentlyLoadingImageUrl = false;
                    this.$emit(
                        'update:openFileMode',
                        OPEN_FILE_MODE_SINGLE_IMAGE
                    );
                })
                .catch(this.openImageFromUrlFailed);
        },
        onVideoFileOpened(videoFiles) {
            const videoFile = videoFiles[0];
            if (!isVideoFile(videoFile)) {
                return this.openImageError(
                    `${videoFile.name} does not appear to be a video file.`
                );
            }
            this.getFfmpegReady();
            this.$emit('update:openFileMode', OPEN_FILE_MODE_VIDEO);
            this.$emit('update:videoFile', videoFile);
        },
        onVideoSeekChange(video) {
            const dimensions = {
                height: video.videoHeight,
                width: video.videoWidth,
            };
            this.$emit('update:videoDimensions', dimensions);
            this.imageOpened(video, this.videoFile, dimensions);
        },
    },
};
</script>
