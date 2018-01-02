(function(Vue, Fs, Canvas, Timer, Histogram, Pixel, WorkerUtil, WebGl, AlgorithmModel){
    
    //takes hex in form #ffffff and returns pixel
    function pixelFromColorPicker(hex){
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);
        return Pixel.create(r, g, b);
    }
    const TRANSFORMED_IMAGE_CANVAS_WEBWORKER = 1;
    const TRANSFORMED_IMAGE_CANVAS_WEBGL = 2;

    var histogramWorker = new Worker('/js/histogram-worker.js');
    
    var ditherWorkers = WorkerUtil.createDitherWorkers('/js/dither-worker.js');
    var ditherWorkerCurrentIndex = 0;
    
    var ditherWorkerBw = new Worker('/js/dither-worker.js');
    var isDitherWorkerBwWorking = false;
    var transformedImageBwTexture = null;
    
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
            ditherWorkerBw.onmessage = this.ditherWorkerBwMessageReceived;
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
            transformedImageCanvasType: null, //used to store the type of canvas which contains the source of the transformed image for saving and zooming
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
            savedTextures: [],
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
            //returns the canvas that should be currently used for image transform drawing based on current settings
            activeTransformCanvas: function(){
                if(this.isWebglEnabled && this.isSelectedAlgorithmWebGl){
                    return transformCanvasWebGl;
                }
                return transformCanvas;
            },
            //returns the canvas that is the output of the most recent image transform
            transformedImageCanvasSource: function(){
                if(this.transformedImageCanvasType === TRANSFORMED_IMAGE_CANVAS_WEBGL){
                    return transformCanvasWebGl;
                }
                return transformCanvas;
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
                //reset bw texture
                this.freeTransformedImageBwTexture();
                
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
                //reset bw texture
                this.freeTransformedImageBwTexture();
                
                if(this.isImageLoaded && this.isLivePreviewEnabled){
                    this.ditherImageWithSelectedAlgorithm();
                }
            },
            colorReplaceWhite: function(newValue){
                this.colorReplaceColorsChanged();
            },
            colorReplaceBlack: function(newValue, oldValue){
                this.colorReplaceColorsChanged();
            },
        },
        methods: {
            colorReplaceColorsChanged: function(){
                if(this.transformedImageCanvasType === null){
                    return;
                }
                if(!this.isWebglEnabled || this.isSelectedAlgorithmWebGl){
                    this.ditherImageWithSelectedAlgorithm();
                    return;
                }
                
                //if we're here we know that webgl is enabled, and that the selected algorithm is NOT webgl
                //so send message to create BW texture if necessary
                if(!transformedImageBwTexture && !isDitherWorkerBwWorking){
                    isDitherWorkerBwWorking = true;
                    ditherWorkerBw.postMessage(WorkerUtil.ditherWorkerHeader(this.loadedImage.width, this.loadedImage.height, this.threshold, this.selectedDitherAlgorithm.id, Pixel.create(0,0,0), Pixel.create(255,255,255)));
                    ditherWorkerBw.postMessage(new SharedArrayBuffer(0));
                }
                //see if texture was created already, or has been created in time here
                if(!transformedImageBwTexture){
                    this.ditherImageWithSelectedAlgorithm();
                    return;
                }
                this.transformedImageCanvasType = TRANSFORMED_IMAGE_CANVAS_WEBGL;
                Timer.megapixelsPerSecond('Color replace webgl', this.loadedImage.width * this.loadedImage.height, ()=>{
                    WebGl.colorReplace(transformCanvasWebGl.gl, transformedImageBwTexture, this.loadedImage.width, this.loadedImage.height, this.colorReplaceBlackPixel, this.colorReplaceWhitePixel); 
                });
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
                this.transformedImageCanvasType = null;
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
                let ditherWorkerHeader = WorkerUtil.ditherWorkerLoadImageHeader(this.loadedImage.width, this.loadedImage.height);
                ditherWorkers.concat([ditherWorkerBw]).forEach((ditherWorker)=>{
                    //copy image to web workers
                    ditherWorker.postMessage(ditherWorkerHeader);
                    ditherWorker.postMessage(buffer);
                });
                //todo probably shouldn't do this if webgl isn't enabled
                if(this.isWebglSupported){
                    transformCanvasWebGl.gl.deleteTexture(sourceWebglTexture);
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
                let trasformCanvasSource = this.transformedImageCanvasSource;
                var scaleAmount = this.zoom / 100;
                Canvas.scale(sourceCanvas, sourceCanvasOutput, scaleAmount);
                Canvas.scale(trasformCanvasSource, transformCanvasOutput, scaleAmount);
            },
            ditherImageWithSelectedAlgorithm: function(){
                if(!this.isImageLoaded){
                    return;
                }
                if(this.isSelectedAlgorithmWebGl){
                    this.transformedImageCanvasType = TRANSFORMED_IMAGE_CANVAS_WEBGL;
                    Timer.megapixelsPerSecond(this.selectedDitherAlgorithm.title + ' webgl', this.loadedImage.width * this.loadedImage.height, ()=>{
                        this.selectedDitherAlgorithm.webGlFunc(transformCanvasWebGl.gl, sourceWebglTexture, this.loadedImage.width, this.loadedImage.height, this.threshold, this.colorReplaceBlackPixel, this.colorReplaceWhitePixel); 
                    });
                    this.zoomImage();
                    return;
                }
                this.transformedImageCanvasType = TRANSFORMED_IMAGE_CANVAS_WEBWORKER;
                let ditherWorker = ditherWorkers[ditherWorkerCurrentIndex];
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
            ditherWorkerBwMessageReceived: function(e){
                var messageData = e.data;
                var gl = transformCanvasWebGl.gl;
                this.freeTransformedImageBwTexture();
                transformedImageBwTexture = WebGl.createAndLoadTextureFromBuffer(gl, messageData, this.loadedImage.width, this.loadedImage.height);
            },
            freeTransformedImageBwTexture: function(){
                var gl = transformCanvasWebGl.gl;
                gl.deleteTexture(transformedImageBwTexture);
                transformedImageBwTexture = null;
                isDitherWorkerBwWorking = false;
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
                let outputCanvas = this.transformedImageCanvasSource.canvas;
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
            saveTexture: function(){
                let sourceCanvas = this.transformedImageCanvasSource;
                let gl = transformCanvasWebGl.gl;
                let texture;
                if(this.transformedImageCanvasType === TRANSFORMED_IMAGE_CANVAS_WEBGL){
                    texture = WebGl.createAndLoadTextureFromGl(gl, sourceCanvas.gl, this.loadedImage.width, this.loadedImage.height);
                }
                else{
                    console.log('webworker texture');
                    texture = WebGl.createAndLoadTexture(gl, sourceCanvas.context.getImageData(0, 0, this.loadedImage.width, this.loadedImage.height));
                }
                this.savedTextures.push(texture);
            },
            combineDitherTextures: function(){
                let textures = this.savedTextures.splice(0,3);
                let gl = transformCanvasWebGl.gl;
                this.transformedImageCanvasType = TRANSFORMED_IMAGE_CANVAS_WEBGL;
                WebGl.textureCombine(gl, this.loadedImage.width, this.loadedImage.height, this.colorReplaceBlackPixel, this.colorReplaceWhitePixel, textures);
                this.zoomImage();
            },
        }
    });
    
    
    
    var saveImageLink = document.getElementById('save-image-link');
    var fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', (e)=>{
        Fs.openImageFile(e, app.loadImage);   
    }, false);
})(window.Vue, App.Fs, App.Canvas, App.Timer, App.Histogram, App.Pixel, App.WorkerUtil, App.WebGl, App.AlgorithmModel);