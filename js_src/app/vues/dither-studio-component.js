(function(Vue, Fs, Canvas, Timer, WorkerUtil, WebGl, Polyfills, WorkerHeaders, Constants, VueMixins){
    //webworker stuff
    var ditherWorkers;
    
    //canvases
    var originalImageCanvas;
    var sourceCanvasOutput;
    var transformCanvasOutput;
    var saveImageCanvas;
    
    var sourceWebglTexture;

    //imageDimensions = height * width
    //percentage is 0-100
    //returns percentage 0-100
    function calculatePixelationZoom(imageDimensions, percentage){
        const percentageFraction = percentage / 100;
        //based on 720 x 960 image
        const baseDimensions = 691200 * percentageFraction;
        return Math.ceil(baseDimensions / imageDimensions * 100);
    }
    
    var app = Vue.component('dither-studio', {
        template: document.getElementById('dither-studio-component'),
        mounted: function(){
            WorkerUtil.getDitherWorkers(Constants.ditherWorkerUrl).then((workers)=>{
                ditherWorkers = workers;
                ditherWorkers.forEach((ditherWorker)=>{
                    ditherWorker.onmessage = this.workerMessageReceivedDispatcher; 
                 });
                 this.areWorkersInitialized = true;
            });
            
            let refs = this.$refs;
            originalImageCanvas = Canvas.create(refs.originalImageCanvas);
            sourceCanvasOutput = Canvas.create(refs.sourceCanvasOutput);
            transformCanvasOutput = Canvas.create(refs.transformCanvasOutput);
            
            this.sourceCanvas = Canvas.create(refs.sourceCanvas);
            this.transformCanvas = Canvas.create(refs.transformCanvas);
            this.transformCanvasWebGl = Canvas.createWebgl(refs.transformCanvasWebgl);
            sourceCanvasOutput = Canvas.create(refs.sourceCanvasOutput);
            transformCanvasOutput = Canvas.create(refs.transformCanvasOutput);
            saveImageCanvas = Canvas.create(refs.saveImageCanvas);
            
            this.currentEditorThemeIndex = 0;
            //check for webgl support
            this.isWebglSupported = !!this.transformCanvasWebGl.gl;
            this.isWebglEnabled = this.isWebglSupported;

            fileInput.addEventListener('change', (e)=>{
                Fs.openImageFile(e, this.loadImage);
                fileInput.value = null;
            }, false);  
        },
        data: function(){
            return {
                areWorkersInitialized: false,
                activeDitherTab: 1,
                activeControlsTab: 0,
                sourceCanvas: null,
                transformCanvas: null,
                transformCanvasWebGl: null,
                //loadedImage has properties: width, height, fileName, fileType, fileSize
                loadedImage: null,
                saveImageFileName: '',
                saveImageFileType: 'image/png',
                isLivePreviewEnabled: true,
                isCurrentlyLoadingRandomImage: false,
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
                if(this.activeDitherTab === 0){
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
                if(!this.isImageLoaded){
                    return [{title: 'None', value: 100}];
                }
                const dimensions = this.loadedImage.height * this.loadedImage.width;
                return [
                    {title: 'None', value: 100},
                    {title: 'Low', value: calculatePixelationZoom(dimensions, 50)},
                    {title: 'Medium', value: calculatePixelationZoom(dimensions, 25)},
                    {title: 'High', value: calculatePixelationZoom(dimensions, 15)},
                    {title: 'Ultra', value: calculatePixelationZoom(dimensions, 10)},
                    {title: 'Extreme', value: calculatePixelationZoom(dimensions, 5)},
                ];
            },
            pixelateImageZoom: function(){
                return this.pixelateImageZooms[this.selectedPixelateImageZoom].value;
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
            loadDitherTab: function(tabIndex){
                if(tabIndex === this.activeDitherTab){
                    return;
                }
                this.activeDitherTab = tabIndex;
                //todo don't reload image if tab has already loaded it- instead create active tab hook
                if(this.isImageLoaded){
                    this.activeDitherSection.imageLoaded(this.imageHeader, sourceWebglTexture);   
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
                Canvas.scale(this.transformCanvas, saveImageCanvas, 100 / this.pixelateImageZoom);
                Fs.saveImage(saveImageCanvas.canvas, this.loadedImage.fileType, (objectUrl)=>{
                    saveImageLink.href = objectUrl;
                    saveImageLink.download = this.saveImageFileName + this.saveImageFileExtension;
                    saveImageLink.click();
                });
            },
            loadRandomImage: function(){
                this.isCurrentlyLoadingRandomImage = true;
                
                Fs.openRandomImage((image, file)=>{
                    this.loadImage(image, file);
                    this.isCurrentlyLoadingRandomImage = false;
                });
            },
            loadImage: function(image, file){
                this.loadedImage = {
                    width: image.width,
                    height: image.height,
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type,
                };
                this.saveImageFileName = file.name.replace(/\.(png|bmp|jpg|jpeg)$/i, '');
                this.saveImageFileType = file.type;
                Canvas.loadImage(originalImageCanvas, image);
                
                this.imagePixelationChanged(originalImageCanvas, this.imageHeader);
            },
            imagePixelationChanged: function(canvas, imageHeader){
                let scaleAmount = this.pixelateImageZoom / 100;
                Canvas.scale(canvas, this.sourceCanvas, scaleAmount);
                Canvas.scale(canvas, this.transformCanvas, scaleAmount);
                
                this.transformCanvasWebGl.canvas.width = imageHeader.width;
                this.transformCanvasWebGl.canvas.height = imageHeader.height;
                
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
                var buffer = Canvas.createSharedImageBuffer(this.sourceCanvas);
                let ditherWorkerHeader = WorkerUtil.ditherWorkerLoadImageHeader(imageHeader.width, imageHeader.height);
                ditherWorkers.forEach((ditherWorker)=>{
                    //copy image to web workers
                    ditherWorker.postMessage(ditherWorkerHeader);
                    ditherWorker.postMessage(buffer);
                });
                
                //todo could potentially wait to create texture until first time webgl algorithm is called
                if(this.isWebglSupported){
                    this.transformCanvasWebGl.gl.deleteTexture(sourceWebglTexture);
                    sourceWebglTexture = WebGl.createAndLoadTexture(this.transformCanvasWebGl.gl, this.sourceCanvas.context.getImageData(0, 0, imageHeader.width, imageHeader.height));
                }
                
                //call selected tab image loaded hook here
                this.activeDitherSection.imageLoaded(imageHeader, sourceWebglTexture);
            },
            zoomImage: function(){
                let scaleAmount = this.zoom / this.pixelateImageZoom;
                Canvas.scale(this.sourceCanvas, sourceCanvasOutput, scaleAmount);
                Canvas.scale(this.transformCanvas, transformCanvasOutput, scaleAmount);
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
            onWorkerRequested: function(callback){
                let worker = ditherWorkers.getNextWorker();
                callback(worker);
            },
        }
    });
    
    var saveImageLink = document.createElement('a');
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    
})(window.Vue, App.Fs, App.Canvas, App.Timer, App.WorkerUtil, App.WebGl, App.Polyfills, App.WorkerHeaders, App.Constants, App.VueMixins);