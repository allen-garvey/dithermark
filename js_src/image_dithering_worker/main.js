(function(Timer, WorkerUtil, Algorithms, WorkerHeaders, Histogram, OptimizePalette, ColorQuantizationModes){
    let ditherAlgorithms = Algorithms.model();
    let previousMessageWasLoadImageHeader = false;
    let pixelBufferOriginal;
    let imageHeight = 0;
    let imageWidth = 0;
    
    
    function histogramAction(messageHeader){
        let messageTypeId = messageHeader.messageTypeId;
        //don't need to copy the original imagedata, since we are not modifying it
        let pixels = new Uint8ClampedArray(pixelBufferOriginal);
        let histogramBuffer;
        
        if(messageTypeId === WorkerHeaders.HUE_HISTOGRAM){
            histogramBuffer = WorkerUtil.createHistogramBuffer(360, messageTypeId);
            Histogram.createHueHistogram(pixels, histogramBuffer.array);
        }
        else{
            histogramBuffer = WorkerUtil.createHistogramBuffer(256, messageTypeId);
            Histogram.createBwHistogram(pixels, histogramBuffer.array);   
        }
        postMessage(histogramBuffer.buffer);
    }
    
    function ditherAction(messageHeader){
        //dither the image
        const selectedAlgorithm = ditherAlgorithms[messageHeader.algorithmId];
        
        let pixelBufferCopy = WorkerUtil.copyBufferWithMessageType(pixelBufferOriginal, messageHeader.messageTypeId);
        let pixels = pixelBufferCopy.pixels;
        
        const imageHeight = messageHeader.imageHeight;
        const imageWidth = messageHeader.imageWidth;
        const threshold = messageHeader.threshold;
        
        Timer.megapixelsPerSecond(`${selectedAlgorithm.title} processed in webworker`, imageHeight * imageWidth, ()=>{
          selectedAlgorithm.algorithm(pixels, imageWidth, imageHeight, threshold, messageHeader.blackPixel, messageHeader.whitePixel); 
        });
        
        postMessage(pixelBufferCopy.buffer);
    }

    function colorDitherAction(messageHeader){
        const selectedAlgorithm = ditherAlgorithms[messageHeader.algorithmId];

        let pixelBufferCopy = WorkerUtil.copyBufferWithMessageType(pixelBufferOriginal, messageHeader.messageTypeId);
        let pixels = pixelBufferCopy.pixels;

        const imageHeight = messageHeader.imageHeight;
        const imageWidth = messageHeader.imageWidth;
        const colorDitherModeId = messageHeader.colorDitherModeId;
        const colors = messageHeader.colors;

        Timer.megapixelsPerSecond(`${selectedAlgorithm.title} processed in webworker`, imageHeight * imageWidth, ()=>{
            selectedAlgorithm.algorithm(pixels, imageWidth, imageHeight, colorDitherModeId, colors); 
          });

        postMessage(pixelBufferCopy.buffer);
    }
    
    function createOptimizePaletteProgressCallback(colorQuantizationModeId, numColors){
        return (percentage)=>{
            postMessage(WorkerUtil.createOptimizePaletteProgressBuffer(colorQuantizationModeId, numColors, percentage));
        };
    }

    function optimizePaletteAction(messageHeader){
        //don't need to copy the original imagedata, since we are not modifying it
        let pixels = new Uint8ClampedArray(pixelBufferOriginal);
        let pixelsInput = pixels;
        let paletteBuffer;
        const colorQuantizationId = messageHeader.colorQuantizationModeId;
        const colorQuantization = ColorQuantizationModes[colorQuantizationId];
        const messageTypeId = messageHeader.messageTypeId;
        const numColors = messageHeader.numColors;
        const progressCallback = createOptimizePaletteProgressCallback(colorQuantizationId, numColors);

        Timer.megapixelsPerSecond(`Optimize palette ${colorQuantization.title}`, pixels.length / 4, ()=>{
            let algoName = colorQuantization.algo;
            paletteBuffer = OptimizePalette[algoName](pixelsInput, numColors, colorQuantization, imageWidth, imageHeight, progressCallback); 
        });
        
        postMessage(WorkerUtil.createOptimizePaletteBuffer(paletteBuffer, messageTypeId, colorQuantizationId));
    }
    
    
    onmessage = function(e){
        let messageData = e.data;
        
        //previous message was load image header, so load image
        if(previousMessageWasLoadImageHeader){
            if(messageData.byteLength > 0){
                pixelBufferOriginal = messageData;
            }
            previousMessageWasLoadImageHeader = false;
            return;
        }
        //get new headers
        let messageHeader = WorkerUtil.parseMessageHeader(messageData);
        //perform action based on headers
        switch(messageHeader.messageTypeId){
            case WorkerHeaders.DITHER:
            case WorkerHeaders.DITHER_BW:
                ditherAction(messageHeader);
                break;
            case WorkerHeaders.DITHER_COLOR:
                colorDitherAction(messageHeader);
                break;
            case WorkerHeaders.HISTOGRAM:
            case WorkerHeaders.HUE_HISTOGRAM:
                histogramAction(messageHeader);
                break;
            case WorkerHeaders.OPTIMIZE_PALETTE:
                optimizePaletteAction(messageHeader);
                break;
            //LOAD_IMAGE case
            //just sets flag since it means next message will be the actual image data
            default:
                imageHeight = messageHeader.imageHeight;
                imageWidth = messageHeader.imageWidth;
                previousMessageWasLoadImageHeader = true;
                break;
        }
        
    };
})(App.Timer, App.WorkerUtil, App.Algorithms, App.WorkerHeaders, App.Histogram, App.OptimizePalette, App.ColorQuantizationModes);

