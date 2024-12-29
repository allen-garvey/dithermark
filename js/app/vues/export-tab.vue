<template>
    <div class="controls-tab-container">
        <div v-if="currentInputFileType === inputFileTypes.MULTIPLE_IMAGES">
            <label :class="$style.exportLabel">Export type</label>
            <label :class="$style.radioLabel"
                >Current image
                <input
                    type="radio"
                    v-model="currentOutputFileOption"
                    :value="outputFileOptions.CURRENT_IMAGE"
                />
            </label>
            <label :class="$style.radioLabel"
                >Batch export images
                <input
                    type="radio"
                    v-model="currentOutputFileOption"
                    :value="outputFileOptions.BATCH_CONVERT_IMAGES"
                />
            </label>
            <label :class="$style.radioLabel"
                >Images to video
                <input
                    type="radio"
                    v-model="currentOutputFileOption"
                    :value="outputFileOptions.VIDEO"
                />
            </label>
        </div>

        <div v-if="currentInputFileType === inputFileTypes.VIDEO">
            <label :class="$style.exportLabel">Export type</label>
            <label :class="$style.radioLabel"
                >Current image
                <input
                    type="radio"
                    v-model="currentOutputFileOption"
                    :value="outputFileOptions.CURRENT_IMAGE"
                />
            </label>
            <label :class="$style.radioLabel"
                >Video
                <input
                    type="radio"
                    v-model="currentOutputFileOption"
                    :value="outputFileOptions.VIDEO"
                />
            </label>
        </div>
        <div
            v-if="
                currentOutputFileOption !==
                outputFileOptions.BATCH_CONVERT_IMAGES
            "
        >
            <label :class="$style.exportLabel" for="export-tab-filename"
                >File name</label
            >
            <input
                placeholder="File name"
                v-model="saveImageFileName"
                @keyup.enter="submit"
                :class="{ [$style.invalid]: hasFilenameError }"
                id="export-tab-filename"
            /><span>{{ displayedOutputFileExtension }}</span>
        </div>
        <div v-if="currentOutputFileOption === outputFileOptions.VIDEO">
            <label :class="$style.exportLabel" for="export-tab-fps"
                >Frames per second</label
            >
            <input
                v-model.number="videoFps"
                type="number"
                min="1"
                step="1"
                :class="{ [$style.invalid]: hasFpsError }"
                id="export-tab-fps"
            />
        </div>
        <div v-if="!isOutputtingVideo">
            <label :class="$style.exportLabel" for="export-tab-filetype"
                >File type</label
            >
            <select v-model="saveImageFileTypeValue" id="export-tab-filetype">
                <option
                    v-for="fileType of saveImageFileTypes"
                    :key="fileType.value"
                    :value="fileType.value"
                >
                    {{ fileType.label }}
                </option>
            </select>
        </div>
        <div v-if="isImagePixelated">
            <label :class="$style.exportLabel">Size</label>
            <label :class="$style.radioLabel">
                Upsampled
                <input
                    type="radio"
                    @change="$emit('update:shouldUpsample', true)"
                    :checked="shouldUpsample"
                />
            </label>
            <label :class="$style.radioLabel">
                Actual
                <input
                    type="radio"
                    @change="$emit('update:shouldUpsample', false)"
                    :checked="!shouldUpsample"
                />
            </label>
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
            />
        </div>
    </div>
</template>

<style lang="scss" module>
.exportLabel {
    display: inline-block;
    min-width: 4.5em;
    margin-right: 0.8em;
}

