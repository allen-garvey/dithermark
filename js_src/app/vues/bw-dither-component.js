import Vue from 'vue';
import Timer from 'app-performance-timer'; //symbol resolved in webpack config
import Canvas from '../canvas.js';
import Histogram from '../histogram.js';
import WebGl from '../webgl.js';
import AlgorithmModel from '../../generated_output/app/algorithm-model.js';
import WorkerHeaders from '../../shared/worker-headers.js';
import ColorPicker from '../color-picker.js';
import WebGlBwDither from '../webgl-bw-dither.js';
import WorkerUtil from '../worker-util.js';

import CyclePropertyList from './cycle-property-list-component.vue';
import ColorPickerComponent from './color-picker-component.js';
import ColorInput from './color-input-component.vue';
import TextureCombineComponent from './texture-combine-component.vue';


//used for creating BW texture for webgl color replace
let isDitherWorkerBwWorking = false;
let transformedImageBwTexture = null;

//canvas stuff
let histogramCanvas;
let histogramCanvasIndicator;

export default {
    name: 'bw-dither-section',
    template: document.getElementById('bw-dither-component'),
    props: ['isWebglEnabled', 'isLivePreviewEnabled', 'isColorPickerLivePreviewEnabled', 'requestCanvases', 'requestDisplayTransformedImage', 'ditherAlgorithms'],
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
        colorReplaceColors(newValue){
            this.colorReplaceColorsChanged();
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
            Vue.set(this.colorReplaceColors, this.colorPickerColorIndex, colorHex);
        },
        colorPickerOk(selectedColorHex){
            //this will be true when color picker live update is disabled and the color has been changed
            if(this.colorReplaceColors[this.colorPickerColorIndex] !== selectedColorHex){
                Vue.set(this.colorReplaceColors, this.colorPickerColorIndex, selectedColorHex);
            }
            this.shouldShowColorPicker = false;
        },
        colorPickerCanceled(previousColorHex){
            if(this.hasColorPickerChangedTheColor){
                Vue.set(this.colorReplaceColors, this.colorPickerColorIndex, previousColorHex);
            }
            this.shouldShowColorPicker = false;
        },
    }
};