(function(Util, Canvas, Pixel, Threshold){
    
    var sourceCanvas = Canvas.create('source-canvas');
    var outputCanvas = Canvas.create('output-canvas');
    
    var inputElement = document.getElementById('file-input');
    inputElement.addEventListener('change', (e)=>{
        Util.openFile(e, (image)=>{
            Canvas.loadImage(sourceCanvas, image);
            Canvas.loadImage(outputCanvas, image);
            
            Util.timeFunction('threshold', ()=>{
               Threshold.image(sourceCanvas.context, outputCanvas.context, image.width, image.height, 128); 
            });
        });   
    }, false);
})(App.Util, App.Canvas, App.Pixel, App.Threshold);