import Vue from 'vue';
import Timer from 'app-performance-timer'; //symbol resolved in webpack config
import Constants from '../../generated_output/app/constants.js'
import AlgorithmModel from '../../generated_output/app/algorithm-model.js';
import ColorQuantizationModes from '../../generated_output/app/color-quantization-modes.js'
import Palettes from '../color-palettes.js';
import UserSettings from '../user-settings.js'
import ColorDitherModes from '../../shared/color-dither-modes.js'
import Canvas from '../canvas.js';
import Histogram from '../histogram.js';
import WorkerHeaders from '../../shared/worker-headers.js';
import ColorPicker from '../color-picker.js';
import WorkerUtil from '../worker-util.js';

import CyclePropertyList from './cycle-property-list-component.js';
import ColorPickerComponent from './color-picker-component.js';
import ColorInput from './color-input-component.js';
import PrintPaletteButton from './print-palette-button-component.js';


//canvas stuff
let histogramCanvas;

//caching for optimize palette
let optimizedPalettes;

function optimizePaletteMemorizationKey(numColors, modeId){
    return `${numColors}-${modeId}`;
}

export default {
    name: 'color-dither-section',
    template: document.getElementById('color-dither-component'),
    props: ['isWebglEnabled', 'isLivePreviewEnabled', 'isColorPickerLivePreviewEnabled', 'requestCanvases', 'requestDisplayTransformedImage', 'ditherAlgorithms'],
    components: {
        CyclePropertyList,
        'color-picker': ColorPickerComponent,
        ColorInput,
        PrintPaletteButton,
    },
    created(){
        //select first non-custom palette
        //needs to be done here to initialize palettes correctly
        this.selectedPaletteIndex = 1;
        this.numColors = this.numColorsMax;
        const defaultPalettes = Palettes.get(this.numColorsMax);
        this.defaultPalettesLength = defaultPalettes.length;
        this.palettes = defaultPalettes.concat(UserSettings.getPalettes(this.numColorsMax));
    },
    mounted(){
        //have to get canvases here, because DOM manipulation needs to happen in mounted hook
        histogramCanvas = Canvas.create(this.$refs.histogramCanvas);
    },
    data(){ 
        return{
            selectedDitherAlgorithmIndex: 36,
            ditherGroups: AlgorithmModel.colorDitherGroups,
            loadedImage: null,
            colors: [],
            //colors shadow and draggedIndex are for dragging colors in palette
            colorsShadow: [],
            draggedIndex: null,
            palettes: [],
            defaultPalettesLength: 0,
            selectedPaletteIndex: null,
            numColors: null,
            numColorsMin: 2,
            numColorsMax: Constants.colorDitherMaxColors,
            colorDitherModes: [...ColorDitherModes.values()],
            selectedColorDitherModeIndex: 4,
            colorQuantizationModes: ColorQuantizationModes.modes,
            colorQuantizationGroups: ColorQuantizationModes.groups,
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
        colorPickerSelectedColor(){
            return this.colorsShadow[this.colorPickerColorIndex];
        },
        selectedDitherAlgorithm(){
            return this.ditherAlgorithms[this.selectedDitherAlgorithmIndex];
        },
        isSelectedAlgorithmWebGl(){
            return this.isWebglEnabled && this.selectedDitherAlgorithm.webGlFunc;
        },
        isImageLoaded(){
            return this.loadedImage != null;  
        },
        selectedColors(){
            return this.colors.slice(0, this.numColors);  
        },
        selectedColorsVec(){
            return ColorPicker.colorsToVecArray(this.selectedColors, this.numColorsMax);
        },
        selectedColorDitherModeId(){
            return this.colorDitherModes[this.selectedColorDitherModeIndex].id;
        },
        isSelectedColorQuantizationPending(){
            if(!this.isImageLoaded){
                return false;
            }
            const key = optimizePaletteMemorizationKey(this.numColors, this.selectedColorQuantizationModeIndex);
            return this.isOptimizePaletteKeyPending(key);
        },
        selectedColorQuantizationPendingMessage(){
            if(!this.isImageLoaded){
                return '';
            }
            const key = optimizePaletteMemorizationKey(this.numColors, this.selectedColorQuantizationModeIndex);
            if(!this.isOptimizePaletteKeyPending(key)){
                return '';
            }
            const percentage = this.pendingColorQuantizations[key];
            const messageBase = 'Working…';
            if(percentage <= 1){
                return messageBase;
            }
            return `${messageBase} ${percentage}%`;
        },
        currentPalette(){
            return this.palettes[this.selectedPaletteIndex];
        },
    },
    watch: {
        isLivePreviewEnabled(newValue){
            if(newValue){
                this.ditherImageWithSelectedAlgorithm();
            }
        },
        selectedDitherAlgorithmIndex(newIndex){
            if(this.isLivePreviewEnabled){
                this.ditherImageWithSelectedAlgorithm();
            }
        },
        selectedColorQuantizationModeIndex(){
            if(this.isLivePreviewEnabled){
                this.optimizePalette();
            }
        },
        numColors(newValue, oldValue){
            let value = newValue;
            if(value < this.numColorsMin){
                value = this.numColorsMin;
            }
            else if(value > this.numColorsMax){
                value = this.numColorsMax;
            }
            if(value !== this.numColors){
                this.numColors = value;
            }
            if(value === oldValue){
                return;
            }
            if(this.isLivePreviewEnabled){
                this.ditherImageWithSelectedAlgorithm();
            }
        },
        colorsShadow(newValue){
            if(this.draggedIndex === null){
                this.colors = this.colorsShadow.slice();   
            }
        },
        colors(newValue, oldValue){
            //don't dither image if colors changed are not enabled
            if(this.isLivePreviewEnabled && !ColorPicker.areColorArraysIdentical(newValue.slice(0, this.numColors), oldValue.slice(0, this.numColors))){
                this.ditherImageWithSelectedAlgorithm();
            }
            //set palette to custom if a color is changed
            if(!this.currentPalette.isCustom && !ColorPicker.areColorArraysIdentical(this.colors, this.currentPalette.colors)){
                this.selectedPaletteIndex = 0;
            }
        },
        currentPalette(newValue){
            if(!this.currentPalette.isCustom){
                this.colorsShadow = this.currentPalette.colors.slice();
            }
        },
        selectedColorDitherModeIndex(newValue){
            if(this.isLivePreviewEnabled){
                this.ditherImageWithSelectedAlgorithm();
            }
        },
    },
    methods: {
        //isNewImage is used to determine if the image is actually different,
        //or it is the same image with filters changed
        imageLoaded(loadedImage, isNewImage=false){
            this.loadedImage = loadedImage;

            //reset optimize palette cache
            //have to do this even if not a new image, since potential permutations
            //of image filters is too much to cache each possible value
            optimizedPalettes = {};
            this.pendingColorQuantizations = {};
            
            //draw histogram
            this.$emit('request-worker', (worker)=>{
                worker.postMessage(WorkerUtil.colorHistogramWorkerHeader());
            });
            
            if(this.isLivePreviewEnabled){
                this.ditherImageWithSelectedAlgorithm();   
            }
            else{
                //if live preview is not enabled, transform canvas will be blank unless we do this
                this.requestDisplayTransformedImage();
            }
        },
        ditherImageWithSelectedAlgorithm(){
            if(!this.isImageLoaded){
                return;
            }
            if(this.isSelectedAlgorithmWebGl){
                this.requestCanvases((transformCanvas, transformCanvasWebGl, sourceWebglTexture)=>{
                    Timer.megapixelsPerSecond(this.selectedDitherAlgorithm.title + ' webgl', this.loadedImage.width * this.loadedImage.height, ()=>{
                        this.selectedDitherAlgorithm.webGlFunc(transformCanvasWebGl.gl, sourceWebglTexture, this.loadedImage.width, this.loadedImage.height, this.selectedColorDitherModeId, this.selectedColorsVec, this.numColors); 
                    });
                    //have to copy to 2d context, since chrome will clear webgl context after switching tabs
                    //https://stackoverflow.com/questions/44769093/how-do-i-prevent-chrome-from-disposing-of-my-webgl-drawing-context-after-swit
                    transformCanvas.context.drawImage(transformCanvasWebGl.canvas, 0, 0);
                    this.requestDisplayTransformedImage();
                });
                return;
            }
            this.$emit('request-worker', (worker)=>{
                worker.postMessage(WorkerUtil.ditherWorkerColorHeader(this.loadedImage.width, this.loadedImage.height, this.selectedDitherAlgorithm.id, this.selectedColorDitherModeId, this.selectedColors));
            });
        },
        ditherWorkerMessageReceivedDispatcher(messageTypeId, messageBody){
            switch(messageTypeId){
                case WorkerHeaders.DITHER_COLOR:
                    this.ditherWorkerMessageReceived(messageBody);
                    break;
                case WorkerHeaders.OPTIMIZE_PALETTE:
                    const colors = messageBody.subarray(1, messageBody.length);
                    const optimizePaletteKey = optimizePaletteMemorizationKey(colors.length / 3, messageBody[0]);
                    this.optimizePaletteMessageReceived(colors, optimizePaletteKey, !this.colorQuantizationModes[messageBody[0]].disableCache);
                    break;
                case WorkerHeaders.OPTIMIZE_PALETTE_PROGRESS:
                    const key = optimizePaletteMemorizationKey(messageBody[1], messageBody[0]);
                    //check to make sure still pending and not done first, to avoid race condition
                    if(this.isOptimizePaletteKeyPending(key)){
                        //have to use Vue.set for object keys
                        Vue.set(this.pendingColorQuantizations, key, messageBody[2]);
                    }
                    break;
                //histogram
                default:
                    this.histogramWorkerMessageReceived(messageBody);
                    break;
            }
        },
        optimizePaletteMessageReceived(colors, key, shouldCache){
            //avoids race condition where image is changed before color quantization returns
            if(!this.isOptimizePaletteKeyPending(key)){
                return;
            }
            const colorsHexArray = ColorPicker.pixelsToHexArray(colors);
            if(shouldCache){
                optimizedPalettes[key] = colorsHexArray;
            }
            //have to use Vue.set for object keys
            Vue.set(this.pendingColorQuantizations, key, false);
            //avoids race conditions when color quantization mode or number of colors is changed before results return
            const currentKey = optimizePaletteMemorizationKey(this.numColors, this.selectedColorQuantizationModeIndex);
            if(key === currentKey){
                this.changePaletteToOptimizePaletteResult(colorsHexArray.slice());
            }
        },
        changePaletteToOptimizePaletteResult(colorsHexArrayCopy){
            //this is so if optimize palette result has less colors than max, we keep the colors that are already in the palette
            //at the end of the palette
            this.colorsShadow = colorsHexArrayCopy.concat(this.colorsShadow.slice(colorsHexArrayCopy.length, this.numColorsMax));
        },
        histogramWorkerMessageReceived(huePercentages){
            Histogram.drawColorHistogram(histogramCanvas, huePercentages);
        },
        ditherWorkerMessageReceived(pixels){
            this.requestCanvases((transformCanvas)=>{
                Canvas.loadPixels(transformCanvas, this.loadedImage.width, this.loadedImage.height, pixels);
                this.requestDisplayTransformedImage();
            });
        },
        optimizePalette(){
            const key = optimizePaletteMemorizationKey(this.numColors, this.selectedColorQuantizationModeIndex);
            if(this.isOptimizePaletteKeyPending(key)){
                return;
            }
            if(optimizedPalettes[key]){
                this.changePaletteToOptimizePaletteResult(optimizedPalettes[key].slice());
                return;
            }
            //have to use Vue.set for object keys
            Vue.set(this.pendingColorQuantizations, key, 0);
            this.$emit('request-worker', (worker)=>{
                worker.postMessage(WorkerUtil.optimizePaletteHeader(this.numColors, this.selectedColorQuantizationModeIndex));
            });
        },
        isOptimizePaletteKeyPending(key){
            return typeof this.pendingColorQuantizations[key] === 'number';
        },
        savePalette(){
            this.palettes.push(Palettes.generateUserSavedPalette(this.colors.slice(), this.palettes.length - this.defaultPalettesLength + 1));
            this.selectedPaletteIndex = this.palettes.length - 1;
            this.saveUserPalettes();
        },
        deletePalette(){
            //we change the selectedPaletteIndex to 0 first, 
            //so that the current colors will persist after the palette is deleted
            const indexToDelete = this.selectedPaletteIndex;
            this.selectedPaletteIndex = 0;
            this.palettes.splice(indexToDelete, 1);
            this.saveUserPalettes();
        },
        showRenamePalette(){
            this.$emit('request-modal-prompt', 'Palette name', this.currentPalette.title, this.renamePalette, {okButtonValue: 'Save'});
        },
        renamePalette(newTitle){
            this.currentPalette.title = newTitle;
            this.saveUserPalettes();
        },
        saveUserPalettes(){
            UserSettings.savePalettes(this.palettes.filter((palette)=>{
                return palette.isSaved;
            }));
        },
        /**
        * Color palette drag stuff
        */
        handleColorDragstart(e, colorIndex){
            this.draggedIndex = colorIndex;
        },
        //drag functions based on: https://www.w3schools.com/html/html5_draganddrop.asp
        handleColorDragover(e, colorIndex){
            e.preventDefault();
            e.stopPropagation();
            //will be defined if we are over the container
            if(colorIndex === undefined){
                return;
            }
            let swapIndex = colorIndex;

            if(this.draggedIndex != swapIndex){
                let colorsCopy = this.colorsShadow.slice();
                let draggedColor = colorsCopy.splice(this.draggedIndex, 1)[0];
                colorsCopy.splice(swapIndex, 0, draggedColor);
                this.colorsShadow = colorsCopy;
                this.draggedIndex = swapIndex;
            }
            
        },
        //according to spec, must happen after drop
        handleColorDragend(e){
            this.draggedIndex = null;
            
            //draggedIndex has to be null before resetting colorsShadow
            //need to do this to trigger refresh
            this.colorsShadow = this.colorsShadow.slice();
        },
        /**
         * Color picker functions
         */
        createColorInputClicked(colorIndex){
            return ()=>{
                if(this.shouldShowColorPicker){
                    return;
                }
                this.colorPickerColorIndex = colorIndex;
                this.hasColorPickerChangedTheColor = false;
                this.selectedPaletteIndexBeforeColorPickerOpened = this.selectedPaletteIndex;
                this.shouldShowColorPicker = true;
            }
        },
        colorPickerValueChanged(colorHex){
            this.hasColorPickerChangedTheColor = true;
            Vue.set(this.colorsShadow, this.colorPickerColorIndex, colorHex);
        },
        colorPickerOk(selectedColorHex){
            //this will be true when color picker live update is disabled and the color has been changed
            if(this.colorsShadow[this.colorPickerColorIndex] !== selectedColorHex){
                Vue.set(this.colorsShadow, this.colorPickerColorIndex, selectedColorHex);
            }
            this.shouldShowColorPicker = false;
        },
        colorPickerCanceled(previousColorHex){
            //reset color palette if changed to custom
            if(this.selectedPaletteIndex !== this.selectedPaletteIndexBeforeColorPickerOpened){
                this.selectedPaletteIndex = this.selectedPaletteIndexBeforeColorPickerOpened;
            }
            //if we were already on custom, but color was changed, we need to reset it as well
            else if(this.hasColorPickerChangedTheColor){
                Vue.set(this.colorsShadow, this.colorPickerColorIndex, previousColorHex);
            }
            this.shouldShowColorPicker = false;
        },
    }
};