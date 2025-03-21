<template>
    <div class="dither-controls-container controls-panel">
        <histogram ref="histogram" />
        <dither-button
            :on-click="ditherImageWithSelectedAlgorithm"
            v-if="!isLivePreviewEnabled"
        />
        <algorithm-select
            v-model="selectedDitherAlgorithmIndex"
            :algorithmCount="ditherAlgorithms.length"
            :ditherGroups="ditherGroups"
        />
        <div class="spread-content">
            <label class="label">
                <span>Color comparison</span>
                <select v-model="selectedColorDitherModeIndex">
                    <option
                        v-for="(colorDitherMode, index) in colorDitherModes"
                        :value="index"
                        :key="index"
                    >
                        {{ colorDitherMode.title }}
                    </option>
                </select>
                <cycle-property-list
                    model-name="color mode"
                    v-model="selectedColorDitherModeIndex"
                    :array-length="colorDitherModes.length"
                />
            </label>
        </div>
        <color-palette-select
            v-model="selectedPaletteIndex"
            :palettes="palettes"
            :defaultPalettesLength="defaultPalettesLength"
        />
        <color-count-input v-model="numColors" />
        <fieldset>
            <legend>Color palette</legend>
            <color-picker
                v-if="shouldShowColorPicker"
                :should-live-update="isColorPickerLivePreviewEnabled"
                :selected-color="colorPickerSelectedColor"
                @update:modelValue="colorPickerValueChanged"
                @ok="colorPickerOk"
                @cancel="colorPickerCanceled"
            />
            <div
                :class="$style.colorsListContainer"
                @dragover="handleColorDragover"
            >
                <color-input
                    v-for="(color, i) in colors"
                    :key="i"
                    :on-click="createColorInputClicked(i)"
                    :is-selected="
                        shouldShowColorPicker && colorPickerColorIndex === i
                    "
                    :color-index.number="i"
                    :color-value="colorsShadow[i]"
                    :is-disabled="i >= numColors"
                    :dragged-index="draggedIndex"
                    :handle-color-dragstart="handleColorDragstart"
                    :handle-color-dragover="handleColorDragover"
                    :handle-color-dragend="handleColorDragend"
                />
            </div>
            <palette-buttons
                :colors="colors"
                :current-palette="currentPalette"
                :savePalette="savePalette"
                :delete-palette="deletePalette"
                :show-rename-palette="showRenamePalette"
            />
        </fieldset>
        <fieldset>
            <legend>Optimize palette</legend>
            <div
                class="spread-content"
                :class="$style.optimizePaletteControlsContainer"
            >
                <label class="label">
                    <span>Algorithm</span>
                    <select v-model="selectedColorQuantizationModeIndex">
                        <optgroup
                            v-for="colorQuantizationGroup in colorQuantizationGroups"
                            :label="colorQuantizationGroup.title"
                            :key="colorQuantizationGroup.title"
                        >
                            <option
                                v-for="colorQuantizationMode in colorQuantizationGroup.items"
                                :value="colorQuantizationMode.index"
                                :key="colorQuantizationMode.slug"
                            >
                                {{ colorQuantizationMode.title }}
                            </option>
                        </optgroup>
                    </select>
                </label>
                <cycle-property-list
                    model-name="optimize palette algorithm"
                    v-model="selectedColorQuantizationModeIndex"
                    :array-length="colorQuantizationModes.length"
                />
                <div :class="$style.optimizePalettePending">
                    {{ selectedColorQuantizationPendingMessage }}
                </div>
                <button
                    class="btn btn-primary btn-sm"
                    @click="optimizePalette"
                    :disabled="isSelectedColorQuantizationPending"
                    title="Optimize palette"
                >
                    Optimize
                </button>
            </div>
        </fieldset>
    </div>
</template>

<style lang="scss" module>
.colorsListContainer {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 13px;
}

.optimizePalettePending {
    color: var(--hint-text-color);
    font-size: 14px;
    min-width: 8em;
    max-width: 100%;
}

.optimizePaletteControlsContainer {
    //so 'optimize button is not cut off for phone size screens'
    max-width: calc(100vw - 44px);
}
</style>

