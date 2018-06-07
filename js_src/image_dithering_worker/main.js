(function(Timer, WorkerUtil, Algorithms, WorkerHeaders, Histogram, OptimizePalette, ColorQuantizationModes){
    const ditherAlgorithms = Algorithms.model();
    let previousMessageWasLoadImageHeader = false;
    let imageId;
    let pixelBufferOriginal;
    let imageHeight = 0;
    let imageWidth = 0;
    
    
    function histogramAction(imageId, messageHeader){
        const messageTypeId = messageHeader.messageTypeId;
        //don't need to copy the original imagedata, since we are not modifying it
        const pixels = new Uint8ClampedArray(pixelBufferOriginal);
        let histogramBuffer;
        
        if(messageTypeId === WorkerHeaders.HUE_HISTOGRAM){
            histogramBuffer = WorkerUtil.createHistogramBuffer(360, messageTypeId, imageId);
            Histogram.createHueHistogram(pixels, histogramBuffer.array);
        }
        else{
            histogramBuffer = WorkerUtil.createHistogramBuffer(256, messageTypeId, imageId);
            Histogram.createBwHistogram(pixels, histogramBuffer.array);   
        }
        postMessage(histogramBuffer.buffer);
    }
    
    function bwDitherAction(imageId, messageHeader){
        //dither the image
        const selectedAlgorithm = ditherAlgorithms[messageHeader.algorithmId];
        
        const pixelBufferCopy = WorkerUtil.copyBufferWithMessageType(pixelBufferOriginal, messageHeader.messageTypeId, imageId);
        const pixels = pixelBufferCopy.pixels;
        
        const imageHeight = messageHeader.imageHeight;
        const imageWidth = messageHeader.imageWidth;
        const threshold = messageHeader.threshold;
        
        Timer.megapixelsPerSecond(`${selectedAlgorithm.title} processed in webworker`, imageHeight * imageWidth, ()=>{
          selectedAlgorithm.algorithm(pixels, imageWidth, imageHeight, threshold, messageHeader.blackPixel, messageHeader.whitePixel); 
        });
        
        postMessage(pixelBufferCopy.buffer);
    }

    function colorDitherAction(imageId, messageHeader){
        const selectedAlgorithm = ditherAlgorithms[messageHeader.algorithmId];

        const pixelBufferCopy = WorkerUtil.copyBufferWithMessageType(pixelBufferOriginal, messageHeader.messageTypeId, imageId);
        const pixels = pixelBufferCopy.pixels;

        const imageHeight = messageHeader.imageHeight;
        const imageWidth = messageHeader.imageWidth;
        const colorDitherModeId = messageHeader.colorDitherModeId;
        const colors = messageHeader.colors;

        Timer.megapixelsPerSecond(`${selectedAlgorithm.title} processed in webworker`, imageHeight * imageWidth, ()=>{
            selectedAlgorithm.algorithm(pixels, imageWidth, imageHeight, colorDitherModeId, colors); 
          });

        postMessage(pixelBufferCopy.buffer);
    }
    
    function createOptimizePaletteProgressCallback(imageId, colorQuantizationModeId, numColors, messageHeader){
        return (percentage)=>{
            postMessage(WorkerUtil.createOptimizePaletteProgressBuffer(imageId, colorQuantizationModeId, numColors, percentage));
        };
    }

    function optimizePaletteAction(imageId, messageHeader){
        //don't need to copy the original imagedata, since we are not modifying it
        const pixels = new Uint8ClampedArray(pixelBufferOriginal);
        const colorQuantizationId = messageHeader.colorQuantizationModeId;
        const colorQuantization = ColorQuantizationModes[colorQuantizationId];
        const messageTypeId = messageHeader.messageTypeId;
        const numColors = messageHeader.numColors;
        const progressCallback = createOptimizePaletteProgressCallback(imageId, colorQuantizationId, numColors, messageHeader);
        const algoName = colorQuantization.algo;
        let paletteBuffer;

        Timer.megapixelsPerSecond(`Optimize palette ${colorQuantization.title}`, pixels.length / 4, ()=>{
            paletteBuffer = OptimizePalette[algoName](pixels, numColors, colorQuantization, imageWidth, imageHeight, progressCallback); 
        });
        
        postMessage(WorkerUtil.createOptimizePaletteBuffer(imageId, paletteBuffer, messageTypeId, colorQuantizationId));
    }
    
    
    onmessage = function(e){
        const messageData = e.data;
        
        //previous message was load image header, so load image
        if(previousMessageWasLoadImageHeader){
            if(messageData.byteLength > 0){
                pixelBufferOriginal = messageData;
            }
            previousMessageWasLoadImageHeader = false;
            return;
        }
        //get new headers
        const messageHeader = WorkerUtil.parseMessageHeader(messageData);
        //perform action based on headers
        switch(messageHeader.messageTypeId){
            case WorkerHeaders.DITHER:
            case WorkerHeaders.DITHER_BW:
                bwDitherAction(imageId, messageHeader);
                break;
            case WorkerHeaders.DITHER_COLOR:
                colorDitherAction(imageId, messageHeader);
                break;
            case WorkerHeaders.HISTOGRAM:
            case WorkerHeaders.HUE_HISTOGRAM:
                histogramAction(imageId, messageHeader);
                break;
            case WorkerHeaders.OPTIMIZE_PALETTE:
                optimizePaletteAction(imageId, messageHeader);
                break;
            //LOAD_IMAGE case
            //just sets flag since it means next message will be the actual image data
            default:
                imageHeight = messageHeader.imageHeight;
                imageWidth = messageHeader.imageWidth;
                imageId = messageHeader.imageId;
                previousMessageWasLoadImageHeader = true;
                break;
        }
        
    };
})(App.Timer, App.WorkerUtil, App.Algorithms, App.WorkerHeaders, App.Histogram, App.OptimizePalette, App.ColorQuantizationModes);

