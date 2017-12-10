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

    
    return {
       create: createCanvasObject,
       loadImage: canvasObjectLoadImage,
    };
})();