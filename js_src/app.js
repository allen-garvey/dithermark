(function(){
    function thresholdImage(sourceContext, targetContext, imageWidth, imageHeight, threshold){
        transformImage(sourceContext, targetContext, imageWidth, imageHeight, (pixel, x, y)=>{
            var lightness = pixelLightness(pixel);
            
            if(lightness > threshold){
                return createPixel(255, 255, 255, 255);
            }
            return createPixel(0, 0, 0, 255);
            
        });
    }
    
    
    function transformImage(sourceContext, targetContext, imageWidth, imageHeight, pixelTransformFunc){
        var pixels = sourceContext.getImageData(0, 0, imageWidth, imageHeight).data;
        
        var outputImageData = targetContext.createImageData(imageWidth, imageHeight);
        var outputData = outputImageData.data;
        
        var y = -1;
        for(var i=0;i<pixels.length;i+=4){
            var pixel = createPixel(pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]);
            
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
    
    function createPixel(r, g, b, a){
        return {
            r: r,
            g: g,
            b: b,
            a: a
        };
    }
    
    function pixelLightness(pixel){
        var max = Math.max(pixel.r, pixel.g, pixel.b);
        var min = Math.min(pixel.r, pixel.g, pixel.b);
        return Math.floor((max + min) / 2.0);
    }
    
    // function pixelToFillStyle(pixel){
    //     return `rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, ${pixel.a})`;
    // }
    
    // function drawPixel(context, fillStyle, x, y){
    //     context.fillStyle = fillStyle;
    //     context.fillRect(x, y, 1, 1);
    // }
    
    
    
    function openFiles(e) {
        var files = e.target.files;
        if(files.length < 1){
            return;
        }
        var file = files[0];
        if(!file.type.startsWith('image/')){
            return;
        }
        
        var image = new window.Image();
        image.onload = ()=> {
            canvasObjectLoadImage(sourceCanvas, image);
            canvasObjectLoadImage(outputCanvas, image);
            
            timeFunction('threshold', ()=>{
               thresholdImage(sourceCanvas.context, outputCanvas.context, image.width, image.height, 128); 
            });
            
        };
        image.src = window.URL.createObjectURL(file);
    }
    
    function timeInMilliseconds(){
        var d = new Date();
        return d.getTime();
    }
    
    function timeFunction(name, functionToTime){
        var start = timeInMilliseconds();
        functionToTime();
        var end = timeInMilliseconds();
        var seconds = (end - start) / 1000;
        console.log(name + 'took ' + seconds);
    }
    
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
    
    var sourceCanvas = createCanvasObject('source-canvas');
    var outputCanvas = createCanvasObject('output-canvas');
    
    
    var inputElement = document.getElementById('file-input');
    inputElement.addEventListener('change', openFiles, false);
})();