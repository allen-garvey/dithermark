App.ErrorPropColorDither = (function(Image, Pixel, PixelMath, ColorDitherModeFunctions){
    /*
    ** Error propagation matrix stuff
    */
    function createErrorMaxtrix(width, height, dimensions){
        return {
            width: width,
            trueWidth: width * dimensions,
            height: height,
            dimensions: dimensions,
            data: new Float32Array(width * height * dimensions),
        };
    }

    function errorMatrixIndexFor(matrix, x, y){
        return (matrix.trueWidth * y) + x * matrix.dimensions;
    }
    
    function errorMatrixIncrement(matrix, x, y, values){
        if(x >= matrix.width || y >= matrix.height){
            return;
        }
        let matrixValues = errorMatrixValue(matrix, x, y);
        for(let i=0;i<matrixValues.length;i++){
            matrixValues[i] = matrixValues[i] + values[i];
        }
    }
    
    function errorMatrixValue(matrix, x, y){
        if(x >= matrix.width || y >= matrix.height){
            //return 0 values
            return new Float32Array(matrix.dimensions);
        }
        const startIndex = errorMatrixIndexFor(matrix, x, y);
        return matrix.data.subarray(startIndex, startIndex + matrix.dimensions);
    }

    /**
    * Propagate error helper stuff
    */
   function fillPropagateErrorBuffer(error, errorFraction, errorBuffer){
       error.forEach((value, i)=>{
           errorBuffer[i] = value * errorFraction;
       });
       return errorBuffer;
   }

   /**
     * Propagate error functions
    */

    function floydSteinbergPropagation(errorPropMatrix, x, y, currentError, errorBuffer){
        const errorPart = 1 / 16;
        const error7 = errorPart * 7;
        const error5 = errorPart * 5;
        const error3 = errorPart * 3;
        const error1 = errorPart;

        errorMatrixIncrement(errorPropMatrix, x + 1, y, fillPropagateErrorBuffer(currentError, error7, errorBuffer));
        errorMatrixIncrement(errorPropMatrix, x + 1, y + 1, fillPropagateErrorBuffer(currentError, error1, errorBuffer));
        errorMatrixIncrement(errorPropMatrix, x, y + 1, fillPropagateErrorBuffer(currentError, error5, errorBuffer));
        errorMatrixIncrement(errorPropMatrix, x - 1, y + 1, fillPropagateErrorBuffer(currentError, error3, errorBuffer));
    }

    function garveyPropagation(errorPropMatrix, x, y, currentError, errorBuffer){
        const errorPart = 1 / 16;
        
        errorMatrixIncrement(errorPropMatrix, x + 1, y,  fillPropagateErrorBuffer(currentError, errorPart * 2, errorBuffer));
        errorMatrixIncrement(errorPropMatrix, x + 2, y, fillPropagateErrorBuffer(currentError, errorPart, errorBuffer));

        errorMatrixIncrement(errorPropMatrix, x - 1, y + 1, fillPropagateErrorBuffer(currentError, errorPart, errorBuffer));
        errorMatrixIncrement(errorPropMatrix, x, y + 1, fillPropagateErrorBuffer(currentError, errorPart * 2, errorBuffer));
        errorMatrixIncrement(errorPropMatrix, x + 1, y + 1, fillPropagateErrorBuffer(currentError, errorPart, errorBuffer));

        errorMatrixIncrement(errorPropMatrix, x, y + 2, fillPropagateErrorBuffer(currentError, errorPart, errorBuffer));


        //this unfortunately doesn't seem to make it faster
        // let errorBuff1 = fillPropagateErrorBuffer(currentError, errorPart, errorBuffer);
        
        // errorMatrixIncrement(errorPropMatrix, x + 2, y, errorBuff1);
        // errorMatrixIncrement(errorPropMatrix, x - 1, y + 1, errorBuff1);
        // errorMatrixIncrement(errorPropMatrix, x + 1, y + 1, errorBuff1);
        // errorMatrixIncrement(errorPropMatrix, x, y + 2, errorBuff1);

        // let errorBuff2 = fillPropagateErrorBuffer(currentError, errorPart * 2, errorBuffer);
        // errorMatrixIncrement(errorPropMatrix, x + 1, y,  errorBuff2);
        // errorMatrixIncrement(errorPropMatrix, x, y + 1, errorBuff2);
    }


    /**
     * Base error prop functions
    */
    function errorPropDitherBase(pixels, imageWidth, imageHeight, colorDitherModeId, colors, propagateErrorFunc){
        const colorDitherMode = ColorDitherModeFunctions[colorDitherModeId];
        const pixelValueFunc = colorDitherMode.pixelValue;
        const pixelDistanceFunc = colorDitherMode.distance;
        const modeDimensions = colorDitherMode.dimensions;
        const incrementValueFunc = colorDitherMode.incrementValue;
        const errorAmountFunc = colorDitherMode.errorAmount;

        const colorValues = colors.map(pixelValueFunc);
        let errorMatrix = createErrorMaxtrix(imageWidth, imageHeight, modeDimensions);
        //this is to avoid uncessesary creation and deletion of arrays during error propagation
        let currentErrorBuffer = new Float32Array(modeDimensions);
        let errorBuffer = new Float32Array(modeDimensions);

        Image.transform(pixels, imageWidth, imageHeight, (pixel, x, y)=>{
            const pixelRawValue = pixelValueFunc(pixel);
            let errorValue = errorMatrixValue(errorMatrix, x, y);
            const pixelAdjustedValue = incrementValueFunc(pixelRawValue, errorValue);
            const closestColors = Image.findClosestColors(pixelAdjustedValue, colorValues, pixelDistanceFunc);
            const closestColor = colors[closestColors.closestIndex];

            const currentError = errorAmountFunc(pixelAdjustedValue, colorValues[closestColors.closestIndex], currentErrorBuffer);
            
            propagateErrorFunc(errorMatrix, x, y, currentError, errorBuffer);

            pixel[0] = closestColor[0];
            pixel[1] = closestColor[1];
            pixel[2] = closestColor[2];
            return pixel;
        });
        console.log(errorMatrix);
    }

    function errorPropBuilder(propagateErrorFunc){
        return (pixels, imageWidth, imageHeight, colorDitherModeId, colors)=>{
            return errorPropDitherBase(pixels, imageWidth, imageHeight, colorDitherModeId, colors, propagateErrorFunc);
        };
    }
    
    return{
        garvey: errorPropBuilder(garveyPropagation),
        floydSteinberg: errorPropBuilder(floydSteinbergPropagation),
    };
    
    
})(App.Image, App.Pixel, App.PixelMath, App.ColorDitherModeFunctions);