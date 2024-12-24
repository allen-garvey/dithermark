<template>
    <div class="app-container" :class="{ [$style.imageLoaded]: isImageLoaded }">
        <alerts ref="alertsContainer" :is-webgl-enabled="isWebglEnabled" :loaded-image="loadedImage" />
        <hint-container :image-opened="loadImage" :open-image-error="onOpenImageError" v-if="!isImageLoaded" />
        <div :class="$style.controls">
            <div ref="controlsContainer" :class="$style.controlsContainer">
                <batch-convert-overlay v-if="isBatchConverting" :batch-convert-state="batchConvertState"
                    :batchImageMode="batchImageMode" :current-file-name="loadedImage.fileName"
                    :batch-images-left="batchImageQueue.length" :batch-image-count="batchImageCount"
                    :video-convert-percentage="ffmpegPercentage" />
                <div :class="{ 'no-image': !isImageLoaded }" class="global-controls-panel controls-panel">
                    <tabs :activeTabIndex="activeControlsTab" :tabs="globalControlsTabs" />
                    <!-- Global controls tabs bodies -->
                    <!-- Open tab -->
                    <open-tab :image-opened="loadImage" :onBatchFilesSelected="loadBatchImages"
                        :open-image-error="onOpenImageError" :request-modal="showModalPrompt"
                        :is-batch-convert-enabled="isBatchConvertEnabled" :getFfmpegReady="getFfmpegReady"
                        :isFfmpegReady="isFfmpegReady" :automaticallyResizeLargeImages="automaticallyResizeLargeImages"
                        :isPixelatedActualSize="isImagePixelated && !shouldUpsample" v-show="activeControlsTab === 0" />
                    <!-- Image tab -->
                    <div v-show="activeControlsTab === 1">
                        <div class="controls-tab-container">
                            <div>
                                <checkbox label="Show source image"
                                    tooltip="Display the original image next to the dithered image"
                                    v-model="showOriginalImage" />
                            </div>
                            <fieldset>
                                <legend>Filters <small>(pre dither)</small></legend>
                                <div class="spread-content">
                                    <div class="label-align">
                                        <label for="pixelate-dropdown">Pixelate</label>
                                        <select id="pixelate-dropdown" v-model.number="selectedPixelateImageZoom">
                                            <option v-for="(pixelateZoom, index) in pixelateImageZooms" :value="index"
                                                :key="index">{{ imageFilterSteppedDropdownOption(index) }}</option>
                                        </select>
                                    </div>
                                    <cycle-property-list model-name="pixelation value"
                                        v-model="selectedPixelateImageZoom" :array-length="pixelateImageZooms.length" />
                                </div>
                                <div class="spread-content" v-if="areCanvasFiltersEnabled">
                                    <div class="label-align">
                                        <label for="brightness-dropdown">Brightness</label>
                                        <select id="brightness-dropdown" v-model.number="selectedImageBrightnessIndex">
                                            <option v-for="(percentage, index) in canvasFilterValues" :value="index"
                                                :key="index">{{ `${percentage}%` }}</option>
                                        </select>
                                    </div>
                                    <cycle-property-list model-name="brightness percentage"
                                        v-model="selectedImageBrightnessIndex"
                                        :array-length="canvasFilterValues.length" />
                                </div>
                                <div class="spread-content" v-if="areCanvasFiltersEnabled">
                                    <div class="label-align">
                                        <label for="contrast-dropdown">Contrast</label>
                                        <select id="contrast-dropdown" v-model.number="selectedImageContrastIndex">
                                            <option v-for="(percentage, index) in canvasFilterValues" :value="index"
                                                :key="index">{{ `${percentage}%` }}</option>
                                        </select>
                                    </div>
                                    <cycle-property-list model-name="contrast percentage"
                                        v-model="selectedImageContrastIndex"
                                        :array-length="canvasFilterValues.length" />
                                </div>
                                <div class="spread-content" v-if="areCanvasFiltersEnabled">
                                    <div class="label-align">
                                        <label for="saturation-dropdown">Saturation</label>
                                        <select id="saturation-dropdown" v-model.number="selectedImageSaturationIndex">
                                            <option v-for="(percentage, index) in canvasFilterValues" :value="index"
                                                :key="index">{{ `${percentage}%` }}</option>
                                        </select>
                                    </div>
                                    <cycle-property-list model-name="saturation percentage"
                                        v-model="selectedImageSaturationIndex"
                                        :array-length="canvasFilterValues.length" />
                                </div>
                                <div class="spread-content" v-if="areCanvasFiltersEnabled">
                                    <label for="hue-rotation-range">Hue rotation</label>
                                    <input id="hue-rotation-range" type="range" list="hue-rotation-tickmarks"
                                        v-model.number="hueRotationValue" step="1" min="0" max="359" />
                                    <input type="number" v-model.number="hueRotationValue" step="1" min="0" max="359" />
                                    <datalist id="hue-rotation-tickmarks">
                                        <option v-for="i in 12" :value="(i - 1) * 30" :key="i" />
                                    </datalist>
                                </div>
                                <div class="spread-content" v-if="isWebglEnabled">
                                    <div class="label-align">
                                        <label for="denoise-before-dropdown">Denoise</label>
                                        <select id="denoise-before-dropdown"
                                            v-model.number="selectedBilateralFilterValueBefore">
                                            <option v-for="(value, index) in bilateralFilterValues" :value="index"
                                                :key="index">{{ imageFilterSteppedDropdownOption(index) }}</option>
                                        </select>
                                    </div>
                                    <cycle-property-list model-name="bilateral filter amount"
                                        v-model="selectedBilateralFilterValueBefore"
                                        :array-length="bilateralFilterValues.length" />
                                </div>
                                <div class="spread-content" v-if="isSmoothingEnabled">
                                    <div class="label-align">
                                        <label for="smoothing-before-dropdown">Smooth</label>
                                        <select id="smoothing-before-dropdown"
                                            v-model.number="selectedImageSmoothingRadiusBefore">
                                            <option v-for="(smoothingValue, index) in imageSmoothingValues"
                                                :value="index" :key="index">
                                                {{ imageFilterSteppedDropdownOption(smoothingValue) }}</option>
                                        </select>
                                    </div>
                                    <cycle-property-list model-name="smoothing value"
                                        v-model="selectedImageSmoothingRadiusBefore"
                                        :array-length="imageSmoothingValues.length" />
                                </div>
                            </fieldset>
                            <fieldset v-if="isWebglEnabled">
                                <legend>Filters <small>(post dither)</small></legend>
                                <div class="spread-content">
                                    <div class="label-align">
                                        <label for="denoise-after-dropdown">Denoise</label>
                                        <select id="denoise-after-dropdown"
                                            v-model.number="selectedBilateralFilterValueAfter">
                                            <option v-for="(value, index) in bilateralFilterValues" :value="index"
                                                :key="index">{{ imageFilterSteppedDropdownOption(index) }}</option>
                                        </select>
                                    </div>
                                    <cycle-property-list model-name="bilateral filter amount"
                                        v-model="selectedBilateralFilterValueAfter"
                                        :array-length="bilateralFilterValues.length" />
                                </div>
                                <div class="spread-content" v-if="isSmoothingEnabled">
                                    <div class="label-align">
                                        <label for="smoothing-after-dropdown">Smooth</label>
                                        <select id="smoothing-after-dropdown"
                                            v-model.number="selectedImageSmoothingRadiusAfter">
                                            <option v-for="(smoothingValue, index) in imageSmoothingValues"
                                                :value="index" :key="index">
                                                {{ imageFilterSteppedDropdownOption(smoothingValue) }}</option>
                                        </select>
                                    </div>
                                    <cycle-property-list model-name="smoothing value"
                                        v-model="selectedImageSmoothingRadiusAfter"
                                        :array-length="imageSmoothingValues.length" />
                                </div>
                            </fieldset>
                            <outline-filters-controls ref="outlineFilterControls" :display-image="zoomImage"
                                :is-image-outline-filter-enabled="isImageOutlineFilterEnabled"
                                :is-color-picker-live-preview-enabled="isColorPickerLivePreviewEnabled"
                                :request-outline-display="onOutlineFilterDisplayRequested"
                                :request-resources-for-outline="onResourcesForOutlineFilterRequested" />
                        </div>
                    </div>
                    <!-- Settings tab -->
                    <div v-show="activeControlsTab === 2">
                        <settings-tab :is-webgl-supported="isWebglSupported" :editor-themes="editorThemes"
                            v-model:current-editor-theme-index="currentEditorThemeIndex"
                            v-model:is-live-preview-enabled="isLivePreviewEnabled"
                            v-model:is-color-picker-live-preview-enabled-setting="isColorPickerLivePreviewEnabledSetting"
                            v-model:automatically-resize-large-images="automaticallyResizeLargeImages"
                            v-model:is-webgl-enabled="isWebglEnabled" />
                    </div>
                    <!-- Export tab -->
                    <export-tab :source-file-name="exportFileNameSource" :save-requested="onSaveRequested"
                        :is-image-pixelated="isImagePixelated" :shouldUpsample="shouldUpsample"
                        :setShouldUpsample="(value) => this.shouldUpsample = value" v-show="activeControlsTab === 3"
                        ref="exportTab" />
                </div>
                <div class="super-dither-controls-container" v-show="isImageLoaded">
                    <tabs :activeTabIndex="activeDitherComponentId" :tabs="ditherTabs" />
                    <div v-show="activeDitherComponentId === bwDitherComponentId">
                        <bw-dither-section ref="bwDitherSection" @request-worker="onWorkerRequested"
                            :request-canvases="requestPermissionCallbackBuilder(bwDitherComponentId, onCanvasesRequested)"
                            :request-display-transformed-image="requestPermissionCallbackBuilder(bwDitherComponentId, onRequestDisplayTransformedImage)"
                            :is-webgl-enabled="isWebglEnabled"
                            :is-live-preview-enabled="isLivePreviewEnabled || isBatchConverting"
                            :is-color-picker-live-preview-enabled="isColorPickerLivePreviewEnabled"
                            :isWebglHighIntPrecisionSupported="isWebglHighIntPrecisionSupported" />
                    </div>
                    <div v-show="activeDitherComponentId === colorDitherComponentId">
                        <color-dither-section ref="colorDitherSection" @request-worker="onWorkerRequested"
                            :request-canvases="requestPermissionCallbackBuilder(colorDitherComponentId, onCanvasesRequested)"
                            :request-display-transformed-image="requestPermissionCallbackBuilder(colorDitherComponentId, onRequestDisplayTransformedImage)"
                            :is-webgl-enabled="isWebglEnabled"
                            :is-live-preview-enabled="isLivePreviewEnabled || isBatchConverting"
                            :is-color-picker-live-preview-enabled="isColorPickerLivePreviewEnabled"
                            @request-modal-prompt="showModalPrompt"
                            :isWebglHighIntPrecisionSupported="isWebglHighIntPrecisionSupported" />
                    </div>
                </div>
            </div>
            <zoom-bar ref="zoomBar" v-show="isImageLoaded && !isBatchConverting"
                :show-original-image="showOriginalImage" :zoom-changed="zoomImage"
                :request-dimensions-for-zoom-fit="onDimensionsRequestedForZoomFit" />
        </div>
        <!-- //if unsplash-attribution component is not in extra div, it breaks dithering for some reason -->
        <div ref="unsplashAttributionContainer">
            <unsplash-attribution v-if="loadedImage && loadedImage.unsplash" :unsplash-info="loadedImage.unsplash" />
        </div>
        <image-canvas-supercontainer :showOriginalImage="showOriginalImage" v-show="isImageLoaded"
            ref="imageCanvasSupercontainer" />
        <modal-prompt ref="modalPromptComponent" />
    </div>
