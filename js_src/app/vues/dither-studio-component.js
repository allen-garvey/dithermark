(function(Vue, Canvas, Timer, WorkerUtil, WebGl, Polyfills, WorkerHeaders, Constants, VueMixins, EditorThemes, UserSettings, AlgorithmModel, WebGlSmoothing, WebGlBilateralFilter, WebGlCanvasFilters, ImageFiltersModel){
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

    Vue.component('dither-studio', {
        template: document.getElementById('dither-studio-component'),
        created: function(){
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
        mounted: function(){
            const refs = this.$refs;
            sourceCanvasOutput = Canvas.create(refs.sourceCanvasOutput);
            transformCanvasOutput = Canvas.create(refs.transformCanvasOutput);
            
            //load global settings
            const globalSettings = UserSettings.getGlobalSettings();
            this.currentEditorThemeIndex = EditorThemes.indexForKey(this.editorThemes, globalSettings.editorThemeKey);
            this.showOriginalImage = globalSettings.showOriginalImage;
            this.isLivePreviewEnabled = globalSettings.isLivePreviewEnabled;
            this.automaticallyResizeLargeImages = globalSettings.automaticallyResizeLargeImages;
            this.isWebglEnabled = this.isWebglSupported && globalSettings.isWebglEnabled;

            //should be last statement of mounted function
            this.finishedInitialization = true;
        },
        data: function(){
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
                automaticallyResizeLargeImages: true,
                isWebglSupported: false,
                isWebglEnabled: false,
                isWebglHighpFloatSupported: false,
                zoom: 100,
                zoomDisplay: 100, //this is so invalid zoom levels can be incrementally typed into input box, and not immediately validated and changed
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
                selectedBilateralFilterValue: 0,
                selectedBilateralFilterValueAfter: 0,
                //selectedImageSaturationIndex and selectedImageContrastIndex use this array
                canvasFilterValues: ImageFiltersModel.canvasFilterValues,
                selectedImageSaturationIndex: ImageFiltersModel.canvasFilterValuesDefaultIndex,
                selectedImageContrastIndex: ImageFiltersModel.canvasFilterValuesDefaultIndex,
                hueRotationValue: 0,
                areCanvasFiltersSupported: false, //required for increasing image contrast and saturation
                showOriginalImage: true,
                editorThemes: EditorThemes.get(),
                currentEditorThemeIndex: null,
                openImageErrorMessage: null,
                showWebglWarningMessage: false,
                //used so we know when component is done initializing,
                //so we don't do any spurious saving of global setting changes
                //done by initialization rather than user
                finishedInitialization: false,
            };
        },
        computed: {
            zoomMin: function(){
                if(!this.isImageLoaded){
                    return 0;
                }
                const smallestDimension = Math.floor(Math.min(window.innerHeight, window.innerWidth) / 2 / Canvas.devicePixelRatio);
                return Canvas.minScalePercentageForImage(this.loadedImage.width, this.loadedImage.height, Math.min(100, smallestDimension));
            },
            zoomMax: function(){
                if(!this.isImageLoaded){
                    return 0;
                }
                const greatestDimension = Math.max(window.innerHeight, window.innerWidth) * 2 * Canvas.devicePixelRatio;
                return Canvas.maxScalePercentageForImage(this.loadedImage.width, this.loadedImage.height, greatestDimension);
            },
            isImageLoaded: function(){
              return this.loadedImage != null;  
            },
            imageHeader: function(){
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
            activeDitherSection: function(){
                if(this.activeDitherComponentId === this.bwDitherComponentId){
                    return this.$refs.bwDitherSection;
                }
                return this.$refs.colorDitherSection;
            },
            globalControlsTabs: function(){
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
            pixelateImageZooms: function(){
                const dimensions = this.isImageLoaded ? this.loadedImage.height * this.loadedImage.width : 0;

                return [100, 70, 60, 50, 35, 30, 25, 20, 15, 12, 10, 7, 5, 2].map((zoom, i)=>{
                    const title = i===0 ? 'None': i;
                    return {
                        title,
                        value: ImageFiltersModel.calculatePixelationZoom(dimensions, zoom),
                    };
                });
            },
            pixelateImageZoom: function(){
                return this.pixelateImageZooms[this.selectedPixelateImageZoom].value;
            },
            webglWarningMessage: function(){
                //based on: https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
                //for integers only
                function formatInteger(d){
                    return d.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }
                //I have no idea what units MAX_TEXTURE_SIZE is in, and no resource seems to explain this,
                //but multiplying it by 2048 seems to get the maximum image dimensions webgl will dither 
                const maxTextureDimensions = transformCanvasWebGl.maxTextureSize * 2048;
                if(this.isImageLoaded && this.isWebglEnabled && this.loadedImage.height*this.loadedImage.width > maxTextureDimensions){
                    return `It appears that the image you just opened has larger total dimensions than your max WebGL texture size of ${formatInteger(maxTextureDimensions)} pixels. It is recommended you either: disable WebGL in settings (this will decrease performance), pixelate the image, or crop or resize the image in the image editor of you choice and then reopen it.`;
                }
                return '';
            },
            imageFiltersRaw: function(){
                const filters = {};
                const contrast = this.canvasFilterValues[this.selectedImageContrastIndex];
                const saturation = this.canvasFilterValues[this.selectedImageSaturationIndex];
                const hue = Math.floor(this.hueRotationValue);
                //100% is unchanged
                if(contrast !== 100){
                    filters['contrast'] = contrast;
                }
                if(saturation !== 100){
                    filters['saturation'] = saturation;
                }
                if(hue > 0 && hue < 360){
                    filters['hue'] = hue;
                }
                return filters;
            },
            imageFilters: function(){
                const filtersRaw = this.imageFiltersRaw;
                const filters = [];
                if('contrast' in filtersRaw){
                    filters.push(`contrast(${filtersRaw.contrast}%)`);
                }
                if('saturation' in filtersRaw){
                    filters.push(`saturate(${filtersRaw.saturation}%)`);
                }
                if('hue' in filtersRaw){
                    filters.push(`hue-rotate(${filtersRaw.hue}deg)`);
                }
                return filters.join(' ');
            },
            isSmoothingEnabled: function(){
                return this.isWebglEnabled && this.isWebglHighpFloatSupported;
            },
            areCanvasFiltersEnabled: function(){
                return this.areCanvasFiltersSupported || this.isWebglEnabled; 
            },
            serializedGlobalSettings: function(){
                const editorThemeKey = this.currentEditorThemeIndex === null ? '' : this.editorThemes[this.currentEditorThemeIndex].key;

                return {
                    editorThemeKey: editorThemeKey,
                    isWebglEnabled: this.isWebglEnabled,
                    isLivePreviewEnabled: this.isLivePreviewEnabled,
                    automaticallyResizeLargeImages: this.automaticallyResizeLargeImages,
                    showOriginalImage: this.showOriginalImage,
                };
            },
        },
        watch: {
            loadedImage: function(newValue, oldValue){
                //only do this for the first image loaded
                if(!oldValue){
                    //make links open in new tab now, so user won't lose saved work
                    document.querySelectorAll('.nav a').forEach((link)=>{
                        link.target = '_blank';
                    });
                }
            },
            currentEditorThemeIndex: function(newThemeIndex, oldThemeIndex){
                let classList = document.documentElement.classList;
                //this will be null on original page load
                if(oldThemeIndex !== null){
                    let oldThemeClass = this.editorThemes[oldThemeIndex].className;
                    classList.remove(oldThemeClass);
                }
                let newThemeClass = this.editorThemes[newThemeIndex].className;
                classList.add(newThemeClass);
            },
            serializedGlobalSettings: function(newValue){
                if(this.finishedInitialization){
                    UserSettings.saveGlobalSettings(newValue);
                }
            },
            zoomDisplay: function(newValue){
                //have to check if not equal to this.zoom, or will start infinite loop
                if(newValue !== this.zoom && newValue >= this.zoomMin && newValue <= this.zoomMax){
                    this.zoom = newValue;
                }
            },
            zoom: function(newZoom, oldZoom){
                if(newZoom === oldZoom){
                    return;
                }
                let newZoomCleaned = Math.floor(newZoom);
                if(isNaN(newZoomCleaned)){
                    this.zoom = oldZoom;
                    return;
                }
                if(newZoomCleaned < this.zoomMin){
                    newZoomCleaned = this.zoomMin;
                }
                else if(newZoomCleaned > this.zoomMax){
                    newZoomCleaned = this.zoomMax;
                }
                if(newZoomCleaned !== newZoom){
                    this.zoom = newZoomCleaned;
                    return;
                }
                this.zoomDisplay = this.zoom;
                this.zoomImage();
            },
            pixelateImageZoom: function(newValue, oldValue){
                if(newValue !== oldValue){
                    this.imageFiltersBeforeDitherChanged();
                }
            },
            imageFilters: function(){
                if(this.isImageLoaded){
                    this.imageFiltersBeforeDitherChanged();
                }
            },
            selectedBilateralFilterValue: function(newValue, oldValue){
                if(this.isImageLoaded && newValue !== oldValue){
                    this.imageFiltersBeforeDitherChanged();
                }
            },
            selectedBilateralFilterValueAfter:function(newValue, oldValue){
                if(this.isImageLoaded && newValue !== oldValue){
                    this.imageFiltersAfterDitherChanged();
                }
            },
            selectedImageSmoothingRadiusBefore: function(newValue, oldValue){
                if(this.isImageLoaded && newValue !== oldValue){
                    this.imageFiltersBeforeDitherChanged();
                }
            },
            selectedImageSmoothingRadiusAfter: function(newValue, oldValue){
                if(this.isImageLoaded && newValue !== oldValue){
                    this.imageFiltersAfterDitherChanged();
                }
            },
        },
        methods: {
            /*
            * Tabs
            */
            setActiveControlsTab: function(tabIndex, isDisabled){
                if(isDisabled){
                    return;
                }
                this.activeControlsTab = tabIndex;
            },
            loadDitherTab: function(componentId){
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
            onSaveRequested: function(callback){
                callback(transformCanvas, this.pixelateImageZoom, this.loadedImage.unsplash);
            },
            loadImage: function(image, file){
                this.openImageErrorMessage = null;
                const loadedImage = {
                    width: image.width,
                    height: image.height,
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type,
                    unsplash: file.unsplash || null,
                };
                //show webgl warning if any, until user closes it
                this.showWebglWarningMessage = true;
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
                this.zoomFit();
                this.imageFiltersBeforeDitherChanged(false);
                tabsThatHaveSeenImageSet.clear();
                tabsThatHaveSeenImageSet.add(this.activeDitherComponentId);
                this.activeDitherSection.imageLoaded(this.imageHeader, true);
                //this is so mobile users will actually be able to see that an image has loaded
                //have to use a timer since unsplashAttributionContainer won't be in proper place on initial page load
                if(getComputedStyle(this.$refs.controlsContainer).getPropertyValue('position') != 'fixed'){
                    setTimeout(()=>{
                        this.$refs.unsplashAttributionContainer.scrollIntoView({behavior: 'smooth', block: 'start'});
                    }, 1);
                }
            },
            imageFiltersBeforeDitherChanged: function(notifyDitherSection=true){
                //apply filters
                this.imagePixelationChanged();
                if(this.isWebglEnabled){
                    if(!this.areCanvasFiltersSupported){
                        this.applyWebGlCanvasFilters();
                    }
                    this.bilateralFilterValueChanged();
                    this.imageSmoothingBeforeChanged();
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
            applyWebGlCanvasFilters: function(){
                const filters = this.imageFiltersRaw;
                //don't do anything if filters are all invalid or at defaults
                if(Object.keys(filters).length < 1){
                    return;
                }
                const imageHeader = this.imageHeader;
                WebGlCanvasFilters.filter(transformCanvasWebGl.gl, sourceWebglTexture, imageHeader.width, imageHeader.height, filters.contrast, filters.saturation, filters.hue);
                sourceCanvas.context.drawImage(transformCanvasWebGl.canvas, 0, 0);
                transformCanvasWebGl.gl.deleteTexture(sourceWebglTexture);
                sourceWebglTexture = WebGl.createAndLoadTexture(transformCanvasWebGl.gl, sourceCanvas.context.getImageData(0, 0, imageHeader.width, imageHeader.height));
            },
            imagePixelationChanged: function(){
                const imageHeader = this.imageHeader;
                const scaleAmount = this.pixelateImageZoom / 100;
                const filters = this.areCanvasFiltersSupported ? this.imageFilters : '';
                Canvas.copy(originalImageCanvas, sourceCanvas, scaleAmount, filters);
                Canvas.copy(originalImageCanvas, transformCanvas, scaleAmount, filters);
                
                if(this.isWebglSupported){
                    transformCanvasWebGl.canvas.width = imageHeader.width;
                    transformCanvasWebGl.canvas.height = imageHeader.height;
                    transformCanvasWebGl.gl.deleteTexture(sourceWebglTexture);
                    sourceWebglTexture = WebGl.createAndLoadTexture(transformCanvasWebGl.gl, sourceCanvas.context.getImageData(0, 0, imageHeader.width, imageHeader.height));
                }
                //we have to unset hue-rotate here, otherwise it will remain set for some reason even though other filters reset
                //sourceCanvas filter needs to be reset after webgl texture is created, otherwise results of the filter won't be saved in the texture
                if(this.areCanvasFiltersSupported && transformCanvas.context.filter){
                    transformCanvas.context.filter = 'hue-rotate(0deg)';
                    sourceCanvas.context.filter = 'hue-rotate(0deg)';
                }
            },
            bilateralFilterValueChanged: function(){
                const filterExponent = this.bilateralFilterValues[this.selectedBilateralFilterValue];
                if(filterExponent < 0){
                    return;
                }
                const imageHeader = this.imageHeader;
                sourceWebglTexture = WebGlBilateralFilter.filterImage(transformCanvasWebGl, sourceWebglTexture, imageHeader.width, imageHeader.height, filterExponent, sourceCanvas);
            },
            //image smoothing after pixelation, before dither
            imageSmoothingBeforeChanged: function(){
                const smoothingRadius = this.imageSmoothingValues[this.selectedImageSmoothingRadiusBefore];
                if(!this.isSmoothingEnabled || smoothingRadius <= 0){
                    return;
                }
                const imageHeader = this.imageHeader;
                //smoothing
                WebGlSmoothing.smooth(transformCanvasWebGl.gl, sourceWebglTexture, imageHeader.width, imageHeader.height, smoothingRadius);
                sourceCanvas.context.drawImage(transformCanvasWebGl.canvas, 0, 0);
                transformCanvasWebGl.gl.deleteTexture(sourceWebglTexture);
                sourceWebglTexture = WebGl.createAndLoadTexture(transformCanvasWebGl.gl, sourceCanvas.context.getImageData(0, 0, imageHeader.width, imageHeader.height));
            },
            //image smoothing after dither
            imageSmoothingAfterChanged: function(){
                const smoothingRadius = this.imageSmoothingValues[this.selectedImageSmoothingRadiusAfter];
                if(!this.isSmoothingEnabled || smoothingRadius <= 0){
                    return false;
                }
                const imageHeader = this.imageHeader;
                //smoothing
                WebGlSmoothing.smooth(transformCanvasWebGl.gl, ditherOutputWebglTexture, imageHeader.width, imageHeader.height, smoothingRadius);
                transformCanvas.context.drawImage(transformCanvasWebGl.canvas, 0, 0);
                return true;
            },
            bilateralFilterValueAfterChanged: function(){
                const filterExponent = this.bilateralFilterValues[this.selectedBilateralFilterValueAfter];
                if(filterExponent < 0){
                    return false;
                }
                const imageHeader = this.imageHeader;
                ditherOutputWebglTexture = WebGlBilateralFilter.filterImage(transformCanvasWebGl, ditherOutputWebglTexture, imageHeader.width, imageHeader.height, filterExponent, transformCanvas);

                return true;
            },
            imageFiltersAfterDitherChanged: function(){
                if(!this.isWebglSupported){
                    return;
                }
                transformCanvasWebGl.gl.deleteTexture(ditherOutputWebglTexture);
                ditherOutputWebglTexture = WebGl.createAndLoadTexture(transformCanvasWebGl.gl, ditherOutputCanvas.context.getImageData(0, 0, this.imageHeader.width, this.imageHeader.height));
                let hasImageBeenTransformed = false;
                hasImageBeenTransformed = this.bilateralFilterValueAfterChanged() || hasImageBeenTransformed;
                hasImageBeenTransformed = this.imageSmoothingAfterChanged() || hasImageBeenTransformed;
                if(!hasImageBeenTransformed){
                    //otherwise image won't be reset if no filters are active
                    Canvas.copy(ditherOutputCanvas, transformCanvas);
                }
                this.zoomImage();
            },
            zoomImage: function(){
                let scaleAmount = this.zoom / this.pixelateImageZoom;
                Canvas.copy(sourceCanvas, sourceCanvasOutput, scaleAmount);
                Canvas.copy(transformCanvas, transformCanvasOutput, scaleAmount);
            },
            resetZoom: function(){
                this.zoom = 100;
            },
            //fit image onto screen
            zoomFit: function(){
                const image = this.loadedImage;
                //if original image is show, image is technically twice as wide
                const widthMultiplier = this.showOriginalImage ? 50 : 100;
                //if controls are pinned, we need to subtract the width of controls
                let windowWidth = window.innerWidth;
                const controlsContainer = this.$refs.controlsContainer; 
                if(getComputedStyle(controlsContainer).getPropertyValue('position') === 'fixed'){
                    windowWidth -= controlsContainer.offsetWidth;
                }
                if(this.showOriginalImage){
                    windowWidth -= parseInt(getComputedStyle(this.$refs.transformCanvasOutput).getPropertyValue('margin-left').replace(/[\D]/, ''));
                }
                //if zoom bar is pinned, we need to subtract height of zoom bar
                let windowHeight = window.innerHeight;
                const zoomBarContainer = this.$refs.zoomBarContainer;
                if(getComputedStyle(zoomBarContainer).getPropertyValue('position') === 'fixed'){
                    windowHeight -= zoomBarContainer.offsetHeight;
                }
                const widthFitPercentage = Math.floor(windowWidth / image.width * widthMultiplier);
                const heightFitPercentage = Math.floor(windowHeight / image.height * 100);
                this.zoom = Math.min(widthFitPercentage, heightFitPercentage);
            },
            cyclePropertyList: VueMixins.cyclePropertyList,
            
            //webworker stuff
            workerMessageReceivedDispatcher: function(e){
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
            onRequestDisplayTransformedImage: function(componentId){
                if(componentId === this.activeDitherComponentId){
                    if(this.isWebglEnabled){
                        //copy output to ditherOutputCanvas so we don't lose it for post filter dithers
                        Canvas.copy(transformCanvas, ditherOutputCanvas);
                        this.imageFiltersAfterDitherChanged();
                    }
                    this.zoomImage();
                }
            },
            onCanvasesRequested: function(componentId, callback){
                if(componentId === this.activeDitherComponentId){
                    callback(transformCanvas, transformCanvasWebGl, sourceWebglTexture);
                }
            },
            //used to build callback functions for onRequestDisplayTransformedImage and onCanvasesRequested
            //so that requester is not aware of, and thus cannot change their componentId
            requestPermissionCallbackBuilder: function(componentId, callback){
                return (...args)=>{
                    callback(componentId, ...args);
                };
            },
            onWorkerRequested: function(callback){
                let worker = ditherWorkers.getNextWorker();
                callback(worker);
            },
            showModalPrompt: function(...modalPromptArgs){
                this.$refs.modalPromptComponent.show(...modalPromptArgs);
            },
        }
    });
})(window.Vue, App.Canvas, App.Timer, App.WorkerUtil, App.WebGl, App.Polyfills, App.WorkerHeaders, App.Constants, App.VueMixins, App.EditorThemes, App.UserSettings, App.AlgorithmModel, App.WebGlSmoothing, App.WebGlBilateralFilter, App.WebGlCanvasFilters, App.ImageFiltersModel);