<script>
import Timer from 'app-performance-timer'; //symbol resolved in webpack config
import { COLOR_DITHER_MAX_COLORS } from '../../../constants.js';
import { getColorQuantizationGroups } from '../models/color-quantization-modes.js';
import { getColorQuantizationModes } from '../../shared/models/color-quantization-modes.js';
import {
    getColorGroups,
    getColorDitherAlgorithms,
} from '../models/dither-algorithms.js';
import Palettes from '../models/color-palettes.js';
import UserSettings from '../user-settings.js';
import ColorDitherModes from '../../shared/color-dither-modes.js';
import Canvas from '../canvas.js';
import Histogram from '../histogram.js';
import WorkerHeaders from '../../shared/worker-headers.js';
import ColorPicker from '../color-picker.js';
import WorkerUtil from '../worker-util.js';

import CyclePropertyList from './cycle-property-list.vue';
import ColorPickerComponent from './color-picker.vue';
import ColorInput from './color-input.vue';
import PaletteButtons from './palette-buttons.vue';
import ColorCountInput from './color-count-input.vue';
import DitherButton from './dither-button.vue';
import AlgorithmSelect from './algorithm-select.vue';
import HistogramComponent from './histogram-color.vue';
import ColorPaletteSelect from './color-palette-select.vue';

//canvas stuff
let histogramCanvas;

//caching for optimize palette
let optimizedPalettes;

function optimizePaletteMemorizationKey(numColors, modeId) {
    return `${numColors}-${modeId}`;
}

