(function(Vue, Fs, Canvas, Threshold, Timer, ErrorPropDither, OrderedDither){
    
    var sourceCanvas;
    var outputCanvas;
    
    
    
    var app = new Vue({
        el: '#app',
        mounted: function(){
            sourceCanvas = Canvas.create('source-canvas');
            outputCanvas = Canvas.create('output-canvas');
        },
        data: {
            threshold: 127,
            thresholdMin: 0,
            thresholdMax: 255,
            //loadedImage has properties: width, height, fileName, fileType, fileSize
            loadedImage: null,
            isLivePreviewEnabled: true,
            imageHeight: 0,
            imageWidth: 0,
            selectedDitherAlgorithmIndex: 0,
            isCurrentlyLoadingRandomImage: false,
            numPanels: 2,
            ditherAlgorithms: [
                {
                    title: "Threshold", 
                    algorithm: Threshold.image,
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
            selectedDitherAlgorithmIndex: function(newIndex){
                if(this.isImageLoaded && this.isLivePreviewEnabled){
                    this.ditherImageWithSelectedAlgorithm();
                }
            }
        },
        methods: {
            loadImage: function(image, file){
                Canvas.loadImage(sourceCanvas, image);
                Canvas.loadImage(outputCanvas, image);
                
                this.loadedImage = {
                    width: image.width,
                    height: image.height,
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type,
                };
                
                this.ditherImageWithSelectedAlgorithm();
                
            },
            ditherImageWithSelectedAlgorithm: function(){
                if(!this.isImageLoaded){
                    return;
                }
                Timer.megapixelsPerSecond(this.selectedDitherAlgorithm.title, this.loadedImagePixelDimensions, ()=>{
                    this.selectedDitherAlgorithm.algorithm(sourceCanvas.context, outputCanvas.context, this.loadedImage.width, this.loadedImage.height, this.threshold);
                });
            },
            loadImageTrigger: function(){
                fileInput.click();
            },
            //downloads image
            //based on: https://stackoverflow.com/questions/30694433/how-to-give-browser-save-image-as-option-to-button
            saveImage: function(){
                var dataURL = outputCanvas.canvas.toDataURL(this.loadedImage.fileType);
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
})(window.Vue, App.Fs, App.Canvas, App.Threshold, App.Timer, App.ErrorPropDither, App.OrderedDither);