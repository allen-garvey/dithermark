<template>
    <div class="dither-controls-container controls-panel">
        <histogram ref="histogram" />
        <dither-button 
            :on-click="ditherImageWithSelectedAlgorithm"
            v-if="!isLivePreviewEnabled"
        />
        <algorithm-select 
            v-model="selectedDitherAlgorithmIndex"
            :ditherAlgorithms="ditherAlgorithms"
            ditherGroupKey="bwDitherGroups"
        />
        <threshold-input 
            v-model="threshold"
        />
        <color-substitution-input
            v-model="colorReplaceColors"
            :isColorPickerLivePreviewEnabled="isColorPickerLivePreviewEnabled"
        />
        <texture-combine 
            ref="textureCombineComponent" 
            :loaded-image="loadedImage" 
            :request-canvases="requestCanvases" :request-display-transformed-image="requestDisplayTransformedImage" :color-replace-black-pixel="colorReplaceBlackPixel" :color-replace-white-pixel="colorReplaceWhitePixel"
        />
    </div>
</template>

<script>
import { nextTick } from 'vue';

import Timer from 'app-performance-timer'; //symbol resolved in webpack config
import Canvas from '../canvas.js';
import Histogram from '../histogram.js';
import WebGl from '../webgl.js';
import WorkerHeaders from '../../shared/worker-headers.js';
import ColorPicker from '../color-picker.js';
import WebGlBwDither from '../webgl-bw-dither.js';
import WorkerUtil from '../worker-util.js';

import DitherButton from './dither-button.vue';
import ThresholdInput from './threshold-input.vue';
import HistogramComponent from './histogram-bw.vue';
import AlgorithmSelect from './algorithm-select.vue';
import ColorSubstitutionInput from './color-substitution-input.vue';
import TextureCombine from 'texture-combine-component'; //resolved via webpack config so not included in release builds

//used for creating BW texture for webgl color replace
let isDitherWorkerBwWorking = false;
let transformedImageBwTexture = null;

//canvas stuff
let histogramCanvas;
let histogramCanvasIndicator;

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
        ditherAlgorithms: {
            type: Array,
            required: true,
        },
        isWebglHighIntPrecisionSupported: {
            type: Boolean,
            required: true,
        },
    },
    components: {
        TextureCombine,
        DitherButton,
        ThresholdInput,
        Histogram: HistogramComponent,
        AlgorithmSelect,
        ColorSubstitutionInput,
    },
    mounted(){
        //have to get canvases here, because DOM manipulation needs to happen in mounted hook
        histogramCanvas = Canvas.create(this.$refs.histogram.histogramCanvas);
        histogramCanvasIndicator = Canvas.create(this.$refs.histogram.histogramCanvasIndicator);
    },
    data(){ 
        return{
            threshold: 127,
            selectedDitherAlgorithmIndex: 0,
            hasImageBeenTransformed: false,
            loadedImage: null,
            colorReplaceColors: ColorPicker.defaultBwColors(),
        };
    },
    computed: {
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
        threshold(){
            //reset bw texture
            this.freeTransformedImageBwTexture();
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
        //isNewImage is used to determine if the image is actually different,
        //or it is the same image with filters changed
        imageLoaded(loadedImage, isNewImage=false){
            const isFirstImageLoaded = this.loadedImage === null;
            this.loadedImage = loadedImage;
            this.hasImageBeenTransformed = false;
            
            //reset combine textures component if new image
            if(isNewImage && this.$refs.textureCombineComponent){
                nextTick().then(() => {
                    this.$refs.textureCombineComponent.resetTextures();
                });
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
        ditherWorkerMessageReceivedDispatcher(messageTypeId, message){
            switch(messageTypeId){
                case WorkerHeaders.DITHER:
                    this.ditherWorkerMessageReceived(message.pixels);
                    break;
                case WorkerHeaders.DITHER_BW:
                    this.ditherWorkerBwMessageReceived(message.pixels);
                    break;
                //histogram
                default:
                    this.histogramWorkerMessageReceived(message.pixels);
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
    }
};
</script>