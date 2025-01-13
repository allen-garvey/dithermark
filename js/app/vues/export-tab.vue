<template>
    <div class="controls-tab-container">
        <div v-if="currentInputFileType === inputFileTypes.MULTIPLE_IMAGES">
            <label :class="$style.labelText">Export type</label>
            <div :class="$style.radioGroup">
                <label :class="$style.radioLabel"
                    ><span>Current image</span>
                    <input
                        type="radio"
                        v-model="currentOutputFileOption"
                        :value="outputFileOptions.CURRENT_IMAGE"
                    />
                </label>
                <label :class="$style.radioLabel"
                    ><span>Batch export images</span>
                    <input
                        type="radio"
                        v-model="currentOutputFileOption"
                        :value="outputFileOptions.BATCH_CONVERT_IMAGES"
                    />
                </label>
                <label :class="$style.radioLabel"
                    ><span>Images to video</span>
                    <input
                        type="radio"
                        v-model="currentOutputFileOption"
                        :value="outputFileOptions.VIDEO"
                    />
                </label>
            </div>
        </div>

        <div v-if="currentInputFileType === inputFileTypes.VIDEO">
            <label :class="$style.labelText">Export type</label>
            <div :class="$style.radioGroup">
                <label :class="$style.radioLabel"
                    ><span>Current image</span>
                    <input
                        type="radio"
                        v-model="currentOutputFileOption"
                        :value="outputFileOptions.CURRENT_IMAGE"
                    />
                </label>
                <label :class="$style.radioLabel"
                    ><span>Video</span>
                    <input
                        type="radio"
                        v-model="currentOutputFileOption"
                        :value="outputFileOptions.VIDEO"
                    />
                </label>
            </div>
        </div>
        <div v-if="currentOutputFileOption === outputFileOptions.CURRENT_IMAGE">
            <label
                ><span :class="$style.labelText">File name</span>
                <input
                    placeholder="File name"
                    v-model="saveImageFileName"
                    @keyup.enter="submit"
                    :class="{ [$style.invalid]: hasFilenameError }"
                /><span>{{ displayedOutputFileExtension }}</span>
            </label>
        </div>
        <div v-if="isOutputtingVideo">
            <label>
                <span :class="$style.labelText">File name</span>
                <input
                    placeholder="File name"
                    v-model="videoExportFilename"
                    @keyup.enter="submit"
                    :class="{ [$style.invalid]: hasFilenameError }"
                /><span>{{ displayedOutputFileExtension }}</span>
            </label>
        </div>
        <div
            v-if="currentOutputFileOption === outputFileOptions.VIDEO"
            :class="$style.inputList"
        >
            <checkbox
                tooltip="Keep input and output frames per second the same"
                label="Sync FPS"
                v-model="videoSyncFps"
                :labelTextClass="$style.labelText"
            />
            <label>
                <span :class="$style.labelText">Input FPS</span>
                <input
                    v-model.number="videoInputFps"
                    type="number"
                    min="1"
                    step="1"
                    :class="{
                        [$style.invalid]: hasInputFpsError,
                        [$style.fpsInput]: true,
                    }"
                />
            </label>
            <label>
                <span :class="$style.labelText">Output FPS</span>
                <input
                    v-model.number="videoOutputFps"
                    type="number"
                    min="1"
                    step="1"
                    :class="{
                        [$style.invalid]: hasOutputFpsError,
                        [$style.fpsInput]: true,
                    }"
                    :disabled="videoSyncFps"
                />
            </label>
        </div>
        <div v-if="!isOutputtingVideo">
            <label
                ><span :class="$style.labelText">File type</span>
                <select v-model="saveImageFileTypeValue">
                    <option
                        v-for="fileType of saveImageFileTypes"
                        :key="fileType.value"
                        :value="fileType.value"
                    >
                        {{ fileType.label }}
                    </option>
                </select>
            </label>
        </div>
        <div v-if="isImagePixelated">
            <label :class="$style.labelText">Size</label>
            <div :class="$style.radioGroup">
                <label :class="$style.radioLabel">
                    <span>Upsampled</span>
                    <input
                        type="radio"
                        @change="$emit('update:shouldUpsample', true)"
                        :checked="shouldUpsample"
                    />
                </label>
                <label :class="$style.radioLabel">
                    <span>Actual</span>
                    <input
                        type="radio"
                        @change="$emit('update:shouldUpsample', false)"
                        :checked="!shouldUpsample"
                    />
                </label>
            </div>
        </div>
        <div>
            <button
                class="btn btn-success"
                :class="$style.submitButton"
                @click="submit"
                :disabled="isSaveDisabled"
                title="Save image to downloads folder"
            >
                {{ saveButtonText }}
                <spinner v-if="isLoadingFfmpeg || isCurrentlySavingImage" />
            </button>
        </div>
        <div :class="$style.alertsContainer">
            <banner-messages :messages="errorMessages" type="danger" />
            <video-warning-banner
                v-if="isOutputtingVideo"
                :automaticallyResizeLargeImages="automaticallyResizeLargeImages"
                :isPixelatedActualSize="isImagePixelated && !shouldUpsample"
                :doInputAndOutputFpsMatch="videoInputFps === videoOutputFps"
            />
        </div>
    </div>
