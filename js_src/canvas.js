var App = App || {};

App.Canvas = (function(Polyfills){
    var devicePixelRatio = window.devicePixelRatio || 1;
    
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
    
    // function copyCanvasImage(sourceCanvasObject, targetCanvasObject){
    //     targetCanvasObject.context.drawImage(sourceCanvasObject.canvas, 0, 0);
    // }
    
    function scaleCanvasImage(sourceCanvasObject, targetCanvasObject, scaleAmount){
        var sourceWidth = sourceCanvasObject.canvas.width;
        var sourceHeight = sourceCanvasObject.canvas.height;
        var scaledWidth = Math.ceil(sourceWidth * scaleAmount);
        var scaledHeight = Math.ceil(sourceHeight * scaleAmount);
        
        targetCanvasObject.canvas.width = scaledWidth;
        targetCanvasObject.canvas.height = scaledHeight;
        
        targetCanvasObject.context.drawImage(sourceCanvasObject.canvas , 0 , 0 , sourceWidth, sourceHeight, 0, 0, scaledWidth, scaledHeight);
    }
    
    //based on: https://stackoverflow.com/questions/10100798/whats-the-most-straightforward-way-to-copy-an-arraybuffer-object
    function createSharedImageBuffer(sourceCanvasObject){
        var sourceWidth = sourceCanvasObject.canvas.width;
        var sourceHeight = sourceCanvasObject.canvas.height;
        var pixels = sourceCanvasObject.context.getImageData(0, 0, sourceWidth, sourceHeight).data;
        
        var buffer = new Polyfills.SharedArrayBuffer(pixels.length);
        //faster than for loop
        new Uint8ClampedArray(buffer).set(new Uint8ClampedArray(pixels.buffer));
        return buffer;
    }
    
    //buffer should be ArrayBuffer or SharedArrayBuffer
    function replaceImageWithBuffer(targetCanvasObject, imageWidth, imageHeight, buffer){
        var pixels = new Uint8ClampedArray(buffer);
        replaceImageWithArray(targetCanvasObject, imageWidth, imageHeight, pixels);
    }
    
    function replaceImageWithArray(targetCanvasObject, imageWidth, imageHeight, pixels){
        var imageData = targetCanvasObject.context.createImageData(imageWidth, imageHeight);
        imageData.data.set(pixels);
        targetCanvasObject.context.putImageData(imageData, 0, 0);
    }
    
    function maxScalePercentageForImage(imageWidth, imageHeight, maximumAllowedSize){
        const largestDimension = Math.max(imageWidth, imageHeight);
        const largestPercentage = Math.ceil(maximumAllowedSize * 100 / largestDimension);
        
        //make sure the maximum percentage is at least 200
        return Math.max(largestPercentage, 200);
    }
    
    function minScalePercentageForImage(imageWidth, imageHeight, minimumAllowedSize){
        const smallestDimension = Math.min(imageWidth, imageHeight);
        const smallestPercentage = Math.ceil(minimumAllowedSize * 100 / smallestDimension);
        
        //make sure at most 100 is returned
        return Math.min(smallestPercentage, 100);
    }

    
    return {
       create: createCanvasObject,
       loadImage: canvasObjectLoadImage,
       scale: scaleCanvasImage,
       createSharedImageBuffer: createSharedImageBuffer,
       replaceImageWithBuffer: replaceImageWithBuffer,
       replaceImageWithArray: replaceImageWithArray,
       maxScalePercentageForImage: maxScalePercentageForImage,
       minScalePercentageForImage: minScalePercentageForImage,
       devicePixelRatio: devicePixelRatio,
    };
})(App.Polyfills);