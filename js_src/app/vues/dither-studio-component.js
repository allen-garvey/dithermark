(function(Vue, Fs, Canvas, Timer, WorkerUtil, WebGl, Polyfills, WorkerHeaders){
    //webworker stuff
    var ditherWorkers;
    
    //canvases
    var originalImageCanvas;
    var sourceCanvasOutput;
    var transformCanvasOutput;
    var saveImageCanvas;
    
    var sourceWebglTexture;
    
    var app = Vue.component('dither-studio', {
        template: document.getElementById('dither-studio-component'),
        mounted: function(){
            ditherWorkers = WorkerUtil.createDitherWorkers('/js/dither-worker.js');
            ditherWorkers.forEach((ditherWorker)=>{
               ditherWorker.onmessage = this.workerMessageReceivedDispatcher; 
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
            }, false);  
        },
        data: function(){
            return {
                activeTab: 0,
                sourceCanvas: null,
                transformCanvas: null,
                transformCanvasWebGl: null,
                //loadedImage has properties: width, height, fileName, fileType, fileSize
                loadedImage: null,
                isLivePreviewEnabled: true,
                isCurrentlyLoadingRandomImage: false,
                isWebglSupported: false,
                isWebglEnabled: false,
                areControlsPinned: false,
                zoom: 100,
                pixelateImageZoom: 100,
                zoomMin: 10,
                zoomMax: 400,
                showOriginalImage: true,
                editorThemes: [{name: 'Light', className: 'editor-light'}, {name: 'Gray', className: 'editor-gray'}, {name: 'Dark', className: 'editor-dark'},],
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
            imageTitle: function(){
                if(this.loadedImage){
                    return this.loadedImage.fileName || '';
                }
                return '';
            },
            activeDitherSection: function(){
                if(this.activeTab === 0){
                    return this.$refs.bwDitherSection;
                }
                return this.$refs.colorDitherSection;
            },
        },
        watch: {
            currentEditorThemeIndex: function(newThemeIndex, oldThemeIndex){
                let classList = document.documentElement.classList;
                if(oldThemeIndex !== null){
                    let oldThemeClass = this.editorThemes[oldThemeIndex].className;
                    classList.remove(oldThemeClass);
                }
                let newThemeClass = this.editorThemes[newThemeIndex].className;
                classList.add(newThemeClass);
            },
            areControlsPinned: function(newValue){
                let classList = document.documentElement.classList;
                if(newValue){
                    classList.add('fixed-controls');
                }
                else{
                    classList.remove('fixed-controls');
                }
            },
            zoom: function(newZoom, oldZoom){
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
                }
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
            loadTab: function(tabIndex){
                if(tabIndex === this.activeTab){
                    return;
                }
                this.activeTab = tabIndex;
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
                saveImageLink.href = saveImageCanvas.canvas.toDataURL(this.loadedImage.fileType);
                saveImageLink.download = this.loadedImage.fileName;
                saveImageLink.click();
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
    
    var saveImageLink = document.getElementById('save-image-link');
    var fileInput = document.getElementById('file-input');
    
})(window.Vue, App.Fs, App.Canvas, App.Timer, App.WorkerUtil, App.WebGl, App.Polyfills, App.WorkerHeaders);