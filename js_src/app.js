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
            isWebglSupported: false,
            isWebglEnabled: false,
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
                return !!this.selectedDitherAlgorithm.webGlFunc;
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
            isDitherPluginEnabled: function(newValue){
                if(newValue && this.isLivePreviewEnabled){
                    this.ditherImageWithSelectedAlgorithm();
                }
                else{
                    this.displaySourceImage();
                }
            },
            threshold: function(newThreshold){
                newThreshold = Math.floor(newThreshold);
                if(isNaN(newThreshold)){
                    return;
                }
                if(newThreshold < this.thresholdMin){
                    newThreshold = this.thresholdMin;
                }
                else if(newThreshold > this.thresholdMax){
                    newThreshold = this.thresholdMax;
                }
                if(this.threshold === newThreshold){
                    return;
                }
                this.threshold = newThreshold;
                
                Histogram.drawIndicator(histogramCanvasIndicator, this.threshold); 
                if(this.isImageLoaded && this.isLivePreviewEnabled){
                    this.ditherImageWithSelectedAlgorithm();
                }
            },
            zoom: function(newZoom){
                newZoom = Math.floor(newZoom);
                if(isNaN(newZoom)){
                    return;
                }
                if(newZoom < this.zoomMin){
                    newZoom = this.zoomMin;
                }
                else if(newZoom > this.zoomMax){
                    newZoom = this.zoomMax;
                }
                this.zoom = newZoom;
                this.zoomImage();
            },
            selectedDitherAlgorithmIndex: function(newIndex){
                if(this.isImageLoaded && this.isLivePreviewEnabled){
                    this.ditherImageWithSelectedAlgorithm();
                }
            },
            colorReplaceWhite: function(newValue){
                if(this.isImageLoaded && this.isLivePreviewEnabled){
                    this.ditherImageWithSelectedAlgorithm();
                }
            },
            colorReplaceBlack: function(newValue){
                if(this.isImageLoaded && this.isLivePreviewEnabled){
                    this.ditherImageWithSelectedAlgorithm();
                }
            },
        },
        methods: {
            resetColorReplace: function(){
                this.colorReplaceWhite = COLOR_REPLACE_DEFAULT_WHITE_VALUE;
                this.colorReplaceBlack = COLOR_REPLACE_DEFAULT_BLACK_VALUE;
            },
            resetZoom: function(){
                this.zoom = 100;
            },
            loadImage: function(image, file){
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
                
                ditherWorkers.forEach((ditherWorker)=>{
                    //copy image to web workers
                    ditherWorker.postMessage(WorkerUtil.ditherWorkerLoadImageHeader(this.loadedImage.width, this.loadedImage.height));
                    ditherWorker.postMessage(buffer);
                });
                
                if(this.isLivePreviewEnabled){
                    this.ditherImageWithSelectedAlgorithm();   
                }
                else{
                    //if live preview is not enabled, transform canvas will be blank
                    //unless we do this
                    this.zoomImage(true);
                }
                //not really necessary to draw indicator unless this is the first image loaded, but this function happens so quickly
                //it's not really worth it to check
                Histogram.drawIndicator(histogramCanvasIndicator, this.threshold); 
            },
            zoomImage: function(isInitial){
                var scaleAmount = this.zoom / 100;
                Canvas.scale(sourceCanvas, sourceCanvasOutput, scaleAmount);
                var transformCanvasSource;
                if(!isInitial && this.isWebglEnabled && this.isSelectedAlgorithmWebGl){
                    transformCanvasSource = transformCanvasWebGl;
                }
                else{
                    transformCanvasSource = transformCanvas;
                }
                Canvas.scale(transformCanvasSource, transformCanvasOutput, scaleAmount);
            },
            ditherImageWithSelectedAlgorithm: function(){
                if(!this.isImageLoaded){
                    return;
                }
                if(this.isWebglEnabled && this.isSelectedAlgorithmWebGl){
                    Timer.megapixelsPerSecond(this.selectedDitherAlgorithm.title + ' webgl', this.loadedImage.width * this.loadedImage.height, ()=>{
                        this.selectedDitherAlgorithm.webGlFunc(transformCanvasWebGl.gl, sourceCanvas.context.getImageData(0, 0, this.loadedImage.width, this.loadedImage.height), this.threshold, this.colorReplaceBlackPixel, this.colorReplaceWhitePixel); 
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