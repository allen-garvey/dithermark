(function(Vue, Canvas, Timer, Histogram, WorkerUtil, WebGl, AlgorithmModel, Polyfills, WorkerHeaders, ColorPicker, WebGlBwDither, VueMixins){
    
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
        template: document.getElementById('bw-dither-component'),
        props: ['sourceCanvas', 'transformCanvas', 'transformCanvasWebGl', 'isWebglEnabled', 'isWebglSupported', 'isLivePreviewEnabled'],
        mounted: function(){
            //have to get canvases here, because DOM manipulation needs to happen in mounted hook
            histogramCanvas = Canvas.create(this.$refs.histogramCanvas);
            histogramCanvasIndicator = Canvas.create(this.$refs.histogramCanvasIndicator, true);
            
            this.resetColorReplace();
        },
        data: function(){ 
            return{
                threshold: 127,
                thresholdMin: 0,
                thresholdMax: 255,
                selectedDitherAlgorithmIndex: 0,
                hasImageBeenTransformed: false,
                colorReplaceColors: [],
                ditherGroups: AlgorithmModel.bwDitherGroups,
                ditherAlgorithms: AlgorithmModel.bwDitherAlgorithms,
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
                return ColorPicker.pixelFromHex(this.colorReplaceColors[0]);
            },
            colorReplaceWhitePixel: function(){
                return ColorPicker.pixelFromHex(this.colorReplaceColors[1]);
            },
            areColorReplaceColorsChangedFromDefaults: function(){
                return this.colorReplaceColors[0] !== ColorPicker.COLOR_REPLACE_DEFAULT_BLACK_VALUE || this.colorReplaceColors[1] !== ColorPicker.COLOR_REPLACE_DEFAULT_WHITE_VALUE;
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
                    return;
                }
                
                Histogram.drawIndicator(histogramCanvasIndicator, this.threshold); 
                if(this.isLivePreviewEnabled){
                    this.ditherImageWithSelectedAlgorithm();
                }
            },
            selectedDitherAlgorithmIndex: function(newIndex){
                //reset bw texture
                this.freeTransformedImageBwTexture();
                
                if(this.isLivePreviewEnabled){
                    this.ditherImageWithSelectedAlgorithm();
                }
            },
            colorReplaceColors: function(newValue){
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
                    this.$emit('request-worker', (worker)=>{
                        worker.postMessage(WorkerUtil.ditherWorkerBwHeader(this.loadedImage.width, this.loadedImage.height, this.threshold, this.selectedDitherAlgorithm.id));
                    });
                    
                }
                //see if texture was created already, or has been created in time here
                if(!transformedImageBwTexture){
                    this.ditherImageWithSelectedAlgorithm();
                    return;
                }
                Timer.megapixelsPerSecond('Color replace webgl', this.loadedImage.width * this.loadedImage.height, ()=>{
                    WebGlBwDither.colorReplace(this.transformCanvasWebGl.gl, transformedImageBwTexture, this.loadedImage.width, this.loadedImage.height, this.colorReplaceBlackPixel, this.colorReplaceWhitePixel); 
                });
                this.transformCanvas.context.drawImage(this.transformCanvasWebGl.canvas, 0, 0);
                this.$emit('display-transformed-image');
            },
            resetColorReplace: function(){
                this.colorReplaceColors = [ColorPicker.COLOR_REPLACE_DEFAULT_BLACK_VALUE, ColorPicker.COLOR_REPLACE_DEFAULT_WHITE_VALUE];
            },
            imageLoaded: function(loadedImage, loadedWebglTexture){
                this.loadedImage = loadedImage;
                this.hasImageBeenTransformed = false;
                sourceWebglTexture = loadedWebglTexture;
                
                //draw histogram
                this.$emit('request-worker', (worker)=>{
                    worker.postMessage(WorkerUtil.histogramWorkerHeader());
                });
                
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
                this.$emit('request-worker', (worker)=>{
                    webworkerStartTime = Timer.timeInMilliseconds();
                    worker.postMessage(WorkerUtil.ditherWorkerHeader(this.loadedImage.width, this.loadedImage.height, this.threshold, this.selectedDitherAlgorithm.id, this.colorReplaceBlackPixel, this.colorReplaceWhitePixel));
                });
            },
            ditherWorkerMessageReceivedDispatcher: function(messageTypeId, pixels){
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
            histogramWorkerMessageReceived: function(heightPercentages){
                Histogram.drawBwHistogram(histogramCanvas, heightPercentages);
            },
            ditherWorkerMessageReceived: function(pixels){
                this.hasImageBeenTransformed = true;
                Canvas.replaceImageWithArray(this.transformCanvas, this.loadedImage.width, this.loadedImage.height, pixels);
                console.log(Timer.megapixelsMessage(`${this.selectedDitherAlgorithm.title} total time            `, this.loadedImage.width * this.loadedImage.height, (Timer.timeInMilliseconds() - webworkerStartTime) / 1000));
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
                WebGlBwDither.textureCombine(gl, this.loadedImage.width, this.loadedImage.height, this.colorReplaceBlackPixel, this.colorReplaceWhitePixel, textures);
                this.transformCanvas.context.drawImage(this.transformCanvasWebGl.canvas, 0, 0);
                this.$emit('display-transformed-image');
            },
            cyclePropertyList: VueMixins.cyclePropertyList,
        }
    });
    
})(window.Vue, App.Canvas, App.Timer, App.Histogram, App.WorkerUtil, App.WebGl, App.AlgorithmModel, App.Polyfills, App.WorkerHeaders, App.ColorPicker, App.WebGlBwDither, App.VueMixins);