</template>

<style lang="scss" module>
.inputList {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
}
.labelText {
    display: inline-block;
    margin-right: 0.5em;
    min-width: 5.25em;
}

.radioLabel {
    font-size: 0.8rem;
    display: inline-flex;
    align-items: center;
    gap: 1em 0.5em;
}

.radioGroup {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 1em;
}

.alertsContainer {
    margin: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 1em;
}

.invalid,
.invalid:focus {
    border-color: variables.$danger_input_border_color;
}

.submitButton {
    display: flex;
    align-items: center;
    gap: 1em;
}

.fpsInput {
    width: 4em;
}
</style>

<script>
import {
    APP_NAME,
    UNSPLASH_DOWNLOAD_URL,
    UNSPLASH_API_PHOTO_ID_QUERY_KEY,
} from '../../../constants.js';
import Canvas from '../canvas.js';
import {
    saveImage,
    canvasToArray,
    arrayToObjectUrl,
    canvasToBlob,
    blobToObjectUrl,
} from '../fs.js';
import { getSaveImageFileTypes } from '../models/export-model.js';
import userSettings from '../user-settings.js';
import {
    exportFramesToVideo,
    saveImageFrame,
    ffmpegImageFileType,
} from '../ffmpeg.js';
import {
    ffmpegClientSaveImage,
    ffmpegClientFramesToVideo,
} from '../ffmpeg-client.js';
import { getFilenameWithoutExtension } from '../path.js';
import {
    OPEN_FILE_MODE_BATCH_IMAGES,
    OPEN_FILE_MODE_VIDEO,
} from '../models/open-file-modes.js';
import {
    BATCH_IMAGE_MODE_EXPORT_IMAGES,
    BATCH_IMAGE_MODE_EXPORT_VIDEO,
} from '../models/batch-export-modes.js';
import VideoWarningBanner from './widgets/video-warning-banner.vue';
import BannerMessages from './widgets/banner-messages.vue';
import Spinner from './widgets/spinner.vue';
import Checkbox from './checkbox.vue';

// needs to be here, otherwise data() will fail since computed properties don't exist yet
const outputFileOptions = {
    CURRENT_IMAGE: 1,
    BATCH_CONVERT_IMAGES: 2,
    VIDEO: 3,
};

let saveImageCanvas;
let saveImageLink;

let saveFpsTimeout = null;

function createSaveImageLink() {
    const link = document.createElement('a');
    //firefox needs the link attached to the body in order for downloads to work
    //so display none in order to hide it
    //https://stackoverflow.com/questions/38869328/unable-to-download-a-blob-file-with-firefox-but-it-works-in-chrome
    link.style.display = 'none';
    document.body.appendChild(link);
    return link;
}

