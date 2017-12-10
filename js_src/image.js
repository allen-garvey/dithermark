var App = App || {};

App.Image = (function(Pixel){
    function transformImage(sourceContext, targetContext, imageWidth, imageHeight, pixelTransformFunc){
        var pixels = sourceContext.getImageData(0, 0, imageWidth, imageHeight).data;
        
        var outputImageData = targetContext.createImageData(imageWidth, imageHeight);
        var outputData = outputImageData.data;
        
        var y = -1;
        for(var i=0;i<pixels.length;i+=4){
            var pixel = Pixel.create(pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]);
            
            var pixelNum = i / 4;
            var x = pixelNum % imageWidth;
            if(x === 0){
                y++;
            }
           
            var outputPixel = pixelTransformFunc(pixel, x, y);
            
            outputData[i] = outputPixel.r;
            outputData[i+1] = outputPixel.g;
            outputData[i+2] = outputPixel.b;
            outputData[i+3] = outputPixel.a;
        }
        targetContext.putImageData(outputImageData, 0, 0);
    }
    
    // function drawPixel(context, fillStyle, x, y){
    //     context.fillStyle = fillStyle;
    //     context.fillRect(x, y, 1, 1);
    // }

    
    return {
       transform: transformImage
    };
})(App.Pixel);