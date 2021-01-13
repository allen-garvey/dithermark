<template>
    <div class="dither-controls-container controls-panel">
        <div class="histogram-container" :style="{width: histogramBwWidth, height: histogramHeight}">
            <canvas ref="histogramCanvasIndicator" class="histogram-canvas-indicator" :width="histogramBwWidth" :height="histogramHeight" title="Lightness histogram"></canvas>
            <canvas ref="histogramCanvas" class="histogram-canvas" :width="histogramBwWidth" :height="histogramHeight" title="Lightness histogram"></canvas>
        </div>
        <div class="transform-button-container">
            <button class="btn btn-success btn-sm" @click="ditherImageWithSelectedAlgorithm" v-show="!isLivePreviewEnabled">Dither</button>
        </div>
        <div class="spread-content">
            <label>Algorithm
                <select v-model="selectedDitherAlgorithmIndex">
                    <optgroup v-for="(ditherGroup, outerIndex) in ditherGroups" :label="ditherGroup.title" :key="outerIndex">
                        <option v-for="(ditherAlgorithm, index) in ditherAlgorithms.slice(ditherGroup.start, ditherGroup.start + ditherGroup.length)" :value="ditherGroup.start + index" :key="index">{{ ditherAlgorithm.title }}</option>
                    </optgroup>
                </select>
            </label>
            <cycle-property-list model-name="algorithm" v-model="selectedDitherAlgorithmIndex" :array-length="ditherAlgorithms.length" />
        </div>
        <div class="spread-content threshold-container">
            <label>
                Threshold
                <input type="range" :min="thresholdMin" :max="thresholdMax" v-model.number="threshold" list="threshold-tickmarks"/>
                <input type="number" :min="thresholdMin" :max="thresholdMax" v-model.number="threshold"/>
                <datalist id="threshold-tickmarks">
                    <option value="0"/>
                    <option value="63"/>
                    <option value="127"/>
                    <option value="191"/>
                    <option value="255"/>
                </datalist>
            </label>
        </div>
        <fieldset>
            <legend>Color substitution</legend>
            <color-picker 
            v-if="shouldShowColorPicker" 
            :should-live-update="isColorPickerLivePreviewEnabled" :selected-color="colorPickerSelectedColor" 
            @update:modelValue="colorPickerValueChanged" 
            @ok="colorPickerOk" 
            @cancel="colorPickerCanceled" />
            <div class="bw-color-replace-container">
                <color-input label="Black" id-prefix="bw" :is-selected="shouldShowColorPicker && colorPickerColorIndex===0" :on-click="createColorInputClicked(0)" :color-value="colorReplaceColors[0]" color-index.number="0" />
                <color-input label="White" id-prefix="bw" :is-selected="shouldShowColorPicker && colorPickerColorIndex===1" :on-click="createColorInputClicked(1)" :color-value="colorReplaceColors[1]" color-index.number="1" />
                <button class="btn btn-default btn-sm" @click="resetColorReplace" v-show="areColorReplaceColorsChangedFromDefaults" title="Reset colors to black and white">Reset</button>
            </div>
        </fieldset>
            <texture-combine ref="textureCombineComponent" :loaded-image="loadedImage" :request-canvases="requestCanvases" :request-display-transformed-image="requestDisplayTransformedImage" :color-replace-black-pixel="colorReplaceBlackPixel" :color-replace-white-pixel="colorReplaceWhitePixel"/>
    </div>
</template>


<script>
import Timer from 'app-performance-timer'; //symbol resolved in webpack config
import Constants from '../../generated_output/app/constants.js';
import Canvas from '../canvas.js';
import Histogram from '../histogram.js';
import WebGl from '../webgl.js';
import AlgorithmModel from '../../generated_output/app/algorithm-model.js';
import WorkerHeaders from '../../shared/worker-headers.js';
import ColorPicker from '../color-picker.js';
import WebGlBwDither from '../webgl-bw-dither.js';
import WorkerUtil from '../worker-util.js';

