(function(Vue, Fs, Canvas, Timer, WorkerUtil, WebGl, Polyfills, WorkerHeaders){
    //webworker stuff
    var ditherWorkers = WorkerUtil.createDitherWorkers('/js/dither-worker.js');
    
    //canvases
    var sourceCanvasOutput = Canvas.create('source-canvas-output');
    var transformCanvasOutput = Canvas.create('transform-canvas-output');
    
    var sourceWebglTexture;
    
    var app = new Vue({
        el: '#app',
        mounted: function(){
            ditherWorkers.forEach((ditherWorker)=>{
               ditherWorker.onmessage = this.workerMessageReceivedDispatcher; 
            });
            
            this.sourceCanvas = Canvas.create('source-canvas');
            this.transformCanvas = Canvas.create('transform-canvas');
            this.transformCanvasWebGl = Canvas.createWebgl('transform-canvas-webgl');
            sourceCanvasOutput = Canvas.create('source-canvas-output');
            transformCanvasOutput = Canvas.create('transform-canvas-output');
            
            this.currentEditorThemeIndex = 0;
            //check for webgl support
            this.isWebglSupported = !!this.transformCanvasWebGl.gl;
            this.isWebglEnabled = this.isWebglSupported;
            
        },
        data: {
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
            zoom: 100,
            zoomMin: 10,
            zoomMax: 400,
            showOriginalImage: true,
            editorThemes: [{name: 'Light', className: 'editor-light'}, {name: 'Gray', className: 'editor-gray'}, {name: 'Dark', className: 'editor-dark'},],
            currentEditorThemeIndex: null,
        },
        computed: {
            isImageLoaded: function(){
              return this.loadedImage != null;  
            },
            imageTitle: function(){
                if(this.loadedImage){
                    return this.loadedImage.fileName || '';
                }
                return '';
            },
            
        },
        watch: {
            currentEditorThemeIndex: function(newThemeIndex){
                document.documentElement.className = this.editorThemes[newThemeIndex].className;
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
                let outputCanvas = this.transformCanvas.canvas;
                let dataURL = outputCanvas.toDataURL(this.loadedImage.fileType);
                saveImageLink.href = dataURL;
                saveImageLink.download = this.loadedImage.fileName;
                saveImageLink.click();
            },
            loadRandomImage: function(){
                this.isCurrentlyLoadingRandomImage = true;
                var randomImageUrl = 'https://source.unsplash.com/random/800x600';
                Fs.openRandomImage(randomImageUrl, (image, file)=>{
                    this.loadImage(image, file);
                    this.isCurrentlyLoadingRandomImage = false;
                });
            },
            loadImage: function(image, file){
                Canvas.loadImage(this.sourceCanvas, image);
                Canvas.loadImage(this.transformCanvas, image);
                
                this.transformCanvasWebGl.canvas.width = image.width;
                this.transformCanvasWebGl.canvas.height = image.height;
                
                this.loadedImage = {
                    width: image.width,
                    height: image.height,
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type,
                };
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
                let ditherWorkerHeader = WorkerUtil.ditherWorkerLoadImageHeader(this.loadedImage.width, this.loadedImage.height);
                ditherWorkers.forEach((ditherWorker)=>{
                    //copy image to web workers
                    ditherWorker.postMessage(ditherWorkerHeader);
                    ditherWorker.postMessage(buffer);
                });
                
                //todo could potentially wait to create texture until first time webgl algorithm is called
                if(this.isWebglSupported){
                    this.transformCanvasWebGl.gl.deleteTexture(sourceWebglTexture);
                    sourceWebglTexture = WebGl.createAndLoadTexture(this.transformCanvasWebGl.gl, this.sourceCanvas.context.getImageData(0, 0, this.loadedImage.width, this.loadedImage.height));
                }
                
                //call selected tab image loaded hook here
                this.$refs.bwDitherSection.imageLoaded(this.loadedImage, sourceWebglTexture);
            },
            zoomImage: function(){
                var scaleAmount = this.zoom / 100;
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
                let pixels = pixelsFull.subarray(1, pixelsFull.length);
                switch(messageTypeId){
                    case WorkerHeaders.DITHER:
                    case WorkerHeaders.DITHER_BW:
                    case WorkerHeaders.HISTOGRAM:
                        this.$refs.bwDitherSection.ditherWorkerMessageReceivedDispatcher(messageTypeId, pixels);
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
    fileInput.addEventListener('change', (e)=>{
        Fs.openImageFile(e, app.loadImage);   
    }, false);
    
    
})(window.Vue, App.Fs, App.Canvas, App.Timer, App.WorkerUtil, App.WebGl, App.Polyfills, App.WorkerHeaders);