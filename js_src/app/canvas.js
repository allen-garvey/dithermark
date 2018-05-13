App.Canvas = (function(Polyfills){
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    //make sure to call context.beginPath() after clearing if using paths or rect()
    //or canvas will not clear
    //https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clearRect
    function clearCanvas(canvasObject){
        canvasObject.context.clearRect(0, 0, canvasObject.canvas.width, canvasObject.canvas.height);
    }
    
    function canvasObjectLoadImage(canvasObject, image){
        canvasObject.canvas.width = image.width;
        canvasObject.canvas.height = image.height;
        canvasObject.context.drawImage(image, 0, 0);
    }

    function canvasObjectLoadImageScaled(canvasObject, image, scale){
        const scaledWidth = Math.round(image.width * scale);
        const scaledHeight = Math.round(image.height * scale);
        canvasObject.canvas.width = scaledWidth;
        canvasObject.canvas.height = scaledHeight;
        canvasObject.context.drawImage(image, 0, 0, scaledWidth, scaledHeight);
    }
    
    //alpha optimization based on: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
    function createCanvasObject(canvas){
        canvas = canvas || document.createElement('canvas');
        return {
            canvas,
            context: canvas.getContext('2d'),
        };
    }
    
    function createWebglCanvas(canvas){
        canvas = canvas || document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        let maxTextureSize = 0;
        if(gl){
            maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        }
        return {
            canvas: canvas,
            gl: gl,
            maxTextureSize: maxTextureSize,
        };
    }
    
    // function copyCanvasImage(sourceCanvasObject, targetCanvasObject){
    //     let sourceCanvas = sourceCanvasObject.canvas;
    //     let targetCanvas = targetCanvasObject.canvas;
        
    //     targetCanvas.width = sourceCanvas.width;
    //     targetCanvas.height = sourceCanvas.height;
    //     //has to be done each time we scale the image, or it will be smoothed
    //     targetCanvasObject.context.webkitImageSmoothingEnabled = false;
    //     targetCanvasObject.context.imageSmoothingEnabled = false;
        
    //     targetCanvasObject.context.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height);
    // }
    
    function scaleCanvasImage(sourceCanvasObject, targetCanvasObject, scaleAmount){
        const sourceWidth = sourceCanvasObject.canvas.width;
        const sourceHeight = sourceCanvasObject.canvas.height;
        
        let scaledWidth = sourceWidth;
        let scaledHeight = sourceHeight;
        if(scaleAmount !== 1){
            scaledWidth = Math.ceil(scaledWidth * scaleAmount);
            scaledHeight = Math.ceil(scaledHeight * scaleAmount);
        }
        
        targetCanvasObject.canvas.width = scaledWidth;
        targetCanvasObject.canvas.height = scaledHeight;
        
        //has to be done each time we scale the image, or it will be smoothed
        targetCanvasObject.context.webkitImageSmoothingEnabled = false;
        targetCanvasObject.context.imageSmoothingEnabled = false;
        
        targetCanvasObject.context.drawImage(sourceCanvasObject.canvas, 0, 0, sourceWidth, sourceHeight, 0, 0, scaledWidth, scaledHeight);
    }
    
    //based on: https://stackoverflow.com/questions/10100798/whats-the-most-straightforward-way-to-copy-an-arraybuffer-object
    function createSharedImageBuffer(sourceCanvasObject){
        const sourceWidth = sourceCanvasObject.canvas.width;
        const sourceHeight = sourceCanvasObject.canvas.height;
        const pixels = sourceCanvasObject.context.getImageData(0, 0, sourceWidth, sourceHeight).data;
        
        const buffer = new Polyfills.SharedArrayBuffer(pixels.length);
        //faster than for loop
        new Uint8ClampedArray(buffer).set(new Uint8ClampedArray(pixels.buffer));
        return buffer;
    }
    
    //buffer should be ArrayBuffer or SharedArrayBuffer
    function replaceImageWithBuffer(targetCanvasObject, imageWidth, imageHeight, buffer){
        const pixels = new Uint8ClampedArray(buffer);
        replaceImageWithArray(targetCanvasObject, imageWidth, imageHeight, pixels);
    }
    
    function replaceImageWithArray(targetCanvasObject, imageWidth, imageHeight, pixels){
        const imageData = targetCanvasObject.context.createImageData(imageWidth, imageHeight);
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
        clear: clearCanvas,
        //   copy: copyCanvasImage,
        createWebgl: createWebglCanvas,
        loadImage: canvasObjectLoadImage,
        loadImageScaled: canvasObjectLoadImageScaled,
        scale: scaleCanvasImage,
        createSharedImageBuffer,
        replaceImageWithBuffer,
        replaceImageWithArray,
        maxScalePercentageForImage,
        minScalePercentageForImage,
        devicePixelRatio,
    };
})(App.Polyfills);