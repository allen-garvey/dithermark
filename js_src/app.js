(function(Vue, Fs, Canvas, Timer, Histogram, Pixel, WorkerUtil, WebGl){

    var ditherWorker = new Worker('/js/dither-worker.js');
    
    var sourceCanvas;
    var transformCanvas;
    var transformCanvasWebGl;
    var sourceCanvasOutput;
    var transformCanvasOutput;
    var histogramCanvas;
    var histogramCanvasIndicator;
    
    var app = new Vue({
        el: '#app',
        mounted: function(){
            this.currentEditorThemeIndex = 0;
            sourceCanvas = Canvas.create('source-canvas');
            transformCanvas = Canvas.create('transform-canvas');
            sourceCanvasOutput = Canvas.create('source-canvas-output');
            transformCanvasOutput = Canvas.create('transform-canvas-output');
            transformCanvasWebGl = WebGl.createCanvas('transform-canvas-webgl');
            histogramCanvas = Canvas.create('histogram-canvas');
            histogramCanvasIndicator = Canvas.create('histogram-canvas-indicator');
            ditherWorker.onmessage = this.ditherWorkerMessageReceived;
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
            zoom: 100,
            zoomMin: 10,
            zoomMax: 400,
            numPanels: 2,
            editorThemes: [{name: 'Light', className: 'editor-light'}, {name: 'Gray', className: 'editor-gray'}, {name: 'Dark', className: 'editor-dark'},],
            currentEditorThemeIndex: null,
            histogramHeight: Histogram.height,
            histogramWidth: Histogram.width,
            ditherAlgorithms: [
                {
                    title: "Threshold WebGL", 
                    id: 15,
                    webGlFunc: WebGl.threshold,
                },
                {
                    title: "Ordered Dither 2x2 WebGL", 
                    id: 17,
                    webGlFunc: WebGl.orderedDither2,
                },
                {
                    title: "Threshold", 
                    id: 1,
                },
                {
                    title: "Random WebGL", 
                    id: 16,
                    webGlFunc: WebGl.randomThreshold,
                },
                {
                    title: "Random", 
                    id: 2,
                },
                {
                    title: "Atkinson", 
                    id: 3,
                },
                {
                    title: "Floyd-Steinberg", 
                    id: 4,
                },
                {
            		title: "Javis-Judice-Ninke",
            		id: 5,
            	},
            	{
            		title: "Stucki",
            		id: 6,
            	},
            	{
            		title: "Burkes",
            		id: 7,
            	},
            	{
            		title: "Sierra3",
            		id: 8,
            	},
            	{
            		title: "Sierra2",
            		id: 9,
            	},
            	{
            		title: "Sierra1",
            		id: 10,
            	},
            	{
            	    title: "Ordered Dither 2x2",
            	    id: 11,
            	},
            	{
            	    title: "Ordered Dither 4x4",
            	    id: 12,
            	},
            	{
            	    title: "Ordered Dither 8x8",
            	    id: 13,
            	},
            	{
            	    title: "Ordered Dither 16x16",
            	    id: 14,
            	},
            ],
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
            }
        },
        methods: {
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
                //copy image to web worker
                ditherWorker.postMessage(WorkerUtil.ditherWorkerLoadImageHeader(this.loadedImage.width, this.loadedImage.height));
                var buffer = Canvas.createSharedImageBuffer(sourceCanvas);
                ditherWorker.postMessage(buffer);
                
                if(this.isLivePreviewEnabled){
                    this.ditherImageWithSelectedAlgorithm();   
                }
                else{
                    //todo display image in transform canvas, because as of now it will be empty
                    this.zoomImage();
                }
                Histogram.drawHistorgram(sourceCanvas.context, histogramCanvas, this.loadedImage.width, this.loadedImage.height);
                //not really necessary to draw indicator unless this is the first image loaded, but this function happens so quickly
                //it's not worth it to check
                Histogram.drawIndicator(histogramCanvasIndicator, this.threshold); 
            },
            zoomImage: function(){
                var scaleAmount = this.zoom / 100;
                Canvas.scale(sourceCanvas, sourceCanvasOutput, scaleAmount);
                var transformCanvasSource;
                if(this.isSelectedAlgorithmWebGl){
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
                if(this.isSelectedAlgorithmWebGl){
                    Timer.megapixelsPerSecond('webgl threshold', this.loadedImage.width * this.loadedImage.height, ()=>{
                        this.selectedDitherAlgorithm.webGlFunc(transformCanvasWebGl.gl, sourceCanvas.context.getImageData(0, 0, this.loadedImage.width, this.loadedImage.height), this.threshold); 
                    });
                    this.zoomImage();
                    return;
                }
                console.log('Started worker dithering:  ' + Timer.timeInMilliseconds());
                ditherWorker.postMessage(WorkerUtil.ditherWorkerHeader(this.loadedImage.width, this.loadedImage.height, this.threshold, this.selectedDitherAlgorithm.id));
                ditherWorker.postMessage(new SharedArrayBuffer(0));
            },
            ditherWorkerMessageReceived: function(e){
                var messageData = e.data;
                var pixels = new Uint8ClampedArray(messageData);
                var imageData = transformCanvas.context.createImageData(this.loadedImage.width, this.loadedImage.height);
                imageData.data.set(pixels);
                transformCanvas.context.putImageData(imageData, 0, 0);
                console.log('Finished worker dithering: ' + Timer.timeInMilliseconds());
                this.zoomImage();
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
})(window.Vue, App.Fs, App.Canvas, App.Timer, App.Histogram, App.Pixel, App.WorkerUtil, App.WebGl);