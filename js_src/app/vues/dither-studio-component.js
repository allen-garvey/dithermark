import Constants from '../../generated_output/app/constants.js'
import AlgorithmModel from '../../generated_output/app/algorithm-model.js';
import UserSettings from '../user-settings.js'
import Canvas from '../canvas.js';
import WorkerHeaders from '../../shared/worker-headers.js';
import WorkerUtil from '../worker-util.js';
import WebGl from '../webgl.js';
import EditorThemes from '../editor-themes.js';
import WebGlSmoothing from '../webgl-smoothing.js';
import WebGlBilateralFilter from '../webgl-bilateral-filter.js';
import WebGlCanvasFilters from '../webgl-canvas-filters.js';
import ImageFiltersModel from '../image-filters-model.js';

import CyclePropertyList from './cycle-property-list-component.vue';
import Alerts from './alerts-component.vue';
import ExportTab from './export-tab-component.vue';
import FullScreenModeControl from './full-screen-mode-control-component.vue';
import OpenTab from './open-tab-component.vue';
import OutlineFiltersControls from './outline-filters-controls-component.js';
import UnsplashAttribution from './unsplash-attribution-component.vue';
import ZoomBar from './zoom-bar-component.vue';
import ModalPrompt from './modal-prompt-component.vue';
import BwDitherSection from './bw-dither-component.js';
import ColorDitherSection from './color-dither-component.js';


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
    name: 'dither-studio',
    template: document.getElementById('dither-studio-component'),
    components: {
        CyclePropertyList,
        Alerts,
        ExportTab,
        FullScreenModeControl,
        OpenTab,
        OutlineFiltersControls,
        UnsplashAttribution,
        ZoomBar,
        ModalPrompt,
        BwDitherSection,
        ColorDitherSection,
    },
    created(){
        WorkerUtil.getDitherWorkers(Constants.ditherWorkerUrl).then((workers)=>{
            ditherWorkers = workers;
            ditherWorkers.forEach((ditherWorker)=>{
                ditherWorker.onmessage = this.workerMessageReceivedDispatcher; 
                });
        });
        originalImageCanvas = Canvas.create();
        sourceCanvas = Canvas.create();
        transformCanvas = Canvas.create();
        transformCanvasWebGl = Canvas.createWebgl();
        ditherOutputCanvas = Canvas.create();
        this.areCanvasFiltersSupported = Canvas.areCanvasFiltersSupported(originalImageCanvas);
        //check for webgl support
        if(transformCanvasWebGl.gl){
            this.isWebglSupported = true;
            this.isWebglHighpFloatSupported = transformCanvasWebGl.supportsHighFloatPrecision;
        }

        //remove webgl algorithms requiring high precision ints (if necessary)
        if(!transformCanvasWebGl.supportsHighIntPrecision){
            const removeUnsupportedWebGl = (algorithm)=>{
                if(algorithm.requiresHighPrecisionInt){
                    algorithm.webGlFunc = null;
                }
                return algorithm;
            };
            this.bwDitherAlgorithms = this.bwDitherAlgorithms.map(removeUnsupportedWebGl);
            this.colorDitherAlgorithms = this.colorDitherAlgorithms.map(removeUnsupportedWebGl);
        }
    },
    mounted(){
        const refs = this.$refs;
        sourceCanvasOutput = Canvas.create(refs.sourceCanvasOutput);
        transformCanvasOutput = Canvas.create(refs.transformCanvasOutput);

        //have to set alertsContainer property here, since it does not exist yet in created hook
        if(this.isWebglSupported){
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
    data(){
        return {
            bwDitherAlgorithms: AlgorithmModel.bwDitherAlgorithms,
            colorDitherAlgorithms: AlgorithmModel.colorDitherAlgorithms,
            bwDitherComponentId: 0,
            colorDitherComponentId: 1,
            activeDitherComponentId: 1,
            activeControlsTab: 0,
            //loadedImage has properties: width, height, fileName, fileType, and optionally unsplash info
            loadedImage: null,
            isLivePreviewEnabled: true,
            isColorPickerLivePreviewEnabledSetting: false,
            automaticallyResizeLargeImages: true,
            isWebglSupported: false,
            isWebglEnabled: false,
            isWebglHighpFloatSupported: false,
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
            currentEditorThemeIndex: null,
            //used so we know when component is done initializing,
            //so we don't do any spurious saving of global setting changes
            //done by initialization rather than user
            finishedInitialization: false,
        };
    },
    computed: {
        //the source canvas for transformed (dithered and filtered image)
        //before zoom
        transformedSourceCanvas(){
            if(this.$refs.outlineFilterControls.isImageOutlineFilterActive){
                return this.$refs.outlineFilterControls.getCanvas();
            }
            return transformCanvas;
        },
        /**
         * Image outline filter stuff
         */
        isImageOutlineFilterEnabled(){
            //only enabled for color dither
            return this.isImageLoaded && this.isWebglEnabled && this.activeDitherComponentId === 1;
        },
        isColorPickerLivePreviewEnabled(){
            return this.isLivePreviewEnabled && this.isColorPickerLivePreviewEnabledSetting;
        },
        isImageLoaded(){
            return this.loadedImage != null;  
        },
        imageHeader(){
            if(!this.isImageLoaded){
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
        activeDitherSection(){
            if(this.activeDitherComponentId === this.bwDitherComponentId){
                return this.$refs.bwDitherSection;
            }
            return this.$refs.colorDitherSection;
        },
        globalControlsTabs(){
            let tabs = [
                {name: 'Open'},
                {name: 'Image'},
                {name: 'Settings'},
                {name: 'Export'},
            ];
            if(!this.isImageLoaded){
                tabs[1].isDisabled = true;
                tabs[3].isDisabled = true;
            }

            return tabs;
        },
        pixelateImageZooms(){
            const dimensions = this.isImageLoaded ? this.loadedImage.height * this.loadedImage.width : 0;
            return ImageFiltersModel.pixelationValues(dimensions);
        },
        pixelateImageZoom(){
            return this.pixelateImageZooms[this.selectedPixelateImageZoom];
        },
        isImagePixelated(){
            return this.pixelateImageZoom !== 100;
        },
        imageFiltersRaw(){
            const filters = {};
            const contrast = this.canvasFilterValues[this.selectedImageContrastIndex];
            const saturation = this.canvasFilterValues[this.selectedImageSaturationIndex];
            const brightness = this.canvasFilterValues[this.selectedImageBrightnessIndex];
            const hue = Math.floor(this.hueRotationValue);
            //100% is unchanged
            if(contrast !== 100){
                filters['contrast'] = contrast;
            }
            if(saturation !== 100){
                filters['saturation'] = saturation;
            }
            if(brightness !== 100){
                filters['brightness'] = brightness;
            }
            if(hue > 0 && hue < 360){
                filters['hue'] = hue;
            }
            return filters;
        },
        imageFilters(){
            const filtersRaw = this.imageFiltersRaw;
            const filters = [];
            if('contrast' in filtersRaw){
                filters.push(`contrast(${filtersRaw.contrast}%)`);
            }
            if('saturation' in filtersRaw){
                filters.push(`saturate(${filtersRaw.saturation}%)`);
            }
            if('brightness' in filtersRaw){
                filters.push(`brightness(${filtersRaw.brightness}%)`);
            }
            if('hue' in filtersRaw){
                filters.push(`hue-rotate(${filtersRaw.hue}deg)`);
            }
            return filters.join(' ');
        },
        isSmoothingEnabled(){
            return this.isWebglEnabled && this.isWebglHighpFloatSupported;
        },
        areCanvasFiltersEnabled(){
            return this.areCanvasFiltersSupported || this.isWebglEnabled; 
        },
        serializedGlobalSettings(){
            const editorThemeKey = this.currentEditorThemeIndex === null ? '' : this.editorThemes[this.currentEditorThemeIndex].key;

            return {
                editorThemeKey: editorThemeKey,
                isWebglEnabled: this.isWebglEnabled,
                isLivePreviewEnabled: this.isLivePreviewEnabled,
                isColorPickerLivePreviewEnabled: this.isColorPickerLivePreviewEnabledSetting,
                automaticallyResizeLargeImages: this.automaticallyResizeLargeImages,
                showOriginalImage: this.showOriginalImage,
            };
        },
    },
    watch: {
        loadedImage(newValue, oldValue){
            //only do this for the first image loaded
            if(!oldValue){
                //make links open in new tab now, so user won't lose saved work
                document.querySelectorAll('.nav a').forEach((link)=>{
                    link.target = '_blank';
                });
            }
        },
        currentEditorThemeIndex(newThemeIndex, oldThemeIndex){
            const classList = document.documentElement.classList;
            //need this for firefox full screen mode to work
            const classList2 = document.body.classList;
            //this will be null on original page load
            if(oldThemeIndex !== null){
                const oldThemeClass = this.editorThemes[oldThemeIndex].className;
                classList.remove(oldThemeClass);
                classList2.remove(oldThemeClass);
            }
            const newThemeClass = this.editorThemes[newThemeIndex].className;
            classList.add(newThemeClass);
            classList2.add(newThemeClass);
        },
        serializedGlobalSettings(newValue){
            if(this.finishedInitialization){
                UserSettings.saveGlobalSettings(newValue);
            }
        },
        pixelateImageZoom(newValue, oldValue){
            if(newValue !== oldValue){
                this.imageFiltersBeforeDitherChanged();
            }
        },
        imageFilters(){
            if(this.isImageLoaded){
                this.imageFiltersBeforeDitherChanged();
            }
        },
        selectedBilateralFilterValueBefore(newValue, oldValue){
            if(this.isImageLoaded && newValue !== oldValue){
                this.imageFiltersBeforeDitherChanged();
            }
        },
        selectedBilateralFilterValueAfter:function(newValue, oldValue){
            if(this.isImageLoaded && newValue !== oldValue){
                this.imageFiltersAfterDitherChanged();
            }
        },
        selectedImageSmoothingRadiusBefore(newValue, oldValue){
            if(this.isImageLoaded && newValue !== oldValue){
                this.imageFiltersBeforeDitherChanged();
            }
        },
        selectedImageSmoothingRadiusAfter(newValue, oldValue){
            if(this.isImageLoaded && newValue !== oldValue){
                this.imageFiltersAfterDitherChanged();
            }
        },
    },
    methods: {
        /*
        * Tabs
        */
        setActiveControlsTab(tabIndex, isDisabled){
            if(isDisabled){
                return;
            }
            this.activeControlsTab = tabIndex;
        },
        loadDitherTab(componentId){
            if(componentId === this.activeDitherComponentId){
                return;
            }
            this.activeDitherComponentId = componentId;
            if(this.isImageLoaded){
                const hasSeenImage = tabsThatHaveSeenImageSet.has(this.activeDitherComponentId);
                tabsThatHaveSeenImageSet.add(this.activeDitherComponentId);
                this.activeDitherSection.imageLoaded(this.imageHeader, !hasSeenImage);   
            }
        },
        /*
        * Loading and saving image stuff
        */
        onSaveRequested(exportCanvas, shouldUpsample, callback){
            //scale canvas if pixelated
            const scale = this.isImagePixelated && shouldUpsample ? 100 / this.pixelateImageZoom : 1;
            //while technicaly we can just use transformedSourceCanvas directly if there is no pixelation
            //it makes the logic for clearing the canvas in export component easier
            //since we don't need to check if we are using transform canvas directly
            Canvas.copy(this.transformedSourceCanvas, exportCanvas, scale);

            callback(exportCanvas, this.loadedImage.unsplash);
        },
        loadImage(image, file){
            const loadedImage = {
                width: image.width,
                height: image.height,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                unsplash: file.unsplash || null,
            };
            this.$refs.exportTab.fileChanged(file.name);
            
            //resize large images if necessary
            const largeImageDimensionThreshold = 1200;
            const largestImageDimension = Math.max(loadedImage.width, loadedImage.height);
            if(this.automaticallyResizeLargeImages && largestImageDimension > largeImageDimensionThreshold){
                const resizePercentage = largeImageDimensionThreshold / largestImageDimension;
                Canvas.loadImage(originalImageCanvas, image, resizePercentage);
                loadedImage.width = originalImageCanvas.canvas.width;
                loadedImage.height = originalImageCanvas.canvas.height;
            }
            else{
                Canvas.loadImage(originalImageCanvas, image);
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
            if(!this.areControlsPinned()){
                setTimeout(()=>{
                    this.$refs.unsplashAttributionContainer.scrollIntoView({behavior: 'smooth', block: 'start'});
                }, 1);
            }
        },
        imageFiltersBeforeDitherChanged(notifyDitherSection=true){
            //apply filters
            this.imagePixelationChanged();
            if(this.isWebglEnabled){
                //reset source texture
                transformCanvasWebGl.gl.deleteTexture(sourceWebglTexture);
                sourceWebglTexture = WebGl.createAndLoadTextureFromCanvas(transformCanvasWebGl.gl, sourceCanvas.canvas);
                if(!this.areCanvasFiltersSupported){
                    this.applyWebGlCanvasFilters();
                }
                let hasImageBeenTransformed = false;
                hasImageBeenTransformed = this.bilateralFilterValueBeforeChanged() || hasImageBeenTransformed;
                hasImageBeenTransformed = this.imageSmoothingBeforeChanged() || hasImageBeenTransformed;

                if(hasImageBeenTransformed){
                    sourceCanvas.context.drawImage(transformCanvasWebGl.canvas, 0, 0);
                }
            }
            
            //load image into the webworkers
            imageId = WorkerUtil.generateImageId(imageId);
            const buffer = Canvas.createSharedImageBuffer(sourceCanvas);
            const ditherWorkerHeader = WorkerUtil.createLoadImageHeader(imageId, this.imageHeader.width, this.imageHeader.height);
            ditherWorkers.forEach((ditherWorker)=>{
                //copy image to web workers
                ditherWorker.postMessage(ditherWorkerHeader);
                ditherWorker.postMessage(buffer);
            });
            if(notifyDitherSection){
                this.activeDitherSection.imageLoaded(this.imageHeader);
            }
        },
        applyWebGlCanvasFilters(){
            const filters = this.imageFiltersRaw;
            //don't do anything if filters are all invalid or at defaults
            if(Object.keys(filters).length < 1){
                return;
            }
            const imageHeader = this.imageHeader;
            WebGlCanvasFilters.filter(transformCanvasWebGl.gl, sourceWebglTexture, imageHeader.width, imageHeader.height, filters.contrast, filters.saturation, filters.brightness,filters.hue);
            sourceCanvas.context.drawImage(transformCanvasWebGl.canvas, 0, 0);
            transformCanvasWebGl.gl.deleteTexture(sourceWebglTexture);
            sourceWebglTexture = WebGl.createAndLoadTextureFromCanvas(transformCanvasWebGl.gl, sourceCanvas.canvas);
        },
        imagePixelationChanged(){
            const imageHeader = this.imageHeader;
            const scaleAmount = this.pixelateImageZoom / 100;
            const filters = this.areCanvasFiltersSupported ? this.imageFilters : '';
            Canvas.copy(originalImageCanvas, sourceCanvas, scaleAmount, filters);
            Canvas.copy(originalImageCanvas, transformCanvas, scaleAmount, filters);
            
            if(this.isWebglSupported){
                transformCanvasWebGl.canvas.width = imageHeader.width;
                transformCanvasWebGl.canvas.height = imageHeader.height;
                transformCanvasWebGl.gl.deleteTexture(sourceWebglTexture);
                sourceWebglTexture = WebGl.createAndLoadTextureFromCanvas(transformCanvasWebGl.gl, sourceCanvas.canvas);
            }
            //we have to unset hue-rotate here, otherwise it will remain set for some reason even though other filters reset
            //sourceCanvas filter needs to be reset after webgl texture is created, otherwise results of the filter won't be saved in the texture
            if(this.areCanvasFiltersSupported && transformCanvas.context.filter){
                transformCanvas.context.filter = 'hue-rotate(0deg)';
                sourceCanvas.context.filter = 'hue-rotate(0deg)';
            }
        },
        bilateralFilterValueBeforeChanged(){
            const filterExponent = this.bilateralFilterValues[this.selectedBilateralFilterValueBefore];
            if(filterExponent < 0){
                return false;
            }
            const imageHeader = this.imageHeader;
            sourceWebglTexture = WebGlBilateralFilter.filterImage(transformCanvasWebGl, sourceWebglTexture, imageHeader.width, imageHeader.height, filterExponent);
            return true;
        },
        //image smoothing after pixelation, before dither
        imageSmoothingBeforeChanged(){
            const smoothingRadius = this.imageSmoothingValues[this.selectedImageSmoothingRadiusBefore];
            if(!this.isSmoothingEnabled || smoothingRadius <= 0){
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
        imageSmoothingAfterChanged(){
            const smoothingRadius = this.imageSmoothingValues[this.selectedImageSmoothingRadiusAfter];
            if(!this.isSmoothingEnabled || smoothingRadius <= 0){
                return false;
            }
            const imageHeader = this.imageHeader;
            //smoothing
            WebGlSmoothing.smooth(transformCanvasWebGl.gl, ditherOutputWebglTexture, imageHeader.width, imageHeader.height, smoothingRadius);
            return true;
        },
        bilateralFilterValueAfterChanged(){
            const filterExponent = this.bilateralFilterValues[this.selectedBilateralFilterValueAfter];
            if(filterExponent < 0){
                return false;
            }
            const imageHeader = this.imageHeader;
            ditherOutputWebglTexture = WebGlBilateralFilter.filterImage(transformCanvasWebGl, ditherOutputWebglTexture, imageHeader.width, imageHeader.height, filterExponent);

            return true;
        },
        imageFiltersAfterDitherChanged(){
            if(!this.isWebglSupported){
                return;
            }
            transformCanvasWebGl.gl.deleteTexture(ditherOutputWebglTexture);
            ditherOutputWebglTexture = WebGl.createAndLoadTextureFromCanvas(transformCanvasWebGl.gl, ditherOutputCanvas.canvas);
            let hasImageBeenTransformed = false;
            hasImageBeenTransformed = this.bilateralFilterValueAfterChanged() || hasImageBeenTransformed;
            hasImageBeenTransformed = this.imageSmoothingAfterChanged() || hasImageBeenTransformed;
            if(hasImageBeenTransformed){
                Canvas.copy(transformCanvasWebGl, transformCanvas);
            }
            else{
                //reset output when no filters active
                Canvas.copy(ditherOutputCanvas, transformCanvas);
            }
            //reset the outline, since it needs to be merged with transformCanvas
            this.$refs.outlineFilterControls.imageOutlineFilterAction();
            this.zoomImage();
        },
        onOutlineFilterDisplayRequested(callback){
            callback(transformCanvas, transformCanvasWebGl);
        },
        onResourcesForOutlineFilterRequested(callback){
            const imageWidth = this.imageHeader.width;
            const imageHeight = this.imageHeader.height;
            callback(imageWidth, imageHeight, sourceWebglTexture, ditherOutputWebglTexture, transformCanvasWebGl, this.$refs.colorDitherSection.selectedColorsVec);
        },
        areControlsPinned(){
            return getComputedStyle(this.$refs.controlsContainer).getPropertyValue('position') === 'fixed';
        },
        /**
         * Zoom stuff
         */
        zoomImage(){
            const scaleAmount = this.$refs.zoomBar.zoom / this.pixelateImageZoom;
            Canvas.copy(sourceCanvas, sourceCanvasOutput, scaleAmount);
            Canvas.copy(this.transformedSourceCanvas, transformCanvasOutput, scaleAmount);
        },
        onDimensionsRequestedForZoomFit(callback){
            const areControlsPinned = this.areControlsPinned();
            const controlsContainerWidth = areControlsPinned ? this.$refs.controlsContainer.offsetWidth : 0;
            const canvasMargin = this.showOriginalImage ? parseInt(getComputedStyle(this.$refs.sourceCanvasOutput).getPropertyValue('margin-right').replace(/[\D]/, '')) : 0;

            callback(areControlsPinned, controlsContainerWidth, canvasMargin);
        },
        //webworker stuff
        workerMessageReceivedDispatcher(e){
            const messageData = e.data;
            const messageFull = new Uint8Array(messageData);
            //get image id and messageTypeId from start of buffer
            const messageImageId = messageFull[0];
            //check for race condition where worker was working on old image
            if(messageImageId !== imageId){
                return;
            }
            const messageTypeId = messageFull[1];
            //rest of the buffer is the actual pixel data
            const pixels = messageFull.subarray(2);
            switch(messageTypeId){
                case WorkerHeaders.DITHER:
                case WorkerHeaders.DITHER_BW:
                case WorkerHeaders.HISTOGRAM:
                    this.$refs.bwDitherSection.ditherWorkerMessageReceivedDispatcher(messageTypeId, pixels);
                    break;
                default:
                    this.$refs.colorDitherSection.ditherWorkerMessageReceivedDispatcher(messageTypeId, pixels);
                    break;
            }
        },
        onRequestDisplayTransformedImage(componentId){
            if(componentId === this.activeDitherComponentId){
                if(this.isWebglEnabled){
                    //copy output to ditherOutputCanvas so we don't lose it for post filter dithers
                    Canvas.copy(transformCanvas, ditherOutputCanvas);
                    this.imageFiltersAfterDitherChanged();
                }
                this.zoomImage();
            }
        },
        onCanvasesRequested(componentId, callback){
            if(componentId === this.activeDitherComponentId){
                callback(transformCanvas, transformCanvasWebGl, sourceWebglTexture);
            }
        },
        //used to build callback functions for onRequestDisplayTransformedImage and onCanvasesRequested
        //so that requester is not aware of, and thus cannot change their componentId
        requestPermissionCallbackBuilder(componentId, callback){
            return (...args)=>{
                callback(componentId, ...args);
            };
        },
        onWorkerRequested(callback){
            let worker = ditherWorkers.getNextWorker();
            callback(worker);
        },
        showModalPrompt(...modalPromptArgs){
            this.$refs.modalPromptComponent.show(...modalPromptArgs);
        },
        /**
         * Open tab
         */
        onOpenImageError(errorMessage){
            this.$refs.alertsContainer.openImageErrorMessage = errorMessage;
        },
        /**
         * Image tab
         */
        imageFilterSteppedDropdownOption(index, offValue=0){
            return index === offValue ? 'None' : index;
        },
    }
};