import CyclePropertyList from './cycle-property-list.vue';
import ColorPickerComponent from './color-picker.vue';
import ColorInput from './color-input.vue';
import TextureCombineComponent from 'texture-combine-component'; //resolved via webpack config so not included in release builds


//used for creating BW texture for webgl color replace
let isDitherWorkerBwWorking = false;
let transformedImageBwTexture = null;

//canvas stuff
let histogramCanvas;
let histogramCanvasIndicator;

export default {
    name: 'bw-dither-section',
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
        ditherAlgorithms: {
            type: Array,
            required: true,
        },
    },
    components: {
        CyclePropertyList,
        'color-picker': ColorPickerComponent,
        ColorInput,
        'texture-combine': TextureCombineComponent,
    },
    created(){
        this.resetColorReplace();
    },
    mounted(){
        //have to get canvases here, because DOM manipulation needs to happen in mounted hook
        histogramCanvas = Canvas.create(this.$refs.histogramCanvas);
        histogramCanvasIndicator = Canvas.create(this.$refs.histogramCanvasIndicator);
    },
    data(){ 
        return{
            threshold: 127,
            thresholdMin: 0,
            thresholdMax: 255,
            selectedDitherAlgorithmIndex: 0,
            hasImageBeenTransformed: false,
            ditherGroups: AlgorithmModel.bwDitherGroups,
            loadedImage: null,
            colorReplaceColors: [],
            //for color picker
            shouldShowColorPicker: false,
            colorPickerColorIndex: 0,
            hasColorPickerChangedTheColor: false,
            //histogram
            histogramBwWidth: Constants.histogramBwWidth+'px',
            histogramHeight: Constants.histogramHeight+'px',
        };
    },
    computed: {
        colorPickerSelectedColor(){
            return this.colorReplaceColors[this.colorPickerColorIndex];
        },
        selectedDitherAlgorithm(){
            return this.ditherAlgorithms[this.selectedDitherAlgorithmIndex];
        },
        isSelectedAlgorithmWebGl(){
            return this.isWebglEnabled && this.selectedDitherAlgorithm.webGlFunc;
        },
        colorReplaceBlackPixel(){
            return ColorPicker.pixelFromHex(this.colorReplaceColors[0]);
        },
        colorReplaceWhitePixel(){
            return ColorPicker.pixelFromHex(this.colorReplaceColors[1]);
        },
        areColorReplaceColorsChangedFromDefaults(){
            return this.colorReplaceColors[0] !== ColorPicker.COLOR_REPLACE_DEFAULT_BLACK_VALUE || this.colorReplaceColors[1] !== ColorPicker.COLOR_REPLACE_DEFAULT_WHITE_VALUE;
        },
        isImageLoaded(){
            return this.loadedImage != null;  
        },
    },
    watch: {
        isLivePreviewEnabled(newValue){
            if(newValue){
                this.ditherImageWithSelectedAlgorithm();
            }
        },
        threshold(newThreshold, oldThreshold){
            //reset bw texture
            this.freeTransformedImageBwTexture();
            
            let newThresholdCleaned = Math.floor(newThreshold);
            if(isNaN(newThresholdCleaned)){
                this.threshold = oldThreshold;
                return;
            }
            if(newThresholdCleaned < this.thresholdMin){
                newThresholdCleaned = this.thresholdMin;
            }
            else if(newThresholdCleaned > this.thresholdMax){
                newThresholdCleaned = this.thresholdMax;
            }
            if(oldThreshold === newThresholdCleaned){
                return;
            }
            if(newThresholdCleaned !== newThreshold){
                this.threshold = newThresholdCleaned;
                return;
            }
            
            Histogram.drawIndicator(histogramCanvasIndicator, this.threshold); 
            if(this.isLivePreviewEnabled){
                this.ditherImageWithSelectedAlgorithm();
            }
        },
        selectedDitherAlgorithmIndex(newIndex){
            //reset bw texture
            this.freeTransformedImageBwTexture();
            
            if(this.isLivePreviewEnabled){
                this.ditherImageWithSelectedAlgorithm();
            }
        },
        colorReplaceColors: {
            deep: true,
            handler(newValue){
                this.colorReplaceColorsChanged();
            }
        },
    },
    methods: {
        colorReplaceColorsChanged(){
            if(!this.hasImageBeenTransformed){
                return;
            }
            if(!this.isWebglEnabled || this.isSelectedAlgorithmWebGl){
                this.ditherImageWithSelectedAlgorithm();
                return;
            }
            
            //if we're here we know that webgl is enabled, and that the selected algorithm is NOT webgl
            //so send message to create BW texture if necessary
            if(!transformedImageBwTexture && !isDitherWorkerBwWorking){
                isDitherWorkerBwWorking = true;
                this.$emit('request-worker', (worker)=>{
                    worker.postMessage(WorkerUtil.ditherWorkerBwHeader(this.loadedImage.width, this.loadedImage.height, this.threshold, this.selectedDitherAlgorithm.id));
                });
                
            }
            //see if texture was created already, or has been created in time here
            if(!transformedImageBwTexture){
                this.ditherImageWithSelectedAlgorithm();
                return;
            }
            this.requestCanvases((transformCanvas, transformCanvasWebGl)=>{
                Timer.megapixelsPerSecond('Color replace webgl', this.loadedImage.width * this.loadedImage.height, ()=>{
                    WebGlBwDither.colorReplace(transformCanvasWebGl.gl, transformedImageBwTexture, this.loadedImage.width, this.loadedImage.height, this.colorReplaceBlackPixel, this.colorReplaceWhitePixel); 
                });
                transformCanvas.context.drawImage(transformCanvasWebGl.canvas, 0, 0);
                this.requestDisplayTransformedImage();
            });
        },
        resetColorReplace(){
            this.colorReplaceColors = [ColorPicker.COLOR_REPLACE_DEFAULT_BLACK_VALUE, ColorPicker.COLOR_REPLACE_DEFAULT_WHITE_VALUE];
        },
        //isNewImage is used to determine if the image is actually different,
        //or it is the same image with filters changed
        imageLoaded(loadedImage, isNewImage=false){
            const isFirstImageLoaded = this.loadedImage === null;
            this.loadedImage = loadedImage;
            this.hasImageBeenTransformed = false;
            
            //reset combine textures component if new image
            if(isNewImage && this.$refs.textureCombineComponent){
                this.$refs.textureCombineComponent.resetTextures();
            }

            //draw histogram
            this.$emit('request-worker', (worker)=>{
                worker.postMessage(WorkerUtil.histogramWorkerHeader());
            });
            
            this.freeTransformedImageBwTexture();
            
            if(this.isLivePreviewEnabled){
                this.ditherImageWithSelectedAlgorithm();   
            }
            else{
                //if live preview is not enabled, transform canvas will be blank unless we do this
                this.requestDisplayTransformedImage();
            }
            //only need to do this for first image loaded, since indicator won't be drawn yet
            if(isFirstImageLoaded){
                Histogram.drawIndicator(histogramCanvasIndicator, this.threshold);
            }
        },
        ditherImageWithSelectedAlgorithm(){
            if(!this.isImageLoaded){
                return;
            }
            if(this.isSelectedAlgorithmWebGl){
                this.requestCanvases((transformCanvas, transformCanvasWebGl, sourceWebglTexture)=>{
                    this.hasImageBeenTransformed = true;
                    Timer.megapixelsPerSecond(this.selectedDitherAlgorithm.title + ' webgl', this.loadedImage.width * this.loadedImage.height, ()=>{
                        this.selectedDitherAlgorithm.webGlFunc(transformCanvasWebGl.gl, sourceWebglTexture, this.loadedImage.width, this.loadedImage.height, this.threshold, this.colorReplaceBlackPixel, this.colorReplaceWhitePixel); 
                    });
                    //have to copy to 2d context, since chrome will clear webgl context after switching tabs
                    //https://stackoverflow.com/questions/44769093/how-do-i-prevent-chrome-from-disposing-of-my-webgl-drawing-context-after-swit
                    transformCanvas.context.drawImage(transformCanvasWebGl.canvas, 0, 0);
                    this.requestDisplayTransformedImage();
                });
                return;
            }
            this.$emit('request-worker', (worker)=>{
                worker.postMessage(WorkerUtil.ditherWorkerHeader(this.loadedImage.width, this.loadedImage.height, this.threshold, this.selectedDitherAlgorithm.id, this.colorReplaceBlackPixel, this.colorReplaceWhitePixel));
            });
        },
        ditherWorkerMessageReceivedDispatcher(messageTypeId, pixels){
            switch(messageTypeId){
                case WorkerHeaders.DITHER:
                    this.ditherWorkerMessageReceived(pixels);
                    break;
                case WorkerHeaders.DITHER_BW:
                    this.ditherWorkerBwMessageReceived(pixels);
                    break;
                //histogram
                default:
                    this.histogramWorkerMessageReceived(pixels);
                    break;
            }
        },
        histogramWorkerMessageReceived(heightPercentages){
            Histogram.drawBwHistogram(histogramCanvas, heightPercentages);
        },
        ditherWorkerMessageReceived(pixels){
            this.requestCanvases((transformCanvas)=>{
                this.hasImageBeenTransformed = true;
                Canvas.loadPixels(transformCanvas, this.loadedImage.width, this.loadedImage.height, pixels);
                this.requestDisplayTransformedImage(this.componentId);
            });
        },
        ditherWorkerBwMessageReceived(pixels){
            this.freeTransformedImageBwTexture();
            this.requestCanvases((transformCanvas, transformCanvasWebGl)=>{
                transformedImageBwTexture = WebGl.createAndLoadTextureFromArray(transformCanvasWebGl.gl, pixels, this.loadedImage.width, this.loadedImage.height);
            });
        },
        freeTransformedImageBwTexture(){
            if(!transformedImageBwTexture){
                return;
            }
            this.requestCanvases((transformCanvas, transformCanvasWebGl)=>{
                transformCanvasWebGl.gl.deleteTexture(transformedImageBwTexture);
            });
            //to avoid weird errors, we will do this reset the variables here, even if requestCanvases fails
            transformedImageBwTexture = null;
            isDitherWorkerBwWorking = false;
        },
        /**
         * Color replace color input/color picker stuff
         */
        createColorInputClicked(colorReplaceIndex){
            return ()=>{
                if(this.shouldShowColorPicker){
                    return;
                }
                this.colorPickerColorIndex = colorReplaceIndex;
                this.hasColorPickerChangedTheColor = false,
                this.shouldShowColorPicker = true;
            }
        },
        colorPickerValueChanged(colorHex){
            this.hasColorPickerChangedTheColor = true,
            this.colorReplaceColors[this.colorPickerColorIndex] = colorHex;
        },
        colorPickerOk(selectedColorHex){
            //this will be true when color picker live update is disabled and the color has been changed
            if(this.colorReplaceColors[this.colorPickerColorIndex] !== selectedColorHex){
                this.colorReplaceColors[this.colorPickerColorIndex] = selectedColorHex;
            }
            this.shouldShowColorPicker = false;
        },
        colorPickerCanceled(previousColorHex){
            if(this.hasColorPickerChangedTheColor){
                this.colorReplaceColors[this.colorPickerColorIndex] = previousColorHex;
            }
            this.shouldShowColorPicker = false;
        },
    }
};
</script>