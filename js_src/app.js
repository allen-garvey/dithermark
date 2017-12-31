(function(Vue, Fs, Canvas, Timer, Histogram, Pixel, WorkerUtil, WebGl, AlgorithmModel){
    
    //takes hex in form #ffffff and returns pixel
    function pixelFromColorPicker(hex){
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);
        return Pixel.create(r, g, b);
    }

    var histogramWorker = new Worker('/js/histogram-worker.js');
    
    var ditherWorkers = WorkerUtil.createDitherWorkers('/js/dither-worker.js');
    var ditherWorkerCurrentIndex = 0;
    
    var sourceCanvas;
    var transformCanvas;
    var transformCanvasWebGl;
    var sourceCanvasOutput;
    var transformCanvasOutput;
    var histogramCanvas;
    var histogramCanvasIndicator;
    
    var sourceWebglTexture = null;
    
    var webworkerStartTime;
    
    const COLOR_REPLACE_DEFAULT_BLACK_VALUE = '#000000';
    const COLOR_REPLACE_DEFAULT_WHITE_VALUE = '#ffffff';
    
    var app = new Vue({
        el: '#app',
        mounted: function(){
            this.currentEditorThemeIndex = 0;
            sourceCanvas = Canvas.create('source-canvas');
            transformCanvas = Canvas.create('transform-canvas');
            sourceCanvasOutput = Canvas.create('source-canvas-output');
            transformCanvasOutput = Canvas.create('transform-canvas-output');
            histogramCanvas = Canvas.create('histogram-canvas');
            histogramCanvasIndicator = Canvas.create('histogram-canvas-indicator');
            
            transformCanvasWebGl = WebGl.createCanvas('transform-canvas-webgl');
            //check for webgl support
            this.isWebglSupported = !!transformCanvasWebGl.gl;
            this.isWebglEnabled = this.isWebglSupported;
            
            ditherWorkers.forEach((ditherWorker)=>{
               ditherWorker.onmessage = this.ditherWorkerMessageReceived; 
            });
            histogramWorker.onmessage = this.histogramWorkerMessageReceived;
            this.resetColorReplace();
        },
        data: {
            threshold: 127,
            thresholdMin: 0,
            thresholdMax: 255,
            //loadedImage has properties: width, height, fileName, fileType, fileSize
            loadedImage: null,
            isLivePreviewEnabled: true,
            selectedDitherAlgorithmIndex: 0,
            isCurrentlyLoadingRandomImage: false,
            isWebglSupported: true,
            isWebglEnabled: false,
            hasImageBeenTransformedAtLeastOnce: false,
            hasColorReplaceRunLast: false,
            zoom: 100,
            zoomMin: 10,
            zoomMax: 400,
            numPanels: 2,
            editorThemes: [{name: 'Light', className: 'editor-light'}, {name: 'Gray', className: 'editor-gray'}, {name: 'Dark', className: 'editor-dark'},],
            currentEditorThemeIndex: null,
            histogramHeight: Histogram.height,
            histogramWidth: Histogram.width,
            colorReplaceBlack: '',
            colorReplaceWhite: '',
            ditherAlgorithms: AlgorithmModel.ditherAlgorithms,
        },
        computed: {
            isImageLoaded: function(){
              return this.loadedImage != null;  
            },
            selectedDitherAlgorithm: function(){
                return this.ditherAlgorithms[this.selectedDitherAlgorithmIndex];
            },
            loadedImagePixelDimensions: function(){
                return this.loadedImage.width * this.loadedImage.height;
            },
            imageTitle: function(){
                if(this.loadedImage){
                    return this.loadedImage.fileName || '';
                }
                return '';
            },
            isSelectedAlgorithmWebGl: function(){
                return !!this.selectedDitherAlgorithm.webGlFunc && this.isWebglEnabled;
            },
            colorReplaceBlackPixel: function(){
                return pixelFromColorPicker(this.colorReplaceBlack);
            },
            colorReplaceWhitePixel: function(){
                return pixelFromColorPicker(this.colorReplaceWhite);
            },
            areColorReplaceColorsChangedFromDefaults: function(){
                return this.colorReplaceBlack !== COLOR_REPLACE_DEFAULT_BLACK_VALUE || this.colorReplaceWhite !== COLOR_REPLACE_DEFAULT_WHITE_VALUE;
            },
        },
        watch: {
            currentEditorThemeIndex: function(newThemeIndex){
                document.documentElement.className = this.editorThemes[newThemeIndex].className;
            },
            isLivePreviewEnabled: function(newValue){
                if(newValue){
                    this.ditherImageWithSelectedAlgorithm();
                }
            },
            threshold: function(newThreshold, oldThreshold){
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
                }
                
                Histogram.drawIndicator(histogramCanvasIndicator, this.threshold); 
                if(this.isImageLoaded && this.isLivePreviewEnabled){
                    this.ditherImageWithSelectedAlgorithm();
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
            selectedDitherAlgorithmIndex: function(newIndex){
                if(this.isImageLoaded && this.isLivePreviewEnabled){
                    this.ditherImageWithSelectedAlgorithm();
                }
            },
            colorReplaceWhite: function(newValue){
                if(this.isImageLoaded && this.isLivePreviewEnabled){
                    if(this.isWebglEnabled && !this.isSelectedAlgorithmWebGl){
                        this.webglColorReplace(this.colorReplaceBlackPixel);
                    }
                    else{
                        this.ditherImageWithSelectedAlgorithm();   
                    }
                }
            },
            colorReplaceBlack: function(newValue, oldValue){
                if(this.isImageLoaded && this.hasImageBeenTransformedAtLeastOnce){
                    if(this.isWebglEnabled && !this.isSelectedAlgorithmWebGl){
                        this.webglColorReplace(pixelFromColorPicker(oldValue));
                    }
                    else{
                        this.ditherImageWithSelectedAlgorithm();   
                    }
                }
            },
        },
        methods: {
            webglColorReplace: function(oldBlackPixel){
                console.log('webgl color replace running');
                var texture;
                if(this.hasColorReplaceRunLast || this.isSelectedAlgorithmWebGl){
                    var sourceContext = transformCanvasWebGl.gl;
                    var pixels = new Uint8Array(this.loadedImage.width * this.loadedImage.height * 4);
                    sourceContext.readPixels(0, 0, this.loadedImage.width, this.loadedImage.height, sourceContext.RGBA, sourceContext.UNSIGNED_BYTE, pixels);
                    texture = WebGl.createAndLoadTextureFromGl(transformCanvasWebGl.gl, sourceContext, this.loadedImage.width, this.loadedImage.height);
                }
                else{
                    var sourceContext = transformCanvas.context;
                    var pixels = sourceContext.getImageData(0, 0, this.loadedImage.width, this.loadedImage.height);
                    texture = WebGl.createAndLoadTexture(transformCanvasWebGl.gl, pixels);
                }
                
                Timer.megapixelsPerSecond('Color replace webgl', this.loadedImage.width * this.loadedImage.height, ()=>{
                    WebGl.colorReplace(transformCanvasWebGl.gl, texture, this.loadedImage.width, this.loadedImage.height, this.colorReplaceBlackPixel, this.colorReplaceWhitePixel, oldBlackPixel); 
                });
                this.hasColorReplaceRunLast = true;
                this.zoomImage();
            },
            resetColorReplace: function(){
                this.colorReplaceWhite = COLOR_REPLACE_DEFAULT_WHITE_VALUE;
                this.colorReplaceBlack = COLOR_REPLACE_DEFAULT_BLACK_VALUE;
            },
            resetZoom: function(){
                this.zoom = 100;
            },
            loadImage: function(image, file){
                this.hasImageBeenTransformedAtLeastOnce = false;
                Canvas.loadImage(sourceCanvas, image);
                Canvas.loadImage(transformCanvas, image);
                
                transformCanvasWebGl.canvas.width = image.width;
                transformCanvasWebGl.canvas.height = image.height;
                
                this.loadedImage = {
                    width: image.width,
                    height: image.height,
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type,
                };
                var buffer = Canvas.createSharedImageBuffer(sourceCanvas);
                histogramWorker.postMessage(buffer);
                
                //todo probably shouldn't do this if webgl is enabled
                ditherWorkers.forEach((ditherWorker)=>{
                    //copy image to web workers
                    ditherWorker.postMessage(WorkerUtil.ditherWorkerLoadImageHeader(this.loadedImage.width, this.loadedImage.height));
                    ditherWorker.postMessage(buffer);
                });
                //todo probably shouldn't do this if webgl isn't enabled
                if(this.isWebglSupported){
                    sourceWebglTexture = WebGl.createAndLoadTexture(transformCanvasWebGl.gl, sourceCanvas.context.getImageData(0, 0, this.loadedImage.width, this.loadedImage.height));   
                }
                
                if(this.isLivePreviewEnabled){
                    this.ditherImageWithSelectedAlgorithm();   
                }
                else{
                    //if live preview is not enabled, transform canvas will be blank unless we do this
                    this.zoomImage();
                }
                //not really necessary to draw indicator unless this is the first image loaded, but this function happens so quickly
                //it's not really worth it to check
                Histogram.drawIndicator(histogramCanvasIndicator, this.threshold); 
            },
            zoomImage: function(){
                var canvasSource;
                if(this.isWebglEnabled && (this.hasColorReplaceRunLast || (this.hasImageBeenTransformedAtLeastOnce && this.isSelectedAlgorithmWebGl))){
                    canvasSource = transformCanvasWebGl;
                }
                else{
                    canvasSource = transformCanvas;   
                }
                var scaleAmount = this.zoom / 100;
                Canvas.scale(sourceCanvas, sourceCanvasOutput, scaleAmount);
                Canvas.scale(canvasSource, transformCanvasOutput, scaleAmount);
            },
            ditherImageWithSelectedAlgorithm: function(){
                if(!this.isImageLoaded){
                    return;
                }
                this.hasImageBeenTransformedAtLeastOnce = true;
                this.hasColorReplaceRunLast = false;
                if(this.isSelectedAlgorithmWebGl){
                    Timer.megapixelsPerSecond(this.selectedDitherAlgorithm.title + ' webgl', this.loadedImage.width * this.loadedImage.height, ()=>{
                        this.selectedDitherAlgorithm.webGlFunc(transformCanvasWebGl.gl, sourceWebglTexture, this.loadedImage.width, this.loadedImage.height, this.threshold, this.colorReplaceBlackPixel, this.colorReplaceWhitePixel); 
                    });
                    this.zoomImage();
                    return;
                }
                var ditherWorker = ditherWorkers[ditherWorkerCurrentIndex];
                webworkerStartTime = Timer.timeInMilliseconds();
                ditherWorker.postMessage(WorkerUtil.ditherWorkerHeader(this.loadedImage.width, this.loadedImage.height, this.threshold, this.selectedDitherAlgorithm.id, this.colorReplaceBlackPixel, this.colorReplaceWhitePixel));
                ditherWorker.postMessage(new SharedArrayBuffer(0));
                
                ditherWorkerCurrentIndex++;
                if(ditherWorkerCurrentIndex == ditherWorkers.length){
                    ditherWorkerCurrentIndex = 0;
                }
            },
            ditherWorkerMessageReceived: function(e){
                var messageData = e.data;
                Canvas.replaceImageWithBuffer(transformCanvas, this.loadedImage.width, this.loadedImage.height, messageData);
                console.log(Timer.megapixelsMessage(this.selectedDitherAlgorithm.title + ' webworker', this.loadedImage.width * this.loadedImage.height, (Timer.timeInMilliseconds() - webworkerStartTime) / 1000));
                this.zoomImage();
            },
            histogramWorkerMessageReceived: function(e){
                var messageData = e.data;
                Canvas.replaceImageWithBuffer(histogramCanvas, App.Histogram.width, App.Histogram.height, messageData);
            },
            loadImageTrigger: function(){
                fileInput.click();
            },
            //downloads image
            //based on: https://stackoverflow.com/questions/30694433/how-to-give-browser-save-image-as-option-to-button
            saveImage: function(){
                var dataURL = transformCanvas.canvas.toDataURL(this.loadedImage.fileType);
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
        }
    });
    
    
    
    var saveImageLink = document.getElementById('save-image-link');
    var fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', (e)=>{
        Fs.openImageFile(e, app.loadImage);   
    }, false);
})(window.Vue, App.Fs, App.Canvas, App.Timer, App.Histogram, App.Pixel, App.WorkerUtil, App.WebGl, App.AlgorithmModel);