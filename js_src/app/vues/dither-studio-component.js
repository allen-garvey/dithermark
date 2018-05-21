(function(Vue, Fs, Canvas, Timer, WorkerUtil, WebGl, Polyfills, WorkerHeaders, Constants, VueMixins, EditorThemes, UserSettings, RandomImage, AlgorithmModel, WebGlSmoothing, WebGlBilateralFilter){
    //webworker stuff
    let ditherWorkers;
    
    //canvases
    let sourceCanvas;
    let originalImageCanvas;
    let transformCanvas;
    let transformCanvasWebGl;
    let sourceCanvasOutput;
    let transformCanvasOutput;
    let saveImageCanvas;
    
    let sourceWebglTexture;
    let ditherOutputWebglTexture;

    //saving and loading image elements
    let saveImageLink;
    let fileInput;

    //used to keep track of which tabs have loaded a new image to them, after an image is loaded
    //this is because originally, only the active tab when an image is loaded will register it as new
    const tabsThatHaveSeenImageSet = new Set();

    //imageDimensions = height * width
    //percentage is 0-100
    //returns percentage 0-100
    function calculatePixelationZoom(imageDimensions, percentage){
        if(percentage >= 100){
            return 100;
        }
        //based on 720 x 960 image, since large images won't be pixelized enough
        const baseDimensions = Math.min(691200, imageDimensions) * percentage;
        return Math.ceil(baseDimensions / imageDimensions);
    }
    
    //canvas css filters
    const imageFilterValues = [0, 30, 40, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 150, 160, 180, 200];
    const contrastFilterValues = imageFilterValues.filter((value)=>{ return value >= 100; });

    Vue.component('dither-studio', {
        template: document.getElementById('dither-studio-component'),
        created: function(){
            //initialize saving and loading image elements
            saveImageLink = document.createElement('a');
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            
            fileInput.addEventListener('change', (e)=>{
                Fs.openImageFile(e, this.loadImage, (errorMessage)=>{
                    this.openImageErrorMessage = errorMessage;
                });
                fileInput.value = null;
            }, false);

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
            saveImageCanvas = Canvas.create();
            this.areCanvasFiltersSupported = Canvas.areCanvasFiltersSupported(originalImageCanvas);

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
            //check for webgl support
            this.isWebglSupported = !!transformCanvasWebGl.gl;
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
                saveImageFileName: '',
                saveImageFileType: 'image/png',
                isLivePreviewEnabled: true,
                automaticallyResizeLargeImages: true,
                isCurrentlyLoadingImageUrl: false,
                isWebglSupported: false,
                isWebglEnabled: false,
                zoom: 100,
                zoomDisplay: 100, //this is so invalid zoom levels can be incrementally typed into input box, and not immediately validated and changed
                /**
                 * Filters
                 */
                //pixelation
                selectedPixelateImageZoom: 0,
                //smoothing
                imageSmoothingValues: [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16],
                selectedImageSmoothingRadiusBefore: 0,
                selectedImageSmoothingRadiusAfter: 0,
                //bilateral filter
                bilateralFilterValues: [-1, 0, 5, 7, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25],
                selectedBilateralFilterValue: 0,
                //selectedImageSaturationIndex and selectedImageContrastIndex use this array
                imageFilterValues: imageFilterValues,
                contrastFilterValues: contrastFilterValues,
                selectedImageSaturationIndex: imageFilterValues.indexOf(100),
                selectedImageContrastIndex: 0,
                areCanvasFiltersSupported: false, //required for increasing image contrast and saturation
                zoomMin: 10,
                zoomMax: 400,
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
            saveImageFileExtension: function(){
                if(this.saveImageFileType === 'image/jpeg'){
                    return '.jpg';
                }
                return '.png';
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
                        value: calculatePixelationZoom(dimensions, zoom),
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
            imageFilters: function(){
                if(!this.areCanvasFiltersSupported){
                    return '';
                }
                const filters = [];
                const contrast = this.contrastFilterValues[this.selectedImageContrastIndex];
                const saturation = this.imageFilterValues[this.selectedImageSaturationIndex];
                //100% is unchanged
                if(contrast !== 100){
                    filters.push(`contrast(${contrast}%)`);
                }
                if(saturation !== 100){
                    filters.push(`saturate(${saturation}%)`);
                }
                return filters.join(' ');
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
                if(oldValue === null){
                    //make links open in new tab now, so user won't lose saved work
                    document.querySelectorAll('.nav a').forEach((link)=>{
                        link.target = '_blank';
                    });
                }
            },
            saveImageFileName: function(newValue, oldValue){
                if(newValue === oldValue){
                    return;
                }
                let title = Constants.appName;
                if(newValue){
                    title = `${title} | ${newValue}`;
                }
                document.title = title;
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
            selectedImageSmoothingRadiusBefore: function(newValue, oldValue){
                if(this.isImageLoaded && newValue !== oldValue){
                    this.imageFiltersBeforeDitherChanged();
                }
            },
            selectedImageSmoothingRadiusAfter: function(newValue, oldValue){
                if(this.isImageLoaded && newValue !== oldValue){
                    this.imageSmoothingAfterChanged();
                    this.zoomImage();
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
            loadImageTrigger: function(){
                fileInput.click();
            },
            //downloads image
            //based on: https://stackoverflow.com/questions/30694433/how-to-give-browser-save-image-as-option-to-button
            saveImage: function(){
                //if the image is pixelated, that means the transformCanvas is scaled down,
                //so we have to scale it back up to 100% first. Otherwise, we can just use the transformCanvas
                //directly, for a performance gain
                let sourceCanvas = transformCanvas;
                if(this.pixelateImageZoom !== 100){
                    Canvas.scale(transformCanvas, saveImageCanvas, 100 / this.pixelateImageZoom);
                    sourceCanvas = saveImageCanvas;
                }
                Fs.saveImage(sourceCanvas.canvas, this.saveImageFileType, (objectUrl)=>{
                    saveImageLink.href = objectUrl;
                    saveImageLink.download = this.saveImageFileName + this.saveImageFileExtension;
                    saveImageLink.click();
                });
                //follow Unsplash API guidelines for triggering download
                //https://medium.com/unsplash/unsplash-api-guidelines-triggering-a-download-c39b24e99e02
                if(this.loadedImage.unsplash){
                    //arguably should be POST request here, but much easier to just use GET
                    fetch(`${Constants.unsplashDownloadUrl}?photo_id=${this.loadedImage.unsplash.id}`);
                }
            },
            loadImageFromUrlFailed: function(error, imageUrl){
                this.openImageErrorMessage = Fs.messageForOpenImageUrlError(error, imageUrl);
                this.isCurrentlyLoadingImageUrl = false;
            },
            showOpenImageUrlPrompt: function(){
                this.showModalPrompt('Image Url', '', this.loadImageUrl, {okButtonValue: 'Open', inputType: 'url', placeholder: 'http://example.com/image.jpg'});
            },
            loadImageUrl: function(imageUrl){
                if(!imageUrl){
                    return;
                }
                this.isCurrentlyLoadingImageUrl = true;
                Fs.openImageUrl(imageUrl).then(({image, file})=>{
                    this.loadImage(image, file);
                    this.isCurrentlyLoadingImageUrl = false;
                }).catch((error)=>{
                    this.loadImageFromUrlFailed(error, imageUrl);
                });
            },
            loadRandomImage: function(){
                this.isCurrentlyLoadingImageUrl = true;
                
                RandomImage.get(window.innerWidth, window.innerHeight).then(({image, file})=>{
                    this.loadImage(image, file);
                    this.isCurrentlyLoadingImageUrl = false;
                }).catch(this.loadImageFromUrlFailed);
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
                this.saveImageFileName = file.name.replace(/\.(png|bmp|jpg|jpeg)$/i, '');
                
                //resize large images if necessary
                const largeImageDimensionThreshold = 1200;
                const largestImageDimension = Math.max(loadedImage.width, loadedImage.height);
                if(this.automaticallyResizeLargeImages && largestImageDimension > largeImageDimensionThreshold){
                    const resizePercentage = largeImageDimensionThreshold / largestImageDimension;
                    Canvas.loadImageScaled(originalImageCanvas, image, resizePercentage);
                    loadedImage.width = originalImageCanvas.canvas.width;
                    loadedImage.height = originalImageCanvas.canvas.height;
                }
                else{
                    Canvas.loadImage(originalImageCanvas, image);
                }
                originalImageCanvas.context.drawImage(originalImageCanvas.canvas, 0, 0);
                //finish loading image
                this.loadedImage = loadedImage;
                this.imageFiltersBeforeDitherChanged(false);
                tabsThatHaveSeenImageSet.clear();
                tabsThatHaveSeenImageSet.add(this.activeDitherComponentId);
                this.activeDitherSection.imageLoaded(this.imageHeader, true);
            },
            imageFiltersBeforeDitherChanged: function(notifyDitherSection=true){
                this.imagePixelationChanged();
                this.bilateralFilterValueChanged();
                this.imageSmoothingBeforeChanged();
                if(notifyDitherSection){
                    this.activeDitherSection.imageLoaded(this.imageHeader);
                }
            },
            imagePixelationChanged: function(){
                const imageHeader = this.imageHeader;
                const scaleAmount = this.pixelateImageZoom / 100;
                const filters = this.imageFilters;
                Canvas.scale(originalImageCanvas, sourceCanvas, scaleAmount, filters);
                Canvas.scale(originalImageCanvas, transformCanvas, scaleAmount, filters);
                
                transformCanvasWebGl.canvas.width = imageHeader.width;
                transformCanvasWebGl.canvas.height = imageHeader.height;
                
                //adjust zoom
                this.zoomMax = Canvas.maxScalePercentageForImage(this.loadedImage.width, this.loadedImage.height, Math.ceil(window.innerWidth * 2 * Canvas.devicePixelRatio));
                this.zoomMin = Canvas.minScalePercentageForImage(this.loadedImage.width, this.loadedImage.height, 200);
                if(this.zoom > this.zoomMax){
                    this.zoom = this.zoomMax;
                }
                else if(this.zoom < this.zoomMin){
                    this.zoom = this.zoomMin;
                }

                //load image into the webworkers
                const buffer = Canvas.createSharedImageBuffer(sourceCanvas);
                const ditherWorkerHeader = WorkerUtil.ditherWorkerLoadImageHeader(imageHeader.width, imageHeader.height);
                ditherWorkers.forEach((ditherWorker)=>{
                    //copy image to web workers
                    ditherWorker.postMessage(ditherWorkerHeader);
                    ditherWorker.postMessage(buffer);
                });
                
                //could potentially wait to create texture until first time webgl algorithm is called
                if(this.isWebglSupported){
                    transformCanvasWebGl.gl.deleteTexture(sourceWebglTexture);
                    sourceWebglTexture = WebGl.createAndLoadTexture(transformCanvasWebGl.gl, sourceCanvas.context.getImageData(0, 0, imageHeader.width, imageHeader.height));
                }
            },
            bilateralFilterValueChanged: function(){
                const filterExponent = this.bilateralFilterValues[this.selectedBilateralFilterValue];
                if(!this.isWebglSupported || filterExponent < 0){
                    return;
                }

                const imageHeader = this.imageHeader;
                //do the filter twice for better results
                for(let i=0;i<2;i++){
                    WebGlBilateralFilter.filter(transformCanvasWebGl.gl, sourceWebglTexture, imageHeader.width, imageHeader.height, filterExponent);
                    sourceCanvas.context.drawImage(transformCanvasWebGl.canvas, 0, 0);
                    transformCanvasWebGl.gl.deleteTexture(sourceWebglTexture);
                    sourceWebglTexture = WebGl.createAndLoadTexture(transformCanvasWebGl.gl, sourceCanvas.context.getImageData(0, 0, imageHeader.width, imageHeader.height));
                }
                
                //load image into the webworkers
                //TODO: only do this once after all before dither filters are completed
                const buffer = Canvas.createSharedImageBuffer(sourceCanvas);
                let ditherWorkerHeader = WorkerUtil.ditherWorkerLoadImageHeader(imageHeader.width, imageHeader.height);
                ditherWorkers.forEach((ditherWorker)=>{
                    //copy image to web workers
                    ditherWorker.postMessage(ditherWorkerHeader);
                    ditherWorker.postMessage(buffer);
                });
            },
            //image smoothing after pixelation, before dither
            imageSmoothingBeforeChanged: function(){
                const smoothingRadius = this.imageSmoothingValues[this.selectedImageSmoothingRadiusBefore];
                if(!this.isWebglSupported || smoothingRadius <= 0){
                    return;
                }
                const imageHeader = this.imageHeader;
                //smoothing
                WebGlSmoothing.smooth(transformCanvasWebGl.gl, sourceWebglTexture, imageHeader.width, imageHeader.height, smoothingRadius);
                sourceCanvas.context.drawImage(transformCanvasWebGl.canvas, 0, 0);
                transformCanvasWebGl.gl.deleteTexture(sourceWebglTexture);
                sourceWebglTexture = WebGl.createAndLoadTexture(transformCanvasWebGl.gl, sourceCanvas.context.getImageData(0, 0, imageHeader.width, imageHeader.height));
                
                //load image into the webworkers
                const buffer = Canvas.createSharedImageBuffer(sourceCanvas);
                let ditherWorkerHeader = WorkerUtil.ditherWorkerLoadImageHeader(imageHeader.width, imageHeader.height);
                ditherWorkers.forEach((ditherWorker)=>{
                    //copy image to web workers
                    ditherWorker.postMessage(ditherWorkerHeader);
                    ditherWorker.postMessage(buffer);
                });
            },
            //image smoothing after dither
            imageSmoothingAfterChanged: function(){
                const smoothingRadius = this.imageSmoothingValues[this.selectedImageSmoothingRadiusAfter];
                //we still have to do perform this function if smoothingRadius is 0,
                //because otherwise smoothing cannot be reset to 'none' once an image has been smoothed
                if(!Constants.isSmoothingEnabled || !this.isWebglSupported){
                    return;
                }
                const imageHeader = this.imageHeader;
                //smoothing
                WebGlSmoothing.smooth(transformCanvasWebGl.gl, ditherOutputWebglTexture, imageHeader.width, imageHeader.height, smoothingRadius);
                transformCanvas.context.drawImage(transformCanvasWebGl.canvas, 0, 0);
            },
            zoomImage: function(){
                let scaleAmount = this.zoom / this.pixelateImageZoom;
                Canvas.scale(sourceCanvas, sourceCanvasOutput, scaleAmount);
                Canvas.scale(transformCanvas, transformCanvasOutput, scaleAmount);
            },
            resetZoom: function(){
                this.zoom = 100;
            },
            cyclePropertyList: VueMixins.cyclePropertyList,
            
            //webworker stuff
            workerMessageReceivedDispatcher: function(e){
                let messageData = e.data;
                let pixelsFull = new Uint8Array(messageData);
                //get messageTypeId from start of buffer
                let messageTypeId = pixelsFull[0];
                //rest of the buffer is the actual pixel data
                let pixels = pixelsFull.subarray(1);
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
                    transformCanvasWebGl.gl.deleteTexture(ditherOutputWebglTexture);
                    ditherOutputWebglTexture = WebGl.createAndLoadTexture(transformCanvasWebGl.gl, transformCanvas.context.getImageData(0, 0, this.imageHeader.width, this.imageHeader.height));
                    this.imageSmoothingAfterChanged();
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
})(window.Vue, App.Fs, App.Canvas, App.Timer, App.WorkerUtil, App.WebGl, App.Polyfills, App.WorkerHeaders, App.Constants, App.VueMixins, App.EditorThemes, App.UserSettings, App.RandomImage, App.AlgorithmModel, App.WebGlSmoothing, App.WebGlBilateralFilter);