</template>

<style lang="scss" module>
.imageLoaded {
    padding-bottom: 154px;
}

.controls {
    display: flex;
    flex-direction: column;
    //22px to account for vertical scrollbar width
    max-width: calc(100vw - 22px);

    &,
    &>* {
        box-sizing: border-box;
    }
}

.controlsContainer {
    position: relative;
    @include mixins.background_color_transition;
    width: variables.$mobile_controls_width;
    max-width: 100%;
    padding: 0 variables.$global_horizontal_padding;
}

//styles for desktop
@include mixins.pinned_controls_mq {
    .controls {
        align-items: center;
    }

    .controlsContainer {
        position: fixed;
        z-index: 11;
        display: block;
        background-color: var(--pinned-controls-bg-color);
        max-width: 100%;
        max-height: 100%;
        top: 0;
        right: 0;
        overflow-y: scroll;
        box-sizing: border-box;
        width: variables.$pinned_dither_controls_width;
        padding: 0;
    }
}

//otherwise will overlap chrome scrollbars
@media all and (display-mode: fullscreen) {
    .controlsContainer {
        bottom: variables.$chrome_fullscreen_horizontal_scrollbar_height;

        body:-moz-full-screen & {
            bottom: 0;
        }
    }
}
</style>

<script>
/*
******************** Canvas Layers ******************************************
*  saveImageCanvas: used when saving image, so pixelated images are scaled correctly 
*  originalImageCanvas: original non-pixelated image loaded by user 
*  sourceCanvas: pixelated-image used as source to dithers 
*  transformCanvas: output from dither 
*  outlineFilterCanvas: saves merged output of image outline filter and transform canvas; used instead of transform canvas when outline filter is active 
*  transformCanvasWebgl: output from webgl, copied to transformCanvas because otherwise chrome will freak out when we change tabs 
*  ditherOutputCanvas: saves output from dither, before post dither filters 
* sourceCanvasOutput: original image as displayed to the user, after zoomed and pixelated 
* transformCanvasOutput: output from dither as shown to user, after zoom 
*/