export default {
    props: {
        openFileMode: {
            type: Number,
            required: true,
        },
        videoExportRequested: {
            type: Function,
            required: true,
        },
        saveRequested: {
            type: Function,
            required: true,
        },
        isImagePixelated: {
            type: Boolean,
            required: true,
        },
        automaticallyResizeLargeImages: {
            type: Boolean,
            required: true,
        },
        sourceFileName: {
            type: String,
            required: true,
        },
        shouldUpsample: {
            type: Boolean,
            required: true,
        },
        isFfmpegReady: {
            type: Boolean,
            required: true,
        },
        isBatchConverting: {
            type: Boolean,
            required: true,
        },
        onSubmitBatchConvertImages: {
            type: Function,
            required: true,
        },
    },
    emits: ['update:shouldUpsample'],
    components: {
        VideoWarningBanner,
        BannerMessages,
        Spinner,
        Checkbox,
    },
    created() {
        saveImageCanvas = Canvas.create();
        saveImageLink = createSaveImageLink();
    },
    data() {
        const exportSettings = userSettings.getExportSettings();

        return {
            saveImageFileName: '',
            videoExportFilename: '',
            saveImageFileTypeValue: exportSettings.fileType,
            isCurrentlySavingImage: false,
            currentOutputFileOption: outputFileOptions.CURRENT_IMAGE,
            videoInputFps: exportSettings.videoFps,
            videoOutputFps: exportSettings.videoFps,
            videoSyncFps: true,
        };
    },
    computed: {
        hasFilenameError() {
            return (
                (this.currentOutputFileOption ===
                    outputFileOptions.CURRENT_IMAGE &&
                    !this.saveImageFileName) ||
                (this.isOutputtingVideo && !this.videoExportFilename)
            );
        },
        hasInputFpsError() {
            return (
                this.isOutputtingVideo &&
                (isNaN(this.videoInputFps) || this.videoInputFps <= 0)
            );
        },
        hasOutputFpsError() {
            return (
                this.isOutputtingVideo &&
                (isNaN(this.videoOutputFps) || this.videoOutputFps <= 0)
            );
        },
        errorMessages() {
            const errorMessages = [];

            if (this.hasFilenameError) {
                errorMessages.push(`File name can't be blank.`);
            }

            if (this.hasInputFpsError || this.hasOutputFpsError) {
                errorMessages.push(
                    'Frames per second must be a number greater than 0.'
                );
            }

            return errorMessages;
        },
        isLoadingFfmpeg() {
            return this.isOutputtingVideo && !this.isFfmpegReady;
        },
        saveButtonText() {
            if (this.isCurrentlySavingImage) {
                return 'Saving…';
            }
            return this.isLoadingFfmpeg ? 'Loading FFmpeg…' : 'Save';
        },
        isSaveDisabled() {
            if (this.isOutputtingVideo) {
                return (
                    this.isCurrentlySavingImage ||
                    this.hasInputFpsError ||
                    this.hasOutputFpsError ||
                    this.hasFilenameError ||
                    !this.isFfmpegReady
                );
            }

            return this.isCurrentlySavingImage || this.hasFilenameError;
        },
        saveImageFileTypes() {
            return getSaveImageFileTypes();
        },
        saveImageFileType() {
            return this.saveImageFileTypes.find(
                fileType => fileType.value === this.saveImageFileTypeValue
            );
        },
        inputFileTypes() {
            return {
                SINGLE_IMAGE: 1,
                MULTIPLE_IMAGES: 2,
                VIDEO: 3,
            };
        },
        outputFileOptions() {
            return outputFileOptions;
        },
        currentInputFileType() {
            switch (this.openFileMode) {
                case OPEN_FILE_MODE_VIDEO:
                    return this.inputFileTypes.VIDEO;
                case OPEN_FILE_MODE_BATCH_IMAGES:
                    return this.inputFileTypes.MULTIPLE_IMAGES;
                default:
                    return this.inputFileTypes.SINGLE_IMAGE;
            }
        },
        isOutputtingVideo() {
            return (
                this.currentOutputFileOption === this.outputFileOptions.VIDEO
            );
        },
        displayedOutputFileExtension() {
            if (this.isOutputtingVideo) {
                return this.videoFileExtension;
            }
            return this.saveImageFileType.extension;
        },
        videoFileExtension() {
            return '.mp4';
        },
    },
    watch: {
        sourceFileName(newValue) {
            const filename = getFilenameWithoutExtension(newValue);
            this.saveImageFileName = filename;

            if (
                this.currentInputFileType === this.inputFileTypes.VIDEO &&
                !this.isBatchConverting
            ) {
                this.videoExportFilename = filename;
            }
        },
        saveImageFileName(newValue, oldValue) {
            if (newValue === oldValue) {
                return;
            }
            let title = APP_NAME;
            if (newValue) {
                title = `${title} | ${newValue}`;
            }
            document.title = title;
        },
        videoSyncFps(newValue) {
            if (newValue) {
                this.videoOutputFps = this.videoInputFps;
            }
        },
        videoInputFps(newValue) {
            if (this.isOutputtingVideo && !this.hasInputFpsError) {
                clearTimeout(saveFpsTimeout);
                saveFpsTimeout = setTimeout(() => {
                    userSettings.saveExportSettings({
                        fileType: this.saveImageFileTypeValue,
                        videoFps: newValue,
                    });
                }, 2000);
            }
            if (this.videoSyncFps) {
                this.videoOutputFps = newValue;
            }
        },
        saveImageFileTypeValue(newValue) {
            userSettings.saveExportSettings({
                fileType: newValue,
                videoFps: this.videoInputFps,
            });
        },
        openFileMode(newValue) {
            switch (newValue) {
                case OPEN_FILE_MODE_VIDEO:
                    this.currentOutputFileOption = this.outputFileOptions.VIDEO;
                    break;
                case OPEN_FILE_MODE_BATCH_IMAGES:
                    this.currentOutputFileOption =
                        this.outputFileOptions.BATCH_CONVERT_IMAGES;
                    break;
                default:
                    this.currentOutputFileOption =
                        this.outputFileOptions.CURRENT_IMAGE;
                    break;
            }
        },
    },
    methods: {
        submit() {
            if (this.isSaveDisabled) {
                return;
            }
            switch (this.currentOutputFileOption) {
                case outputFileOptions.BATCH_CONVERT_IMAGES:
                    return this.onSubmitBatchConvertImages(
                        BATCH_IMAGE_MODE_EXPORT_IMAGES
                    );
                case outputFileOptions.VIDEO:
                    if (
                        this.currentInputFileType === this.inputFileTypes.VIDEO
                    ) {
                        return this.videoExportRequested(
                            this.videoInputFps,
                            this.videoOutputFps
                        );
                    } else {
                        return this.onSubmitBatchConvertImages(
                            BATCH_IMAGE_MODE_EXPORT_VIDEO
                        );
                    }
                default:
                    return this.saveImage();
            }
        },
        saveImageBase(promiseFunc) {
            return new Promise(resolve => {
                if (this.isCurrentlySavingImage) {
                    return resolve();
                }
                this.isCurrentlySavingImage = true;
                this.saveRequested(
                    saveImageCanvas,
                    (sourceCanvas, unsplash) => {
                        promiseFunc(sourceCanvas, unsplash).then(() => {
                            //clear the canvas to free up memory
                            Canvas.clear(saveImageCanvas);
                            this.isCurrentlySavingImage = false;
                            resolve();
                        });
                    }
                );
            });
        },
        //downloads image
        saveImage() {
            return this.saveImageBase(
                (sourceCanvas, unsplash) =>
                    new Promise((resolve, reject) => {
                        saveImage(
                            sourceCanvas.canvas,
                            this.saveImageFileType.mime,
                            objectUrl => {
                                saveImageLink.href = objectUrl;
                                saveImageLink.download =
                                    this.saveImageFileName +
                                    this.saveImageFileType.extension;
                                saveImageLink.click();

                                //follow Unsplash API guidelines for triggering download
                                //https://medium.com/unsplash/unsplash-api-guidelines-triggering-a-download-c39b24e99e02
                                if (unsplash) {
                                    //arguably should be POST request here, but much easier to just use GET
                                    fetch(
                                        `${UNSPLASH_DOWNLOAD_URL}?${UNSPLASH_API_PHOTO_ID_QUERY_KEY}=${unsplash.id}`
                                    );
                                }
                                resolve();
                            }
                        );
                    })
            );
        },
        saveImageToFfmpegServer() {
            return this.saveImageBase((sourceCanvas, unsplash) =>
                canvasToBlob(
                    sourceCanvas.canvas,
                    ffmpegImageFileType.mime
                ).then(blob =>
                    ffmpegClientSaveImage(
                        new File(
                            [blob],
                            this.saveImageFileName +
                                ffmpegImageFileType.extension
                        )
                    )
                )
            );
        },
        saveImageToFfmpeg(ffmpeg) {
            return this.saveImageBase((sourceCanvas, unsplash) =>
                canvasToArray(
                    sourceCanvas.canvas,
                    ffmpegImageFileType.mime
                ).then(array =>
                    saveImageFrame(
                        ffmpeg,
                        this.saveImageFileName + ffmpegImageFileType.extension,
                        array
                    )
                )
            );
        },
        exportVideoFromFrames(ffmpeg) {
            const exportFilename =
                this.videoExportFilename + this.videoFileExtension;

            return new Promise(resolve => {
                exportFramesToVideo(ffmpeg, this.videoOutputFps).then(data => {
                    arrayToObjectUrl(data, objectUrl => {
                        saveImageLink.href = objectUrl;
                        saveImageLink.download = exportFilename;
                        saveImageLink.click();
                        resolve();
                    });
                });
            });
        },
        exportVideoFromFramesFfmpegServer() {
            const exportFilename =
                this.videoExportFilename + this.videoFileExtension;

            return new Promise(resolve => {
                ffmpegClientFramesToVideo(
                    this.videoOutputFps,
                    this.saveImageFileType.extension
                ).then(blob => {
                    blobToObjectUrl(blob, objectUrl => {
                        saveImageLink.href = objectUrl;
                        saveImageLink.download = exportFilename;
                        saveImageLink.click();
                        resolve();
                    });
                });
            });
        },
    },
};
</script>
