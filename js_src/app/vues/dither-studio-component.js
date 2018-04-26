(function(Vue, Fs, Canvas, Timer, WorkerUtil, WebGl, Polyfills, WorkerHeaders, Constants, VueMixins){
    //webworker stuff
    var ditherWorkers;
    
    //canvases
    var sourceCanvas;
    var originalImageCanvas;
    var transformCanvas;
    var transformCanvasWebGl;
    var sourceCanvasOutput;
    var transformCanvasOutput;
    var saveImageCanvas;
    
    var sourceWebglTexture;

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
    
    var app = Vue.component('dither-studio', {
        template: document.getElementById('dither-studio-component'),
        created: function(){
            this.currentEditorThemeIndex = 0;
            
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
        },
        mounted: function(){
            const refs = this.$refs;
            originalImageCanvas = Canvas.create(refs.originalImageCanvas);
            sourceCanvasOutput = Canvas.create(refs.sourceCanvasOutput);
            transformCanvasOutput = Canvas.create(refs.transformCanvasOutput);
            
            sourceCanvas = Canvas.create(refs.sourceCanvas);
            transformCanvas = Canvas.create(refs.transformCanvas);
            transformCanvasWebGl = Canvas.createWebgl(refs.transformCanvasWebgl);
            sourceCanvasOutput = Canvas.create(refs.sourceCanvasOutput);
            transformCanvasOutput = Canvas.create(refs.transformCanvasOutput);
            saveImageCanvas = Canvas.create(refs.saveImageCanvas);
            
            //check for webgl support
            this.isWebglSupported = !!transformCanvasWebGl.gl;
            this.isWebglEnabled = this.isWebglSupported;
        },
        data: function(){
            return {
                bwDitherComponentId: 0,
                colorDitherComponentId: 1,
                activeDitherComponentId: 1,
                activeControlsTab: 0,
                //loadedImage has properties: width, height, fileName, fileType, fileSize
                loadedImage: null,
                saveImageFileName: '',
                saveImageFileType: 'image/png',
                isLivePreviewEnabled: true,
                isCurrentlyLoadingImageUrl: false,
                isWebglSupported: false,
                isWebglEnabled: false,
                zoom: 100,
                zoomDisplay: 100, //this is so invalid zoom levels can be incrementally typed into input box, and not immediately validated and changed
                selectedPixelateImageZoom: 0,
                zoomMin: 10,
                zoomMax: 400,
                showOriginalImage: true,
                editorThemes: [{name: 'White', className: 'editor-white'}, {name: 'Light', className: 'editor-light'}, {name: 'Dark', className: 'editor-dark'}, {name: 'Black', className: 'editor-black'},],
                currentEditorThemeIndex: null,
                openImageErrorMessage: null,
                showWebglWarningMessage: false,
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
        },
        watch: {
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
                if(oldThemeIndex !== null){
                    let oldThemeClass = this.editorThemes[oldThemeIndex].className;
                    classList.remove(oldThemeClass);
                }
                let newThemeClass = this.editorThemes[newThemeIndex].className;
                classList.add(newThemeClass);
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
                    this.imagePixelationChanged(originalImageCanvas, this.imageHeader);   
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
                //TODO don't reload image if tab has already loaded it- instead create active tab hook
                if(this.isImageLoaded){
                    this.activeDitherSection.imageLoaded(this.imageHeader);   
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
                Fs.saveImage(sourceCanvas.canvas, this.loadedImage.fileType, (objectUrl)=>{
                    saveImageLink.href = objectUrl;
                    saveImageLink.download = this.saveImageFileName + this.saveImageFileExtension;
                    saveImageLink.click();
                });
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
                Fs.openImageUrl(imageUrl, (image, file)=>{
                    this.loadImage(image, file);
                    this.isCurrentlyLoadingImageUrl = false;
                }).catch((error)=>{
                    this.loadImageFromUrlFailed(error, imageUrl);
                });
            },
            loadRandomImage: function(){
                this.isCurrentlyLoadingImageUrl = true;
                const imageWidth = Math.min(window.innerWidth, Constants.randomImageMaxWidth);
                const imageHeight = Math.min(window.innerHeight, Constants.randomImageMaxHeight);
                const randomImageUrl = `https://source.unsplash.com/random/${imageWidth}x${imageHeight}`;
                
                Fs.openImageUrl(randomImageUrl, (image, file)=>{
                    this.loadImage(image, file);
                    this.isCurrentlyLoadingImageUrl = false;
                }, 'unsplash-random-image').catch(this.loadImageFromUrlFailed);
            },
            loadImage: function(image, file){
                this.openImageErrorMessage = null;
                this.loadedImage = {
                    width: image.width,
                    height: image.height,
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type,
                };
                //show webgl warning if any, until user closes it
                this.showWebglWarningMessage = true;
                this.saveImageFileName = file.name.replace(/\.(png|bmp|jpg|jpeg)$/i, '');
                this.saveImageFileType = file.type;
                Canvas.loadImage(originalImageCanvas, image);
                
                this.imagePixelationChanged(originalImageCanvas, this.imageHeader);
            },
            imagePixelationChanged: function(canvas, imageHeader){
                let scaleAmount = this.pixelateImageZoom / 100;
                Canvas.scale(canvas, sourceCanvas, scaleAmount);
                Canvas.scale(canvas, transformCanvas, scaleAmount);
                
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
                var buffer = Canvas.createSharedImageBuffer(sourceCanvas);
                let ditherWorkerHeader = WorkerUtil.ditherWorkerLoadImageHeader(imageHeader.width, imageHeader.height);
                ditherWorkers.forEach((ditherWorker)=>{
                    //copy image to web workers
                    ditherWorker.postMessage(ditherWorkerHeader);
                    ditherWorker.postMessage(buffer);
                });
                
                //todo could potentially wait to create texture until first time webgl algorithm is called
                if(this.isWebglSupported){
                    transformCanvasWebGl.gl.deleteTexture(sourceWebglTexture);
                    sourceWebglTexture = WebGl.createAndLoadTexture(transformCanvasWebGl.gl, sourceCanvas.context.getImageData(0, 0, imageHeader.width, imageHeader.height));
                }
                
                //call selected tab image loaded hook here
                this.activeDitherSection.imageLoaded(imageHeader);
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
                    case WorkerHeaders.HUE_HISTOGRAM:
                    case WorkerHeaders.DITHER_COLOR:
                    case WorkerHeaders.OPTIMIZE_PALETTE:
                        this.$refs.colorDitherSection.ditherWorkerMessageReceivedDispatcher(messageTypeId, pixels);
                        break;
                    default:
                        break;
                }
            },
            onRequestDisplayTransformedImage: function(componentId){
                if(componentId === this.activeDitherComponentId){
                    this.zoomImage();
                }
            },
            onCanvasesRequested: function(componentId, callback){
                if(componentId === this.activeDitherComponentId){
                    callback(transformCanvas, transformCanvasWebGl, sourceWebglTexture);
                }
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
    
    var saveImageLink = document.createElement('a');
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    
})(window.Vue, App.Fs, App.Canvas, App.Timer, App.WorkerUtil, App.WebGl, App.Polyfills, App.WorkerHeaders, App.Constants, App.VueMixins);