export default {
    props: {
        isWebglEnabled: {
            type: Boolean,
            required: true,
        },
        isLivePreviewEnabled: {
            type: Boolean,
            required: true,
        },
        isColorPickerLivePreviewEnabled: {
            type: Boolean,
            required: true,
        },
        requestCanvases: {
            type: Function,
            required: true,
        },
        requestDisplayTransformedImage: {
            type: Function,
            required: true,
        },
        isWebglHighIntPrecisionSupported: {
            type: Boolean,
            required: true,
        },
    },
    components: {
        CyclePropertyList,
        'color-picker': ColorPickerComponent,
        ColorInput,
        PaletteButtons,
        ColorCountInput,
        DitherButton,
        AlgorithmSelect,
        Histogram: HistogramComponent,
        ColorPaletteSelect,
    },
    created() {
        //select first non-custom palette
        //needs to be done here to initialize palettes correctly
        this.selectedPaletteIndex = 1;
        this.numColors = COLOR_DITHER_MAX_COLORS;
        const defaultPalettes = Palettes.get(COLOR_DITHER_MAX_COLORS);
        this.defaultPalettesLength = defaultPalettes.length;
        this.palettes = defaultPalettes.concat(
            UserSettings.getPalettes(COLOR_DITHER_MAX_COLORS)
        );
    },
    mounted() {
        //have to get canvases here, because DOM manipulation needs to happen in mounted hook
        histogramCanvas = Canvas.create(this.$refs.histogram.histogramCanvas);
    },
    data() {
        const ditherAlgorithms = getColorDitherAlgorithms(
            this.isWebglHighIntPrecisionSupported
        );

        const selectedDitherAlgorithmIndex = ditherAlgorithms.findIndex(
            algo => algo.slug === 'ordered--bayer-16'
        );

        return {
            selectedDitherAlgorithmIndex,
            ditherGroups: getColorGroups(),
            ditherAlgorithms,
            loadedImage: null,
            colors: [],
            //colors shadow and draggedIndex are for dragging colors in palette
            colorsShadow: [],
            draggedIndex: null,
            palettes: [],
            defaultPalettesLength: 0,
            selectedPaletteIndex: null,
            numColors: null,
            colorDitherModes: [...ColorDitherModes.values()],
            selectedColorDitherModeIndex: 4,
            colorQuantizationGroups: getColorQuantizationGroups(),
            colorQuantizationModes: getColorQuantizationModes(),
            selectedColorQuantizationModeIndex: 0,
            pendingColorQuantizations: {},
            //for color picker
            shouldShowColorPicker: false,
            colorPickerColorIndex: 0,
            hasColorPickerChangedTheColor: false,
            selectedPaletteIndexBeforeColorPickerOpened: 0,
        };
    },
    computed: {
        colorPickerSelectedColor() {
            return this.colorsShadow[this.colorPickerColorIndex];
        },
        selectedDitherAlgorithm() {
            return this.ditherAlgorithms[this.selectedDitherAlgorithmIndex];
        },
        isSelectedAlgorithmWebGl() {
            return (
                this.isWebglEnabled && this.selectedDitherAlgorithm.webGlFunc
            );
        },
        isImageLoaded() {
            return this.loadedImage != null;
        },
        selectedColors() {
            return this.colors.slice(0, this.numColors);
        },
        selectedColorsVec() {
            return ColorPicker.colorsToVecArray(
                this.selectedColors,
                COLOR_DITHER_MAX_COLORS
            );
        },
        selectedColorDitherModeId() {
            return this.colorDitherModes[this.selectedColorDitherModeIndex].id;
        },
        isSelectedColorQuantizationPending() {
            if (!this.isImageLoaded) {
                return false;
            }
            const key = optimizePaletteMemorizationKey(
                this.numColors,
                this.selectedColorQuantizationModeIndex
            );
            return this.isOptimizePaletteKeyPending(key);
        },
        selectedColorQuantizationPendingMessage() {
            if (!this.isImageLoaded) {
                return '';
            }
            const key = optimizePaletteMemorizationKey(
                this.numColors,
                this.selectedColorQuantizationModeIndex
            );
            if (!this.isOptimizePaletteKeyPending(key)) {
                return '';
            }
            const percentage = this.pendingColorQuantizations[key];
            const messageBase = 'Working…';
            if (percentage <= 1) {
                return messageBase;
            }
            return `${messageBase} ${percentage}%`;
        },
        currentPalette() {
            return this.palettes[this.selectedPaletteIndex];
        },
    },
    watch: {
        isLivePreviewEnabled(newValue) {
            if (newValue) {
                this.ditherImageWithSelectedAlgorithm();
            }
        },
        selectedDitherAlgorithmIndex(newIndex) {
            if (this.isLivePreviewEnabled) {
                this.ditherImageWithSelectedAlgorithm();
            }
        },
        selectedColorQuantizationModeIndex() {
            if (this.isLivePreviewEnabled) {
                this.optimizePalette();
            }
        },
        numColors() {
            if (this.isLivePreviewEnabled) {
                this.ditherImageWithSelectedAlgorithm();
            }
        },
        colorsShadow: {
            deep: true,
            handler(newValue) {
                if (this.draggedIndex === null) {
                    this.colors = this.colorsShadow.slice();
                }
            },
        },
        colors(newValue, oldValue) {
            //don't dither image if colors changed are not enabled
            if (
                this.isLivePreviewEnabled &&
                !ColorPicker.areColorArraysIdentical(
                    newValue.slice(0, this.numColors),
                    oldValue.slice(0, this.numColors)
                )
            ) {
                this.ditherImageWithSelectedAlgorithm();
            }
            //set palette to custom if a color is changed
            if (
                !this.currentPalette.isCustom &&
                !ColorPicker.areColorArraysIdentical(
                    this.colors,
                    this.currentPalette.colors
                )
            ) {
                this.selectedPaletteIndex = 0;
            }
        },
        currentPalette(newValue) {
            if (!this.currentPalette.isCustom) {
                this.colorsShadow = this.currentPalette.colors.slice();
            }
        },
        selectedColorDitherModeIndex(newValue) {
            if (this.isLivePreviewEnabled) {
                this.ditherImageWithSelectedAlgorithm();
            }
        },
    },
    methods: {
        //isNewImage is used to determine if the image is actually different,
        //or it is the same image with filters changed
        imageLoaded(loadedImage, isNewImage = false) {
            this.loadedImage = loadedImage;

            //reset optimize palette cache
            //have to do this even if not a new image, since potential permutations
            //of image filters is too much to cache each possible value
            optimizedPalettes = {};
            this.pendingColorQuantizations = {};

            //draw histogram
            this.$emit('request-worker', worker => {
                worker.postMessage(WorkerUtil.colorHistogramWorkerHeader());
            });

            if (this.isLivePreviewEnabled) {
                this.ditherImageWithSelectedAlgorithm();
            } else {
                //if live preview is not enabled, transform canvas will be blank unless we do this
                this.requestDisplayTransformedImage();
            }
        },
        ditherImageWithSelectedAlgorithm() {
            if (!this.isImageLoaded) {
                return;
            }
            if (this.isSelectedAlgorithmWebGl) {
                this.requestCanvases(
                    (
                        transformCanvas,
                        transformCanvasWebGl,
                        sourceWebglTexture
                    ) => {
                        Timer.megapixelsPerSecond(
                            this.selectedDitherAlgorithm.title + ' webgl',
                            this.loadedImage.width * this.loadedImage.height,
                            () => {
                                this.selectedDitherAlgorithm.webGlFunc(
                                    transformCanvasWebGl.gl,
                                    sourceWebglTexture,
                                    this.loadedImage.width,
                                    this.loadedImage.height,
                                    this.selectedColorDitherModeId,
                                    this.selectedColorsVec,
                                    this.numColors
                                );
                            }
                        );
                        //have to copy to 2d context, since chrome will clear webgl context after switching tabs
                        //https://stackoverflow.com/questions/44769093/how-do-i-prevent-chrome-from-disposing-of-my-webgl-drawing-context-after-swit
                        transformCanvas.context.drawImage(
                            transformCanvasWebGl.canvas,
                            0,
                            0
                        );
                        this.requestDisplayTransformedImage();
                    }
                );
                return;
            }
            this.$emit('request-worker', worker => {
                worker.postMessage(
                    WorkerUtil.ditherWorkerColorHeader(
                        this.loadedImage.width,
                        this.loadedImage.height,
                        this.selectedDitherAlgorithm.index,
                        this.selectedColorDitherModeId,
                        this.selectedColors
                    )
                );
            });
        },
        ditherWorkerMessageReceivedDispatcher(messageTypeId, messageBody) {
            switch (messageTypeId) {
                case WorkerHeaders.DITHER_COLOR:
                    this.ditherWorkerMessageReceived(messageBody.pixels);
                    break;
                case WorkerHeaders.OPTIMIZE_PALETTE:
                    const colors = messageBody.colors;
                    const optimizePaletteKey = optimizePaletteMemorizationKey(
                        messageBody.numColors,
                        messageBody.colorQuantizationModeId
                    );
                    this.optimizePaletteMessageReceived(
                        colors,
                        optimizePaletteKey,
                        !this.colorQuantizationModes[
                            messageBody.colorQuantizationModeId
                        ].disableCache
                    );
                    break;
                case WorkerHeaders.OPTIMIZE_PALETTE_PROGRESS:
                    const key = optimizePaletteMemorizationKey(
                        messageBody.numColors,
                        messageBody.colorQuantizationModeId
                    );
                    //check to make sure still pending and not done first, to avoid race condition
                    if (this.isOptimizePaletteKeyPending(key)) {
                        this.pendingColorQuantizations[key] =
                            messageBody.percentage;
                    }
                    break;
                //histogram
                default:
                    this.histogramWorkerMessageReceived(messageBody.pixels);
                    break;
            }
        },
        optimizePaletteMessageReceived(colors, key, shouldCache) {
            //avoids race condition where image is changed before color quantization returns
            if (!this.isOptimizePaletteKeyPending(key)) {
                return;
            }
            const colorsHexArray = ColorPicker.pixelsToHexArray(colors);
            if (shouldCache) {
                optimizedPalettes[key] = colorsHexArray;
            }
            this.pendingColorQuantizations[key] = false;
            //avoids race conditions when color quantization mode or number of colors is changed before results return
            const currentKey = optimizePaletteMemorizationKey(
                this.numColors,
                this.selectedColorQuantizationModeIndex
            );
            if (key === currentKey) {
                this.changePaletteToOptimizePaletteResult(
                    colorsHexArray.slice()
                );
            }
        },
        changePaletteToOptimizePaletteResult(colorsHexArrayCopy) {
            //this is so if optimize palette result has less colors than max, we keep the colors that are already in the palette
            //at the end of the palette
            this.colorsShadow = colorsHexArrayCopy.concat(
                this.colorsShadow.slice(
                    colorsHexArrayCopy.length,
                    COLOR_DITHER_MAX_COLORS
                )
            );
        },
        histogramWorkerMessageReceived(huePercentages) {
            Histogram.drawColorHistogram(histogramCanvas, huePercentages);
        },
        ditherWorkerMessageReceived(pixels) {
            this.requestCanvases(transformCanvas => {
                Canvas.loadPixels(
                    transformCanvas,
                    this.loadedImage.width,
                    this.loadedImage.height,
                    pixels
                );
                this.requestDisplayTransformedImage();
            });
        },
        // Palettes
        optimizePalette() {
            const key = optimizePaletteMemorizationKey(
                this.numColors,
                this.selectedColorQuantizationModeIndex
            );
            if (this.isOptimizePaletteKeyPending(key)) {
                return;
            }
            if (optimizedPalettes[key]) {
                this.changePaletteToOptimizePaletteResult(
                    optimizedPalettes[key].slice()
                );
                return;
            }
            this.pendingColorQuantizations[key] = 0;
            this.$emit('request-worker', worker => {
                worker.postMessage(
                    WorkerUtil.optimizePaletteHeader(
                        this.numColors,
                        this.selectedColorQuantizationModeIndex
                    )
                );
            });
        },
        isOptimizePaletteKeyPending(key) {
            return typeof this.pendingColorQuantizations[key] === 'number';
        },
        savePalette() {
            this.palettes.push(
                Palettes.generateUserSavedPalette(
                    this.colors.slice(),
                    this.palettes.length - this.defaultPalettesLength + 1
                )
            );
            this.selectedPaletteIndex = this.palettes.length - 1;
            this.saveUserPalettes();
        },
        deletePalette() {
            //we change the selectedPaletteIndex to 0 first,
            //so that the current colors will persist after the palette is deleted
            const indexToDelete = this.selectedPaletteIndex;
            this.selectedPaletteIndex = 0;
            this.palettes.splice(indexToDelete, 1);
            this.saveUserPalettes();
        },
        showRenamePalette() {
            this.$emit(
                'request-modal-prompt',
                'Rename palette',
                'Palette name',
                this.currentPalette.title,
                this.renamePalette,
                { okButtonValue: 'Save' }
            );
        },
        renamePalette(newTitle) {
            this.currentPalette.title = newTitle;
            this.saveUserPalettes();
        },
        saveUserPalettes() {
            UserSettings.savePalettes(
                this.palettes.filter(palette => {
                    return palette.isSaved;
                })
            );
        },
        /**
         * Color palette drag stuff
         */
        handleColorDragstart(e, colorIndex) {
            this.draggedIndex = colorIndex;
        },
        //drag functions based on: https://www.w3schools.com/html/html5_draganddrop.asp
        handleColorDragover(e, colorIndex) {
            e.preventDefault();
            e.stopPropagation();
            //will be defined if we are over the container
            if (colorIndex === undefined) {
                return;
            }
            const swapIndex = colorIndex;

            if (this.draggedIndex != swapIndex) {
                const colorsCopy = this.colorsShadow.slice();
                const draggedColor = colorsCopy.splice(this.draggedIndex, 1)[0];
                colorsCopy.splice(swapIndex, 0, draggedColor);
                this.colorsShadow = colorsCopy;
                this.draggedIndex = swapIndex;
            }
        },
        //according to spec, must happen after drop
        handleColorDragend(e) {
            this.draggedIndex = null;

            //draggedIndex has to be null before resetting colorsShadow
            //need to do this to trigger refresh
            this.colorsShadow = this.colorsShadow.slice();
        },
        /**
         * Color picker functions
         */
        createColorInputClicked(colorIndex) {
            return () => {
                if (this.shouldShowColorPicker) {
                    return;
                }
                this.colorPickerColorIndex = colorIndex;
                this.hasColorPickerChangedTheColor = false;
                this.selectedPaletteIndexBeforeColorPickerOpened =
                    this.selectedPaletteIndex;
                this.shouldShowColorPicker = true;
            };
        },
        colorPickerValueChanged(colorHex) {
            this.hasColorPickerChangedTheColor = true;
            this.colorsShadow[this.colorPickerColorIndex] = colorHex;
        },
        colorPickerOk(selectedColorHex) {
            //this will be true when color picker live update is disabled and the color has been changed
            if (
                this.colorsShadow[this.colorPickerColorIndex] !==
                selectedColorHex
            ) {
                this.colorsShadow[this.colorPickerColorIndex] =
                    selectedColorHex;
            }
            this.shouldShowColorPicker = false;
        },
        colorPickerCanceled(previousColorHex) {
            //reset color palette if changed to custom
            if (
                this.selectedPaletteIndex !==
                this.selectedPaletteIndexBeforeColorPickerOpened
            ) {
                this.selectedPaletteIndex =
                    this.selectedPaletteIndexBeforeColorPickerOpened;
            }
            //if we were already on custom, but color was changed, we need to reset it as well
            else if (this.hasColorPickerChangedTheColor) {
                this.colorsShadow[this.colorPickerColorIndex] =
                    previousColorHex;
            }
            this.shouldShowColorPicker = false;
        },
    },
};
</script>