import UserSettings from '../user-settings.js'
import Canvas from '../canvas.js';
import WorkerHeaders from '../../shared/worker-headers.js';
import WorkerUtil from '../worker-util.js';
import WebGl from '../webgl/webgl.js';
import EditorThemes, { DEFAULT_EDITOR_THEME_KEY } from '../models/editor-themes.js';
import WebGlSmoothing from '../webgl/webgl-smoothing.js';
import WebGlBilateralFilter from '../webgl/webgl-bilateral-filter.js';
import WebGlCanvasFilters from '../webgl/webgl-canvas-filters.js';
import ImageFiltersModel from '../models/image-filters.js';
import { getGlobalTabs } from '../models/global-tabs.js'
import { getDitherTabs } from '../models/dither-tabs.js'
import Fs from '../fs.js';
import { sleep } from '../util.js';

import CyclePropertyList from './cycle-property-list.vue';
import HintContainer from './hint-container.vue';
import Alerts from './alerts.vue';
import ExportTab from './export-tab.vue';
import OpenTab from './open-tab.vue';
import OutlineFiltersControls from './outline-filters-controls.vue';
import UnsplashAttribution from './unsplash-attribution.vue';
import ZoomBar from './zoom-bar.vue';
import ModalPrompt from './modal-prompt.vue';
import BwDitherSection from './bw-dither.vue';
import ColorDitherSection from './color-dither.vue';
import Tabs from './tabs.vue';
import ImageCanvasSupercontainer from './image-canvas-supercontainer.vue';
import SettingsTab from './settings-tab.vue';
import BatchConvertOverlay from './batch-convert-overlay.vue';
import Checkbox from './checkbox.vue';
import { isiOs } from '../cross-platform.js';
import { BATCH_IMAGE_MODE_EXPORT_IMAGES, BATCH_IMAGE_MODE_EXPORT_VIDEO } from '../models/batch-export-modes.js';
import { BATCH_CONVERT_STATE } from '../models/batch-convert-states.js';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { initializeFfmpeg } from '../ffmpeg.js';

const FFMPEG_STATES = {
    NEW: 0,
    LOADING: 1,
    READY: 2,
};

const ffmpeg = new FFmpeg();


//webworker stuff
let imageId = 0;
let ditherWorkers;

//canvases
let sourceCanvas;
let originalImageCanvas;
let transformCanvas;
let ditherOutputCanvas;
let transformCanvasWebGl;
let sourceCanvasOutput;
let transformCanvasOutput;

let sourceWebglTexture;
let ditherOutputWebglTexture;

//used to keep track of which tabs have loaded a new image to them, after an image is loaded
//this is because originally, only the active tab when an image is loaded will register it as new
const tabsThatHaveSeenImageSet = new Set();

