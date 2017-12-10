(function(Vue, Fs, Canvas, Threshold, Timer){
    
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
            imageWidth: 0
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
                this.thresholdImage();
            }
        },
        methods: {
            thresholdImage: function(){
                Threshold.image(sourceCanvas.context, outputCanvas.context, this.imageWidth, this.imageHeight, this.threshold);
            }
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
            
            Timer.timeFunction('threshold', ()=>{
               app.thresholdImage();
            });
        });   
    }, false);
})(window.Vue, App.Fs, App.Canvas, App.Threshold, App.Timer);