.radioLabel {
    font-size: 0.8rem;

    & + & {
        margin-left: 0.5em;
    }
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
</style>

<script>
import {
    APP_NAME,
    UNSPLASH_DOWNLOAD_URL,
    UNSPLASH_API_PHOTO_ID_QUERY_KEY,
} from '../../../constants.js';
import Canvas from '../canvas.js';
import { saveImage, canvasToArray, arrayToObjectUrl } from '../fs.js';
import { getSaveImageFileTypes } from '../models/export-model.js';
import userSettings from '../user-settings.js';
import {
    exportFramesToVideo,
    saveImageFrame,
    ffmpegImageFileType,
} from '../ffmpeg.js';
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

// needs to be here, otherwise data() will fail since computed properties don't exist yet
const outputFileOptions = {
    CURRENT_IMAGE: 1,
    BATCH_CONVERT_IMAGES: 2,
    VIDEO: 3,
};

let saveImageCanvas;
let saveImageLink;

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
    },
    created() {
        saveImageCanvas = Canvas.create();
        saveImageLink = createSaveImageLink();
        this.correctSaveImageFileTypeValue();
    },
    data() {
        return {
            saveImageFileName: '',
            saveImageFileTypeValue: userSettings.getExportSettings().fileType,
            isCurrentlySavingImage: false,
            currentOutputFileOption: outputFileOptions.CURRENT_IMAGE,
            videoFps: 24,
            videoExportFilename: '',
        };
    },
    computed: {
        hasFilenameError() {
            return !this.saveImageFileName;
        },
        hasFpsError() {
            return (
                this.isOutputtingVideo &&
                (isNaN(this.videoFps) || this.videoFps <= 0)
            );
        },
        errorMessages() {
            const errorMessages = [];

            if (this.hasFilenameError) {
                errorMessages.push(`File name can't be blank.`);
            }

            if (this.hasFpsError) {
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
                    this.hasFpsError ||
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
        // needs to be watch instead of computed value,
        // since saveImageFileName needs to be data property for v-model
        sourceFileName(newValue) {
            this.saveImageFileName = getFilenameWithoutExtension(newValue);
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
        saveImageFileTypeValue(newValue) {
            userSettings.saveExportSettings({
                fileType: newValue,
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
        correctSaveImageFileTypeValue() {
            const fileType = this.saveImageFileTypes.find(
                fileType => fileType.value === this.saveImageFileTypeValue
            );

            if (!fileType) {
                this.saveImageFileTypeValue = this.saveImageFileTypes[0].value;
            }
        },
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
                    this.videoExportFilename =
                        this.saveImageFileName + this.videoFileExtension;
                    if (
                        this.currentInputFileType === this.inputFileTypes.VIDEO
                    ) {
                        return this.videoExportRequested(this.videoFps);
                    } else {
                        return this.onSubmitBatchConvertImages(
                            BATCH_IMAGE_MODE_EXPORT_VIDEO
                        );
                    }
                default:
                    return this.saveImage();
            }
        },
        //downloads image
        //based on: https://stackoverflow.com/questions/30694433/how-to-give-browser-save-image-as-option-to-button
        saveImage() {
            return new Promise(resolve => {
                if (this.isCurrentlySavingImage) {
                    return resolve();
                }
                this.isCurrentlySavingImage = true;
                this.saveRequested(
                    saveImageCanvas,
                    (sourceCanvas, unsplash) => {
                        saveImage(
                            sourceCanvas.canvas,
                            this.saveImageFileType.mime,
                            objectUrl => {
                                saveImageLink.href = objectUrl;
                                saveImageLink.download =
                                    this.saveImageFileName +
                                    this.saveImageFileType.extension;
                                saveImageLink.click();

                                //clear the canvas to free up memory
                                Canvas.clear(saveImageCanvas);
                                //follow Unsplash API guidelines for triggering download
                                //https://medium.com/unsplash/unsplash-api-guidelines-triggering-a-download-c39b24e99e02
                                if (unsplash) {
                                    //arguably should be POST request here, but much easier to just use GET
                                    fetch(
                                        `${UNSPLASH_DOWNLOAD_URL}?${UNSPLASH_API_PHOTO_ID_QUERY_KEY}=${unsplash.id}`
                                    );
                                }
                                this.isCurrentlySavingImage = false;
                                resolve();
                            }
                        );
                    }
                );
            });
        },
        saveImageToFfmpeg(ffmpeg) {
            return new Promise(resolve => {
                if (this.isCurrentlySavingImage) {
                    return resolve();
                }
                this.isCurrentlySavingImage = true;
                this.saveRequested(
                    saveImageCanvas,
                    (sourceCanvas, unsplash) => {
                        canvasToArray(
                            sourceCanvas.canvas,
                            ffmpegImageFileType.mime
                        )
                            .then(array =>
                                saveImageFrame(
                                    ffmpeg,
                                    this.saveImageFileName +
                                        ffmpegImageFileType.extension,
                                    array
                                )
                            )
                            .then(() => {
                                //clear the canvas to free up memory
                                Canvas.clear(saveImageCanvas);
                                this.isCurrentlySavingImage = false;
                                resolve();
                            });
                    }
                );
            });
        },
        exportVideoFromFrames(ffmpeg) {
            const exportFilename = this.videoExportFilename;

            return new Promise(resolve => {
                exportFramesToVideo(ffmpeg, exportFilename, this.videoFps).then(
                    data => {
                        arrayToObjectUrl(data, objectUrl => {
                            saveImageLink.href = objectUrl;
                            saveImageLink.download = exportFilename;
                            saveImageLink.click();
                            resolve();
                        });
                    }
                );
            });
        },
    },
};
</script>
