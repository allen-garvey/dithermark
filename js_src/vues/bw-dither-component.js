(function(Vue, Fs, Canvas, Timer, Histogram, WorkerUtil, WebGl, AlgorithmModel, Polyfills, WorkerHeaders, ColorPicker){
    
    //webworker stuff
    var ditherWorkers = WorkerUtil.createDitherWorkers('/js/dither-worker.js');
    
    //used for creating BW texture for webgl color replace
    var isDitherWorkerBwWorking = false;
    var transformedImageBwTexture = null;
    
    //used for calculating webworker performance
    var webworkerStartTime;
    
    //canvas stuff
    var histogramCanvas;
    var histogramCanvasIndicator;
    
    var sourceWebglTexture = null;
    
    var component = Vue.component('bw-dither-section', {
        //can't have elements with 2 ids in same html
        template: document.getElementById('bw-dither-component').innerHTML.replace(/\s+data-dom-id="/g, ' id="'),
        props: ['sourceCanvas', 'transformCanvas', 'transformCanvasWebGl', 'isWebglEnabled', 'isWebglSupported', 'isLivePreviewEnabled'],
        mounted: function(){
            //have to get canvases here, because DOM manipulation needs to happen in mounted hook
            histogramCanvas = Canvas.create('histogram-canvas');
            histogramCanvasIndicator = Canvas.create('histogram-canvas-indicator');
            
            ditherWorkers.forEach((ditherWorker)=>{
               ditherWorker.onmessage = this.ditherWorkerMessageReceivedDispatcher; 
            });
            this.resetColorReplace();
        },
        data: function(){ 
            return{
                threshold: 127,
                thresholdMin: 0,
                thresholdMax: 255,
                selectedDitherAlgorithmIndex: 0,
                hasImageBeenTransformed: false,
                histogramHeight: Histogram.height,
                histogramWidth: Histogram.width,
                colorReplaceBlack: '',
                colorReplaceWhite: '',
                ditherAlgorithms: AlgorithmModel.ditherAlgorithms,
                savedTextures: [],
                loadedImage: null,
            };
        },
        computed: {
            selectedDitherAlgorithm: function(){
                return this.ditherAlgorithms[this.selectedDitherAlgorithmIndex];
            },
            isSelectedAlgorithmWebGl: function(){
                return this.isWebglEnabled && !!this.selectedDitherAlgorithm.webGlFunc;
            },
            colorReplaceBlackPixel: function(){
                return ColorPicker.pixelFromHex(this.colorReplaceBlack);
            },
            colorReplaceWhitePixel: function(){
                return ColorPicker.pixelFromHex(this.colorReplaceWhite);
            },
            areColorReplaceColorsChangedFromDefaults: function(){
                return this.colorReplaceBlack !== ColorPicker.COLOR_REPLACE_DEFAULT_BLACK_VALUE || this.colorReplaceWhite !== ColorPicker.COLOR_REPLACE_DEFAULT_WHITE_VALUE;
            },
            isImageLoaded: function(){
              return this.loadedImage != null;  
            },
        },
        watch: {
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
                if(!this.hasImageBeenTransformed){
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
                    let ditherWorker = ditherWorkers.getNextWorker();
                    ditherWorker.postMessage(WorkerUtil.ditherWorkerBwHeader(this.loadedImage.width, this.loadedImage.height, this.threshold, this.selectedDitherAlgorithm.id));
                }
                //see if texture was created already, or has been created in time here
                if(!transformedImageBwTexture){
                    this.ditherImageWithSelectedAlgorithm();
                    return;
                }
                Timer.megapixelsPerSecond('Color replace webgl', this.loadedImage.width * this.loadedImage.height, ()=>{
                    WebGl.colorReplace(this.transformCanvasWebGl.gl, transformedImageBwTexture, this.loadedImage.width, this.loadedImage.height, this.colorReplaceBlackPixel, this.colorReplaceWhitePixel); 
                });
                this.transformCanvas.context.drawImage(this.transformCanvasWebGl.canvas, 0, 0);
                this.$emit('display-transformed-image');
            },
            resetColorReplace: function(){
                this.colorReplaceWhite = ColorPicker.COLOR_REPLACE_DEFAULT_WHITE_VALUE;
                this.colorReplaceBlack = ColorPicker.COLOR_REPLACE_DEFAULT_BLACK_VALUE;
            },
            imageLoaded: function(loadedImage, loadedWebglTexture){
                this.loadedImage = loadedImage;
                this.hasImageBeenTransformed = false;
                sourceWebglTexture = loadedWebglTexture;
                
                //load image into the webworkers
                var buffer = Canvas.createSharedImageBuffer(this.sourceCanvas);
                let ditherWorkerHeader = WorkerUtil.ditherWorkerLoadImageHeader(this.loadedImage.width, this.loadedImage.height);
                ditherWorkers.forEach((ditherWorker)=>{
                    //copy image to web workers
                    ditherWorker.postMessage(ditherWorkerHeader);
                    ditherWorker.postMessage(buffer);
                });
                //draw histogram
                let ditherWorker = ditherWorkers.getNextWorker();
                ditherWorker.postMessage(WorkerUtil.histogramWorkerHeader());
                
                if(this.isWebglSupported){
                    this.freeTransformedImageBwTexture();
                }
                
                if(this.isLivePreviewEnabled){
                    this.ditherImageWithSelectedAlgorithm();   
                }
                else{
                    //if live preview is not enabled, transform canvas will be blank unless we do this
                    this.$emit('display-transformed-image');
                }
                //not really necessary to draw indicator unless this is the first image loaded, but this function happens so quickly
                //it's not really worth it to check
                Histogram.drawIndicator(histogramCanvasIndicator, this.threshold); 
            },
            ditherImageWithSelectedAlgorithm: function(){
                if(!this.isImageLoaded){
                    return;
                }
                if(this.isSelectedAlgorithmWebGl){
                    this.hasImageBeenTransformed = true;
                    Timer.megapixelsPerSecond(this.selectedDitherAlgorithm.title + ' webgl', this.loadedImage.width * this.loadedImage.height, ()=>{
                        this.selectedDitherAlgorithm.webGlFunc(this.transformCanvasWebGl.gl, sourceWebglTexture, this.loadedImage.width, this.loadedImage.height, this.threshold, this.colorReplaceBlackPixel, this.colorReplaceWhitePixel); 
                    });
                    //have to copy to 2d context, since chrome will clear webgl context after switching tabs
                    //https://stackoverflow.com/questions/44769093/how-do-i-prevent-chrome-from-disposing-of-my-webgl-drawing-context-after-swit
                    this.transformCanvas.context.drawImage(this.transformCanvasWebGl.canvas, 0, 0);
                    this.$emit('display-transformed-image');
                    return;
                }
                let ditherWorker = ditherWorkers.getNextWorker();
                webworkerStartTime = Timer.timeInMilliseconds();
                ditherWorker.postMessage(WorkerUtil.ditherWorkerHeader(this.loadedImage.width, this.loadedImage.height, this.threshold, this.selectedDitherAlgorithm.id, this.colorReplaceBlackPixel, this.colorReplaceWhitePixel));
            },
            ditherWorkerMessageReceivedDispatcher: function(e){
                let messageData = e.data;
                let pixelsFull = new Uint8Array(messageData);
                //get messageTypeId from start of buffer
                let messageTypeId = pixelsFull[0];
                //rest of the buffer is the actual pixel data
                let pixels = pixelsFull.subarray(1, pixelsFull.length);
                switch(messageTypeId){
                    case WorkerHeaders.DITHER:
                        this.ditherWorkerMessageReceived(pixels);
                        break;
                    case WorkerHeaders.DITHER_BW:
                        this.ditherWorkerBwMessageReceived(pixels);
                        break;
                    //histogram
                    default:
                        this.histogramWorkerMessageReceived(pixels);
                        break;
                }
            },
            histogramWorkerMessageReceived: function(pixels){
                Canvas.replaceImageWithArray(histogramCanvas, App.Histogram.width, App.Histogram.height, pixels);
            },
            ditherWorkerMessageReceived: function(pixels){
                this.hasImageBeenTransformed = true;
                Canvas.replaceImageWithArray(this.transformCanvas, this.loadedImage.width, this.loadedImage.height, pixels);
                console.log(Timer.megapixelsMessage(this.selectedDitherAlgorithm.title + ' webworker', this.loadedImage.width * this.loadedImage.height, (Timer.timeInMilliseconds() - webworkerStartTime) / 1000));
                this.$emit('display-transformed-image');
            },
            ditherWorkerBwMessageReceived: function(pixels){
                var gl = this.transformCanvasWebGl.gl;
                this.freeTransformedImageBwTexture();
                transformedImageBwTexture = WebGl.createAndLoadTextureFromArray(gl, pixels, this.loadedImage.width, this.loadedImage.height);
            },
            freeTransformedImageBwTexture: function(){
                if(!this.isWebglSupported || !transformedImageBwTexture){
                    return;
                }
                let gl = this.transformCanvasWebGl.gl;
                gl.deleteTexture(transformedImageBwTexture);
                transformedImageBwTexture = null;
                isDitherWorkerBwWorking = false;
            },
            saveTexture: function(){
                let sourceCanvas = this.transformCanvas;
                let gl = this.transformCanvasWebGl.gl;
                let texture = WebGl.createAndLoadTexture(gl, sourceCanvas.context.getImageData(0, 0, this.loadedImage.width, this.loadedImage.height));
                this.savedTextures.push(texture);
            },
            combineDitherTextures: function(){
                let textures = this.savedTextures.splice(0,3);
                let gl = this.transformCanvasWebGl.gl;
                WebGl.textureCombine(gl, this.loadedImage.width, this.loadedImage.height, this.colorReplaceBlackPixel, this.colorReplaceWhitePixel, textures);
                this.transformCanvas.context.drawImage(this.transformCanvasWebGl.canvas, 0, 0);
                this.$emit('display-transformed-image');
            },
        }
    });
    
})(window.Vue, App.Fs, App.Canvas, App.Timer, App.Histogram, App.WorkerUtil, App.WebGl, App.AlgorithmModel, App.Polyfills, App.WorkerHeaders, App.ColorPicker);