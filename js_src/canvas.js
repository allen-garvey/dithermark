var App = App || {};

App.Canvas = (function(){
    function canvasObjectLoadImage(canvasObject, image){
        canvasObject.canvas.width = image.width;
        canvasObject.canvas.height = image.height;
        canvasObject.context.drawImage(image, 0, 0);
    }
    
    function createCanvasObject(id){
        var canvas = document.getElementById(id);
        var context = canvas.getContext('2d');
        return {
            canvas: canvas,
            context: context,
        };
    }
    
    function copyCanvasImage(sourceCanvasObject, targetCanvasObject){
        targetCanvasObject.context.drawImage(sourceCanvasObject.canvas, 0, 0);
    }
    
    function scaleCanvasImage(sourceCanvasObject, targetCanvasObject, scaleAmount){
        var sourceWidth = sourceCanvasObject.canvas.width;
        var sourceHeight = sourceCanvasObject.canvas.height;
        var scaledWidth = Math.ceil(sourceWidth * scaleAmount);
        var scaledHeight = Math.ceil(sourceHeight * scaleAmount);
        
        targetCanvasObject.canvas.width = scaledWidth;
        targetCanvasObject.canvas.height = scaledHeight;
        
        targetCanvasObject.context.drawImage(sourceCanvasObject.canvas , 0 , 0 , sourceWidth, sourceHeight, 0, 0, scaledWidth, scaledHeight);
        
    }

    
    return {
       create: createCanvasObject,
       loadImage: canvasObjectLoadImage,
       scale: scaleCanvasImage,
    };
})();