export default {
    components: {
        CyclePropertyList,
        HintContainer,
        Alerts,
        ExportTab,
        OpenTab,
        OutlineFiltersControls,
        UnsplashAttribution,
        ZoomBar,
        ModalPrompt,
        BwDitherSection,
        ColorDitherSection,
        Tabs,
        ImageCanvasSupercontainer,
        SettingsTab,
        BatchConvertOverlay,
        Checkbox,
    },
    created() {
        WorkerUtil.getDitherWorkers().then((workers) => {
            ditherWorkers = workers;
            ditherWorkers.forEach((ditherWorker) => {
                ditherWorker.onmessage = this.workerMessageReceivedDispatcher;
            });
        });
        originalImageCanvas = Canvas.create();
        sourceCanvas = Canvas.create(null, { willReadFrequently: true });
        transformCanvas = Canvas.create();
        transformCanvasWebGl = Canvas.createWebgl();
        ditherOutputCanvas = Canvas.create();
        this.areCanvasFiltersSupported = Canvas.areCanvasFiltersSupported(originalImageCanvas);
        //check for webgl support
        if (transformCanvasWebGl.gl) {
            this.isWebglSupported = true;
            this.isWebglHighpFloatSupported = transformCanvasWebGl.supportsHighFloatPrecision;
            this.isWebglHighIntPrecisionSupported = transformCanvasWebGl.supportsHighIntPrecision;
        }

        ffmpeg.on('log', ({ message }) => {
            console.log(message);
            if (this.batchConvertState === BATCH_CONVERT_STATE.FRAMES_TO_VIDEO && /^frame=\s+\d+/.test(message)) {
                const currentFrame = parseInt(message.replace(/^frame=\s+/, '').replace(/\s.*$/, ''));
                const percentage = isNaN(currentFrame) ? 0 : Math.floor(currentFrame / this.batchImageCount * 100);
                // don't show 100%, because even on the last frame ffmpeg still has work to do
                this.ffmpegPercentage = percentage === 100 ? 99.9 : percentage;
            }
        });
    },
    mounted() {
        const refs = this.$refs;
        sourceCanvasOutput = Canvas.create(refs.imageCanvasSupercontainer.sourceCanvasOutput);
        transformCanvasOutput = Canvas.create(refs.imageCanvasSupercontainer.transformCanvasOutput);

        //have to set alertsContainer property here, since it does not exist yet in created hook
        if (this.isWebglSupported) {
            this.$refs.alertsContainer.webglMaxTextureSize = transformCanvasWebGl.maxTextureSize;
        }

        //load global settings
        const globalSettings = UserSettings.getGlobalSettings(this.areControlsPinned());
        this.currentEditorThemeIndex = EditorThemes.indexForKey(this.editorThemes, globalSettings.editorThemeKey);
        this.showOriginalImage = globalSettings.showOriginalImage;
        this.isLivePreviewEnabled = globalSettings.isLivePreviewEnabled;
        this.isColorPickerLivePreviewEnabledSetting = globalSettings.isColorPickerLivePreviewEnabled;
        this.automaticallyResizeLargeImages = globalSettings.automaticallyResizeLargeImages;
        this.isWebglEnabled = this.isWebglSupported && globalSettings.isWebglEnabled;

        //should be last statement of mounted function
        this.finishedInitialization = true;
    },
    data() {
        return {
            bwDitherComponentId: 0,
            colorDitherComponentId: 1,
            activeDitherComponentId: 1,
            activeControlsTab: 0,
            //loadedImage has properties: width, height, fileName, fileType, and optionally unsplash info
            loadedImage: null,
            /**
             * Batch convert
             */
            batchImageQueue: [],
            batchImageCount: 0,
            batchImageMode: BATCH_IMAGE_MODE_EXPORT_IMAGES,
            batchConvertState: BATCH_CONVERT_STATE.NONE,
            ffmpegPercentage: 0,
            ffmpegState: FFMPEG_STATES.NEW,
            videoExportOptions: null,
            /**
             * Color picker
             */
            isLivePreviewEnabled: true,
            isColorPickerLivePreviewEnabledSetting: false,
            automaticallyResizeLargeImages: true,
            /**
             * Webgl
             */
            isWebglSupported: false,
            isWebglEnabled: false,
            isWebglHighpFloatSupported: false,
            isWebglHighIntPrecisionSupported: false,
            /**
             * Export settings
             */
            exportFileNameSource: '',
            shouldUpsample: true,
            /**
             * Filters
             */
            //pixelation
            selectedPixelateImageZoom: 0,
            //smoothing
            imageSmoothingValues: ImageFiltersModel.smoothingValues,
            selectedImageSmoothingRadiusBefore: 0,
            selectedImageSmoothingRadiusAfter: 0,
            //bilateral filter
            bilateralFilterValues: ImageFiltersModel.bilateralFilterValues,
            selectedBilateralFilterValueBefore: 0,
            selectedBilateralFilterValueAfter: 0,
            //pre dither filters
            canvasFilterValues: ImageFiltersModel.canvasFilterValues,
            selectedImageSaturationIndex: ImageFiltersModel.canvasFilterValuesDefaultIndex,
            selectedImageContrastIndex: ImageFiltersModel.canvasFilterValuesDefaultIndex,
            selectedImageBrightnessIndex: ImageFiltersModel.canvasFilterValuesDefaultIndex,
            hueRotationValue: 0,
            areCanvasFiltersSupported: false, //required for increasing image contrast and saturation
            //user settings
            showOriginalImage: true,
            editorThemes: EditorThemes.get(),
            currentEditorThemeIndex: 0,
            //used so we know when component is done initializing,
            //so we don't do any spurious saving of global setting changes
            //done by initialization rather than user
            finishedInitialization: false,
        };
    },
    computed: {
        /**
         * Batch convert
         */
        isBatchConvertEnabled() {
            return this.isImageLoaded && !isiOs();
        },
        isBatchConverting() {
            return this.batchConvertState !== BATCH_CONVERT_STATE.NONE;
        },
        isFfmpegReady() {
            return this.ffmpegState === FFMPEG_STATES.READY;
        },
        /**
         * Tabs
         */
        globalControlsTabs() {
            const clicked = (tabIndex) => this.activeControlsTab = tabIndex;

            return getGlobalTabs(this.isImageLoaded, clicked);
        },
        ditherTabs() {
            return getDitherTabs(this.loadDitherTab);
        },
        //the source canvas for transformed (dithered and filtered image)
        //before zoom
        transformedSourceCanvas() {
            if (this.$refs.outlineFilterControls.isImageOutlineFilterActive) {
                return this.$refs.outlineFilterControls.getCanvas();
            }
            return transformCanvas;
        },
        /**
         * Image outline filter stuff
         */
        isImageOutlineFilterEnabled() {
            //only enabled for color dither
            return this.isImageLoaded && this.isWebglEnabled && this.activeDitherComponentId === 1;
        },
        isColorPickerLivePreviewEnabled() {
            return this.isLivePreviewEnabled && this.isColorPickerLivePreviewEnabledSetting;
        },
        isImageLoaded() {
            return this.loadedImage != null;
        },
        imageHeader() {
            if (!this.isImageLoaded) {
                return null;
            }
            let width = Math.ceil(this.loadedImage.width * (this.pixelateImageZoom / 100));
            let height = Math.ceil(this.loadedImage.height * (this.pixelateImageZoom / 100));
            return {
                width: width,
                height: height,
                //filter values are used for color dither for optimize palette results caching
                //doesn't need the value of image smoothing after, since this happens after the dither completes
                pixelation: this.selectedPixelateImageZoom,
                contrast: this.selectedImageContrastIndex,
                saturation: this.selectedImageSaturationIndex,
                smoothing: this.selectedImageSmoothingRadiusBefore,
            };
        },
        activeDitherSection() {
            if (this.activeDitherComponentId === this.bwDitherComponentId) {
                return this.$refs.bwDitherSection;
            }
            return this.$refs.colorDitherSection;
        },
        pixelateImageZooms() {
            const dimensions = this.isImageLoaded ? this.loadedImage.height * this.loadedImage.width : 0;
            return ImageFiltersModel.pixelationValues(dimensions);
        },
        pixelateImageZoom() {
            return this.pixelateImageZooms[this.selectedPixelateImageZoom];
        },
        isImagePixelated() {
            return this.pixelateImageZoom !== 100;
        },
        imageFiltersRaw() {
            const filters = {};
            const contrast = this.canvasFilterValues[this.selectedImageContrastIndex];
            const saturation = this.canvasFilterValues[this.selectedImageSaturationIndex];
            const brightness = this.canvasFilterValues[this.selectedImageBrightnessIndex];
            const hue = Math.floor(this.hueRotationValue);
            //100% is unchanged
            if (contrast !== 100) {
                filters['contrast'] = contrast;
            }
            if (saturation !== 100) {
                filters['saturation'] = saturation;
            }
            if (brightness !== 100) {
                filters['brightness'] = brightness;
            }
            if (hue > 0 && hue < 360) {
                filters['hue'] = hue;
            }
            return filters;
        },
        imageFilters() {
            const filtersRaw = this.imageFiltersRaw;
            const filters = [];
            if ('contrast' in filtersRaw) {
                filters.push(`contrast(${filtersRaw.contrast}%)`);
            }
            if ('saturation' in filtersRaw) {
                filters.push(`saturate(${filtersRaw.saturation}%)`);
            }
            if ('brightness' in filtersRaw) {
                filters.push(`brightness(${filtersRaw.brightness}%)`);
            }
            if ('hue' in filtersRaw) {
                filters.push(`hue-rotate(${filtersRaw.hue}deg)`);
            }
            return filters.join(' ');
        },
        isSmoothingEnabled() {
            return this.isWebglEnabled && this.isWebglHighpFloatSupported;
        },
        areCanvasFiltersEnabled() {
            return this.areCanvasFiltersSupported || this.isWebglEnabled;
        },
        serializedGlobalSettings() {
            const editorThemeKey = this.currentEditorThemeIndex === null ? DEFAULT_EDITOR_THEME_KEY : this.editorThemes[this.currentEditorThemeIndex].key;

            return {
                editorThemeKey,
                isWebglEnabled: this.isWebglEnabled,
                isLivePreviewEnabled: this.isLivePreviewEnabled,
                isColorPickerLivePreviewEnabled: this.isColorPickerLivePreviewEnabledSetting,
                automaticallyResizeLargeImages: this.automaticallyResizeLargeImages,
                showOriginalImage: this.showOriginalImage,
            };
        },
    },
    watch: {
        currentEditorThemeIndex(newThemeIndex, oldThemeIndex) {
            const classList = document.documentElement.classList;
            //need this for firefox full screen mode to work
            const classList2 = document.body.classList;
            //this will be null on original page load
            if (oldThemeIndex !== null) {
                const oldThemeClass = this.editorThemes[oldThemeIndex].className;
                classList.remove(oldThemeClass);
                classList2.remove(oldThemeClass);
            }
            const newThemeClass = this.editorThemes[newThemeIndex].className;
            classList.add(newThemeClass);
            classList2.add(newThemeClass);
        },
        serializedGlobalSettings(newValue) {
            if (this.finishedInitialization) {
                UserSettings.saveGlobalSettings(newValue);
            }
        },
        pixelateImageZoom(newValue, oldValue) {
            if (newValue !== oldValue) {
                this.imageFiltersBeforeDitherChanged();
            }
        },
        imageFilters() {
            if (this.isImageLoaded) {
                this.imageFiltersBeforeDitherChanged();
            }
        },
        selectedBilateralFilterValueBefore(newValue, oldValue) {
            if (this.isImageLoaded && newValue !== oldValue) {
                this.imageFiltersBeforeDitherChanged();
            }
        },
        selectedBilateralFilterValueAfter: function (newValue, oldValue) {
            if (this.isImageLoaded && newValue !== oldValue) {
                this.imageFiltersAfterDitherChanged();
            }
        },
        selectedImageSmoothingRadiusBefore(newValue, oldValue) {
            if (this.isImageLoaded && newValue !== oldValue) {
                this.imageFiltersBeforeDitherChanged();
            }
        },
        selectedImageSmoothingRadiusAfter(newValue, oldValue) {
            if (this.isImageLoaded && newValue !== oldValue) {
                this.imageFiltersAfterDitherChanged();
            }
        },
    },
    methods: {
        /*
        * Tabs
        */
        loadDitherTab(componentId) {
            if (componentId === this.activeDitherComponentId) {
                return;
            }
            this.activeDitherComponentId = componentId;
            if (this.isImageLoaded) {
                const hasSeenImage = tabsThatHaveSeenImageSet.has(this.activeDitherComponentId);
                tabsThatHaveSeenImageSet.add(this.activeDitherComponentId);
                this.activeDitherSection.imageLoaded(this.imageHeader, !hasSeenImage);
            }
        },
        /*
        * Loading and saving image stuff
        */
        onSaveRequested(exportCanvas, callback) {
            //scale canvas if pixelated
            const scale = this.isImagePixelated && this.shouldUpsample ? 100 / this.pixelateImageZoom : 1;
            //while technicaly we can just use transformedSourceCanvas directly if there is no pixelation
            //it makes the logic for clearing the canvas in export component easier
            //since we don't need to check if we are using transform canvas directly
            Canvas.copy(this.transformedSourceCanvas, exportCanvas, scale);

            callback(exportCanvas, this.loadedImage.unsplash);
        },
        loadBatchImages(files, batchImageMode, videoExportOptions = null) {
            this.batchConvertState = BATCH_CONVERT_STATE.PROCESSING_FRAMES;
            this.batchImageMode = batchImageMode;
            this.batchImageQueue = files;
            this.batchImageCount = files.length;
            this.videoExportOptions = videoExportOptions;
            this.ffmpegPercentage = 0;
            this.loadNextBatchImage();
        },
        batchProcessingCompleted() {
            if (this.batchImageMode === BATCH_IMAGE_MODE_EXPORT_VIDEO) {
                this.batchConvertState = BATCH_CONVERT_STATE.FRAMES_TO_VIDEO;
                this.$refs.exportTab.exportVideoFromFrames(ffmpeg, this.videoExportOptions)
                    .then(() => {
                        this.batchConvertState = BATCH_CONVERT_STATE.NONE;
                    });
            }
            else {
                this.batchConvertState = BATCH_CONVERT_STATE.NONE;
            }
        },
        loadNextBatchImage() {
            if (this.batchImageQueue.length === 0) {
                this.batchProcessingCompleted();
                return;
            }

            Fs.openImageFile(this.batchImageQueue[0]).then(([image, data]) => {
                if (!image) {
                    return this.onOpenImageError(data);
                }
                this.loadImage(image, data, { height: image.height, width: image.width });
            });
        },
        imageProcessingCompleted() {
            // export image if we are in batch processing mode
            if (this.batchImageQueue.length === 0) {
                return;
            }
            const action = this.batchImageMode === BATCH_IMAGE_MODE_EXPORT_VIDEO ? () => this.$refs.exportTab.saveImageToFfmpeg(ffmpeg) : () => this.$refs.exportTab.saveImage()
                .then(() => sleep(100));

            action()
                .then(() => {
                    this.batchImageQueue = this.batchImageQueue.slice(1);
                    this.loadNextBatchImage();
                });
        },
        getFfmpegReady() {
            if (this.ffmpegState !== FFMPEG_STATES.NEW) {
                return;
            }
            this.ffmpegState = FFMPEG_STATES.LOADING;
            initializeFfmpeg(ffmpeg)
                .then(() => this.ffmpegState = FFMPEG_STATES.READY);
        },
        /**
         * 
         * @param {ImageBitmap | HTMLVideoElement} image 
         * @param {Object} file 
         * @param {import('../canvas.js').Dimensions} dimensions
         */
        loadImage(image, file, dimensions) {
            const loadedImage = {
                ...dimensions,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                unsplash: file.unsplash || null,
            };
            this.exportFileNameSource = file.name;

            //resize large images if necessary
            const largeImageDimensionThreshold = 1200;
            const largestImageDimension = Math.max(loadedImage.width, loadedImage.height);
            if (this.automaticallyResizeLargeImages && largestImageDimension > largeImageDimensionThreshold) {
                const resizePercentage = largeImageDimensionThreshold / largestImageDimension;
                Canvas.loadImage(originalImageCanvas, image, dimensions, resizePercentage);
                loadedImage.width = originalImageCanvas.canvas.width;
                loadedImage.height = originalImageCanvas.canvas.height;
            }
            else {
                Canvas.loadImage(originalImageCanvas, image, dimensions);
            }
            originalImageCanvas.context.drawImage(originalImageCanvas.canvas, 0, 0);
            //finish loading image
            this.loadedImage = loadedImage;
            const zoomBar = this.$refs.zoomBar;
            //can't use reactive property, since it will be updated after this method finishes, so have to set manually
            zoomBar.image = loadedImage;
            zoomBar.zoomFit();
            this.imageFiltersBeforeDitherChanged(false);
            tabsThatHaveSeenImageSet.clear();
            tabsThatHaveSeenImageSet.add(this.activeDitherComponentId);
            this.activeDitherSection.imageLoaded(this.imageHeader, true);
            //this is so mobile users will actually be able to see that an image has loaded
            //have to use a timer since unsplashAttributionContainer won't be in proper place on initial page load
            if (!this.areControlsPinned()) {
                setTimeout(() => {
                    this.$refs.unsplashAttributionContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 1);
            }
        },
        imageFiltersBeforeDitherChanged(notifyDitherSection = true) {
            //apply filters
            this.imagePixelationChanged();
            if (this.isWebglEnabled) {
                //reset source texture
                transformCanvasWebGl.gl.deleteTexture(sourceWebglTexture);
                sourceWebglTexture = WebGl.createAndLoadTextureFromCanvas(transformCanvasWebGl.gl, sourceCanvas.canvas);
                if (!this.areCanvasFiltersSupported) {
                    this.applyWebGlCanvasFilters();
                }
                let hasImageBeenTransformed = false;
                hasImageBeenTransformed = this.bilateralFilterValueBeforeChanged() || hasImageBeenTransformed;
                hasImageBeenTransformed = this.imageSmoothingBeforeChanged() || hasImageBeenTransformed;

                if (hasImageBeenTransformed) {
                    sourceCanvas.context.drawImage(transformCanvasWebGl.canvas, 0, 0);
                }
            }

            //load image into the webworkers
            imageId = WorkerUtil.generateImageId(imageId);
            const buffer = Canvas.createSharedImageBuffer(sourceCanvas);
            const ditherWorkerMessage = WorkerUtil.createLoadImageMessage(imageId, this.imageHeader.width, this.imageHeader.height, buffer);
            ditherWorkers.forEach((ditherWorker) => {
                ditherWorker.postMessage(ditherWorkerMessage);
            });
            if (notifyDitherSection) {
                this.activeDitherSection.imageLoaded(this.imageHeader);
            }
        },
        applyWebGlCanvasFilters() {
            const filters = this.imageFiltersRaw;
            //don't do anything if filters are all invalid or at defaults
            if (Object.keys(filters).length < 1) {
                return;
            }
            const imageHeader = this.imageHeader;
            WebGlCanvasFilters.filter(transformCanvasWebGl.gl, sourceWebglTexture, imageHeader.width, imageHeader.height, filters.contrast, filters.saturation, filters.brightness, filters.hue);
            sourceCanvas.context.drawImage(transformCanvasWebGl.canvas, 0, 0);
            transformCanvasWebGl.gl.deleteTexture(sourceWebglTexture);
            sourceWebglTexture = WebGl.createAndLoadTextureFromCanvas(transformCanvasWebGl.gl, sourceCanvas.canvas);
        },
        imagePixelationChanged() {
            const imageHeader = this.imageHeader;
            const scaleAmount = this.pixelateImageZoom / 100;
            const filters = this.areCanvasFiltersSupported ? this.imageFilters : '';
            Canvas.copy(originalImageCanvas, sourceCanvas, scaleAmount, filters);
            Canvas.copy(originalImageCanvas, transformCanvas, scaleAmount, filters);

            if (this.isWebglSupported) {
                transformCanvasWebGl.canvas.width = imageHeader.width;
                transformCanvasWebGl.canvas.height = imageHeader.height;
                transformCanvasWebGl.gl.deleteTexture(sourceWebglTexture);
                sourceWebglTexture = WebGl.createAndLoadTextureFromCanvas(transformCanvasWebGl.gl, sourceCanvas.canvas);
            }
            //we have to unset hue-rotate here, otherwise it will remain set for some reason even though other filters reset
            //sourceCanvas filter needs to be reset after webgl texture is created, otherwise results of the filter won't be saved in the texture
            if (this.areCanvasFiltersSupported && transformCanvas.context.filter) {
                transformCanvas.context.filter = 'hue-rotate(0deg)';
                sourceCanvas.context.filter = 'hue-rotate(0deg)';
            }
        },
        bilateralFilterValueBeforeChanged() {
            const filterExponent = this.bilateralFilterValues[this.selectedBilateralFilterValueBefore];
            if (filterExponent < 0) {
                return false;
            }
            const imageHeader = this.imageHeader;
            sourceWebglTexture = WebGlBilateralFilter.filterImage(transformCanvasWebGl, sourceWebglTexture, imageHeader.width, imageHeader.height, filterExponent);
            return true;
        },
        //image smoothing after pixelation, before dither
        imageSmoothingBeforeChanged() {
            const smoothingRadius = this.imageSmoothingValues[this.selectedImageSmoothingRadiusBefore];
            if (!this.isSmoothingEnabled || smoothingRadius <= 0) {
                return false;
            }
            const imageHeader = this.imageHeader;
            //smoothing
            WebGlSmoothing.smooth(transformCanvasWebGl.gl, sourceWebglTexture, imageHeader.width, imageHeader.height, smoothingRadius);
            transformCanvasWebGl.gl.deleteTexture(sourceWebglTexture);
            sourceWebglTexture = WebGl.createAndLoadTextureFromCanvas(transformCanvasWebGl.gl, transformCanvasWebGl.canvas);

            return true;
        },
        //image smoothing after dither
        imageSmoothingAfterChanged() {
            const smoothingRadius = this.imageSmoothingValues[this.selectedImageSmoothingRadiusAfter];
            if (!this.isSmoothingEnabled || smoothingRadius <= 0) {
                return false;
            }
            const imageHeader = this.imageHeader;
            //smoothing
            WebGlSmoothing.smooth(transformCanvasWebGl.gl, ditherOutputWebglTexture, imageHeader.width, imageHeader.height, smoothingRadius);
            return true;
        },
        bilateralFilterValueAfterChanged() {
            const filterExponent = this.bilateralFilterValues[this.selectedBilateralFilterValueAfter];
            if (filterExponent < 0) {
                return false;
            }
            const imageHeader = this.imageHeader;
            ditherOutputWebglTexture = WebGlBilateralFilter.filterImage(transformCanvasWebGl, ditherOutputWebglTexture, imageHeader.width, imageHeader.height, filterExponent);

            return true;
        },
        imageFiltersAfterDitherChanged() {
            if (!this.isWebglSupported) {
                return;
            }
            transformCanvasWebGl.gl.deleteTexture(ditherOutputWebglTexture);
            ditherOutputWebglTexture = WebGl.createAndLoadTextureFromCanvas(transformCanvasWebGl.gl, ditherOutputCanvas.canvas);
            let hasImageBeenTransformed = false;
            hasImageBeenTransformed = this.bilateralFilterValueAfterChanged() || hasImageBeenTransformed;
            hasImageBeenTransformed = this.imageSmoothingAfterChanged() || hasImageBeenTransformed;
            if (hasImageBeenTransformed) {
                Canvas.copy(transformCanvasWebGl, transformCanvas);
            }
            else {
                //reset output when no filters active
                Canvas.copy(ditherOutputCanvas, transformCanvas);
            }
            //reset the outline, since it needs to be merged with transformCanvas
            this.$refs.outlineFilterControls.imageOutlineFilterAction();
            this.zoomImage();
        },
        onOutlineFilterDisplayRequested(callback) {
            callback(transformCanvas, transformCanvasWebGl);
        },
        onResourcesForOutlineFilterRequested(callback) {
            const imageWidth = this.imageHeader.width;
            const imageHeight = this.imageHeader.height;
            callback(imageWidth, imageHeight, sourceWebglTexture, ditherOutputWebglTexture, transformCanvasWebGl, this.$refs.colorDitherSection.selectedColorsVec);
        },
        areControlsPinned() {
            return getComputedStyle(this.$refs.controlsContainer).getPropertyValue('position') === 'fixed';
        },
        /**
         * Zoom stuff
         */
        zoomImage() {
            const scaleAmount = this.$refs.zoomBar.zoom / this.pixelateImageZoom;
            Canvas.copy(sourceCanvas, sourceCanvasOutput, scaleAmount);
            Canvas.copy(this.transformedSourceCanvas, transformCanvasOutput, scaleAmount);
        },
        onDimensionsRequestedForZoomFit(callback) {
            const areControlsPinned = this.areControlsPinned();
            const controlsContainerWidth = areControlsPinned ? this.$refs.controlsContainer.offsetWidth : 0;
            const canvasMargin = this.showOriginalImage ? parseInt(getComputedStyle(this.$refs.imageCanvasSupercontainer.sourceCanvasOutput).getPropertyValue('margin-right').replace(/[\D]/, '')) : 0;

            callback(areControlsPinned, controlsContainerWidth, canvasMargin);
        },
        //webworker stuff
        workerMessageReceivedDispatcher(e) {
            const messageData = e.data;
            const messageImageId = messageData.imageId;
            //check for race condition where worker was working on old image
            if (messageImageId !== imageId) {
                return;
            }
            const messageTypeId = messageData.messageTypeId;
            switch (messageTypeId) {
                case WorkerHeaders.DITHER:
                case WorkerHeaders.DITHER_BW:
                case WorkerHeaders.HISTOGRAM:
                    this.$refs.bwDitherSection.ditherWorkerMessageReceivedDispatcher(messageTypeId, messageData);
                    break;
                default:
                    this.$refs.colorDitherSection.ditherWorkerMessageReceivedDispatcher(messageTypeId, messageData);
                    break;
            }
        },
        onRequestDisplayTransformedImage(componentId) {
            if (componentId === this.activeDitherComponentId) {
                if (this.isWebglEnabled) {
                    //copy output to ditherOutputCanvas so we don't lose it for post filter dithers
                    Canvas.copy(transformCanvas, ditherOutputCanvas);
                    this.imageFiltersAfterDitherChanged();
                }
                this.zoomImage();
                this.imageProcessingCompleted();
            }
        },
        onCanvasesRequested(componentId, callback) {
            if (componentId === this.activeDitherComponentId) {
                callback(transformCanvas, transformCanvasWebGl, sourceWebglTexture);
            }
        },
        //used to build callback functions for onRequestDisplayTransformedImage and onCanvasesRequested
        //so that requester is not aware of, and thus cannot change their componentId
        requestPermissionCallbackBuilder(componentId, callback) {
            return (...args) => {
                callback(componentId, ...args);
            };
        },
        onWorkerRequested(callback) {
            let worker = ditherWorkers.getNextWorker();
            callback(worker);
        },
        showModalPrompt(...modalPromptArgs) {
            this.$refs.modalPromptComponent.show(...modalPromptArgs);
        },
        /**
         * Open tab
         */
        onOpenImageError(errorMessage) {
            this.$refs.alertsContainer.openImageErrorMessage = errorMessage;
        },
        /**
         * Image tab
         */
        imageFilterSteppedDropdownOption(index, offValue = 0) {
            return index === offValue ? 'None' : index;
        },
    }
};
</script>