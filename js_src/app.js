(function(Vue, Fs, Canvas, Threshold, Timer, ErrorPropDither){
    
    var sourceCanvas = Canvas.create('source-canvas');
    var outputCanvas = Canvas.create('output-canvas');
    
    
    
    var app = new Vue({
        el: '#controls',
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
        },
        watch: {
            isLivePreviewEnabled: function(newValue){
                if(newValue){
                    this.ditherImageWithSelectedAlgorithm();
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
})(window.Vue, App.Fs, App.Canvas, App.Threshold, App.Timer, App.ErrorPropDither);