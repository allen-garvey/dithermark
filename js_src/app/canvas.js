App.Canvas = (function(Polyfills){
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    function areCanvasFiltersSupported(canvasObject){
        return 'filter' in canvasObject.context;
    }

    function isToBlobSupported(canvas){
        return 'toBlob' in canvas;
    }

    //globalCompositeOperation from: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
    //otherwise known as blend mode
    //test for support from: https://stackoverflow.com/questions/26123588/test-if-browser-supports-multiply-for-globalcompositeoperation-canvas-property
    function isBlendModeSupported(canvasObject, globalCompositeOperation){
        canvasObject.context.globalCompositeOperation = globalCompositeOperation;
        return canvasObject.context.globalCompositeOperation === globalCompositeOperation;
    }
    
    //alpha optimization based on: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
    function createCanvas(canvas=null){
        canvas = canvas || document.createElement('canvas');
        return {
            canvas,
            context: canvas.getContext('2d'),
        };
    }
    
    function createWebglCanvas(canvas){
        canvas = canvas || document.createElement('canvas');
        //premultipliedAlpha is from https://webglfundamentals.org/webgl/lessons/webgl-and-alpha.html
        //used to fix semi-transparent pixels being weird colors
        const gl = canvas.getContext('webgl', {premultipliedAlpha: false}) || canvas.getContext('experimental-webgl', {premultipliedAlpha: false});
        let maxTextureSize = 0;
        let supportsHighIntPrecision = false;
        let supportsHighFloatPrecision = false;
        if(gl){
            maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
            //high int precision required for arithmetic dithers
            const shaderIntPrecision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT);
            supportsHighIntPrecision = shaderIntPrecision && shaderIntPrecision.rangeMax >= 30;

            //high float precision required for smoothing
            const shaderFloatPrecision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
            supportsHighFloatPrecision = shaderFloatPrecision && shaderFloatPrecision.precision >= 16;
        }
        return {
            canvas,
            gl,
            maxTextureSize,
            supportsHighIntPrecision,
            supportsHighFloatPrecision,
        };
    }

    //make sure to call context.beginPath() after clearing if using paths or rect()
    //or canvas will not clear
    //https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clearRect
    function clearCanvas(canvasObject){
        canvasObject.context.clearRect(0, 0, canvasObject.canvas.width, canvasObject.canvas.height);
    }
    
    //copies an image from source canvas to target canvas
    //scale is percentage to resize image - 1 is 100 percent (unchanged)
    //filters are css canvas filters string
    //https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter
    //make sure canvas filters are supported before using them
    function copyCanvas(sourceCanvasObject, targetCanvasObject, scale=1, filters=''){
        const sourceWidth = sourceCanvasObject.canvas.width;
        const sourceHeight = sourceCanvasObject.canvas.height;
        
        let scaledWidth = sourceWidth;
        let scaledHeight = sourceHeight;
        if(scale !== 1){
            scaledWidth = Math.ceil(scaledWidth * scale);
            scaledHeight = Math.ceil(scaledHeight * scale);
        }
        
        targetCanvasObject.canvas.width = scaledWidth;
        targetCanvasObject.canvas.height = scaledHeight;
        
        //has to be done each time we scale the image, or it will be smoothed
        targetCanvasObject.context.webkitImageSmoothingEnabled = false;
        targetCanvasObject.context.imageSmoothingEnabled = false;

        if(filters){
            targetCanvasObject.context.filter = filters;
        }
        
        targetCanvasObject.context.drawImage(sourceCanvasObject.canvas, 0, 0, sourceWidth, sourceHeight, 0, 0, scaledWidth, scaledHeight);
    }

    //canvasLayer1 is merged on top of canvasLayer0
    //canvases should be the same width and height, since we can't change them,
    //since it would might clear them
    //globalCompositeOperation from: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
    //otherwise known as blend mode
    function mergeCanvases(canvasLayer1, canvasLayer0, globalCompositeOperation=null){
        const context = canvasLayer0.context;
        if(globalCompositeOperation){
            context.globalCompositeOperation = globalCompositeOperation;
            context.drawImage(canvasLayer1.canvas, 0, 0);
            //reset to default
            resetBlendMode(canvasLayer0);
        }
        else{
            context.drawImage(canvasLayer1.canvas, 0, 0);
        }
    }

    //returns canvas blend mode to default value
    function resetBlendMode(canvasObject){
        canvasObject.context.globalCompositeOperation = 'source-over';
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
    
    //pixels should be UInt8ClampedArray
    function loadPixels(targetCanvasObject, imageWidth, imageHeight, pixels){
        const imageData = targetCanvasObject.context.createImageData(imageWidth, imageHeight);
        imageData.data.set(pixels);
        targetCanvasObject.context.putImageData(imageData, 0, 0);
    }

    //scale is percentage to resize image - 1 is 100 percent (unchanged)
    function loadImage(canvasObject, image, scale=1){
        let scaledWidth = image.width;
        let scaledHeight = image.height;
        if(scale !== 1){
            scaledWidth =  Math.round(scaledWidth * scale);
            scaledHeight = Math.round(scaledHeight * scale);
        }
        canvasObject.canvas.width = scaledWidth;
        canvasObject.canvas.height = scaledHeight;
        canvasObject.context.drawImage(image, 0, 0, scaledWidth, scaledHeight);
    }
    
    //maximum allowed size is largest size in pixels image is allowed to be
    function maxScalePercentageForImage(imageWidth, imageHeight, maximumAllowedSize){
        const largestDimension = Math.max(imageWidth, imageHeight);
        const largestPercentage = Math.ceil(maximumAllowedSize * 100 / largestDimension);
        
        //make sure the maximum percentage is at least 200
        return Math.max(largestPercentage, 200);
    }
    
    //minimum allowed size is smallest size in pixels image is allowed to be
    function minScalePercentageForImage(imageWidth, imageHeight, minimumAllowedSize){
        const smallestDimension = Math.min(imageWidth, imageHeight);
        const smallestPercentage = Math.ceil(minimumAllowedSize * 100 / smallestDimension);
        
        //make sure at most 100 is returned
        return Math.min(smallestPercentage, 100);
    }

    
    return {
        create: createCanvas,
        clear: clearCanvas,
        createWebgl: createWebglCanvas,
        copy: copyCanvas,
        merge: mergeCanvases,
        isBlendModeSupported,
        resetBlendMode,
        createSharedImageBuffer,
        loadImage,
        loadPixels,
        maxScalePercentageForImage,
        minScalePercentageForImage,
        devicePixelRatio,
        areCanvasFiltersSupported,
        isToBlobSupported,
    };
})(App.Polyfills);