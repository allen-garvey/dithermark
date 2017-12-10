(function(Vue, Fs, Canvas, Threshold, Timer, ErrorPropDither){
    
    var sourceCanvas = Canvas.create('source-canvas');
    var outputCanvas = Canvas.create('output-canvas');
    
    
    
    var app = new Vue({
        el: '#controls',
        data: {
            threshold: 127,
            thresholdMin: 0,
            thresholdMax: 255,
            isImageLoaded: false,
            imageHeight: 0,
            imageWidth: 0,
            selectedDitherAlgorithmIndex: 0,
            ditherAlgorithms: [
                {
                    title: "Threshold", 
                    algorithm: Threshold.image
                },
                {
                    title: "Atkinson", 
                    algorithm: ErrorPropDither.atkinson
                },
                {
                    title: "Floyd-Steinberg", 
                    algorithm: ErrorPropDither.floydSteinberg
                },
            ]
        },
        watch: {
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
                if(!this.isImageLoaded){
                    return;
                }
                this.ditherImageWithSelectedAlgorithm();
            },
            selectedDitherAlgorithmIndex: function(newIndex){
                this.ditherImageWithSelectedAlgorithm();
            }
        },
        methods: {
            ditherImageWithSelectedAlgorithm: function(){
                if(!this.isImageLoaded){
                    return;
                }
                Timer.timeFunction(app.ditherAlgorithms[app.selectedDitherAlgorithmIndex].title, ()=>{
                    this.ditherAlgorithms[this.selectedDitherAlgorithmIndex].algorithm(sourceCanvas.context, outputCanvas.context, this.imageWidth, this.imageHeight, this.threshold);
                });
            },
        }
    });
    
    
    
    
    var inputElement = document.getElementById('file-input');
    inputElement.addEventListener('change', (e)=>{
        Fs.openFile(e, (image)=>{
            Canvas.loadImage(sourceCanvas, image);
            Canvas.loadImage(outputCanvas, image);
            
            app.imageHeight = image.height;
            app.imageWidth = image.width;
            app.isImageLoaded = true;
            
            app.ditherImageWithSelectedAlgorithm();
        });   
    }, false);
})(window.Vue, App.Fs, App.Canvas, App.Threshold, App.Timer, App.ErrorPropDither);