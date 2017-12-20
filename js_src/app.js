(function(Vue, Fs, Canvas, Threshold, Timer, ErrorPropDither, OrderedDither, Histogram){
    
    var sourceCanvas;
    var transformCanvas;
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
            histogramCanvas = Canvas.create('histogram-canvas');
            histogramCanvasIndicator = Canvas.create('histogram-canvas-indicator');
            Histogram.initHistorgram(histogramCanvas);
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
            ditherAlgorithms: [
                {
                    title: "Threshold", 
                    algorithm: Threshold.image,
                },
                {
                    title: "Random", 
                    algorithm: Threshold.randomDither,
                },
                {
                    title: "Atkinson", 
                    algorithm: ErrorPropDither.atkinson,
                },
                {
                    title: "Floyd-Steinberg", 
                    algorithm: ErrorPropDither.floydSteinberg,
                },
                {
            		title: "Javis-Judice-Ninke",
            		algorithm: ErrorPropDither.javisJudiceNinke,
            	},
            	{
            		title: "Stucki",
            		algorithm: ErrorPropDither.stucki,
            	},
            	{
            		title: "Burkes",
            		algorithm: ErrorPropDither.burkes,
            	},
            	{
            		title: "Sierra3",
            		algorithm: ErrorPropDither.sierra3,
            	},
            	{
            		title: "Sierra2",
            		algorithm: ErrorPropDither.sierra2,
            	},
            	{
            		title: "Sierra1",
            		algorithm: ErrorPropDither.sierra1,
            	},
            	{
            	    title: "Ordered Dither 2x2",
            	    algorithm: OrderedDither.dither2,
            	},
            	{
            	    title: "Ordered Dither 4x4",
            	    algorithm: OrderedDither.dither4,
            	},
            	{
            	    title: "Ordered Dither 8x8",
            	    algorithm: OrderedDither.dither8,
            	},
            	{
            	    title: "Ordered Dither 16x16",
            	    algorithm: OrderedDither.dither16,
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
                
                this.loadedImage = {
                    width: image.width,
                    height: image.height,
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type,
                };
                Histogram.drawHistorgram(sourceCanvas.context, histogramCanvas, this.loadedImage.width, this.loadedImage.height);
                this.ditherImageWithSelectedAlgorithm();   
            },
            zoomImage: function(){
                var scaleAmount = this.zoom / 100;
                Canvas.scale(sourceCanvas, sourceCanvasOutput, scaleAmount);
                Canvas.scale(transformCanvas, transformCanvasOutput, scaleAmount);
            },
            ditherImageWithSelectedAlgorithm: function(){
                if(!this.isImageLoaded){
                    return;
                }
                Timer.megapixelsPerSecond(this.selectedDitherAlgorithm.title, this.loadedImagePixelDimensions, ()=>{
                    this.selectedDitherAlgorithm.algorithm(sourceCanvas.context, transformCanvas.context, this.loadedImage.width, this.loadedImage.height, this.threshold);
                });
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
                var randomImageUrl = 'https://source.unsplash.com/random/400x300';
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
})(window.Vue, App.Fs, App.Canvas, App.Threshold, App.Timer, App.ErrorPropDither, App.OrderedDither, App.Histogram);