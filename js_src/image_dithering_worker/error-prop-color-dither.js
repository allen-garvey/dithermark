App.ErrorPropColorDither = (function(Image, Pixel, PixelMath, ColorDitherModeFunctions, ErrorPropModel){
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
    function propagateError(propagationModel, errorPropMatrix, x, y, currentError, errorBuffer){
        propagationModel.forEach((item)=>{
            errorMatrixIncrement(errorPropMatrix, x + item.xOffset, y + item.yOffset,  fillPropagateErrorBuffer(currentError, item.errorFraction, errorBuffer));
        });
    }


    /**
     * Base error prop functions
    */
    function errorPropDitherBase(pixels, imageWidth, imageHeight, colorDitherModeId, colors, propagateErrorModel){
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
            
            propagateError(propagateErrorModel, errorMatrix, x, y, currentError, errorBuffer);

            pixel[0] = closestColor[0];
            pixel[1] = closestColor[1];
            pixel[2] = closestColor[2];
            return pixel;
        });
        console.log(errorMatrix);
    }

    function errorPropBuilder(propagateErrorModel){
        return (pixels, imageWidth, imageHeight, colorDitherModeId, colors)=>{
            return errorPropDitherBase(pixels, imageWidth, imageHeight, colorDitherModeId, colors, propagateErrorModel);
        };
    }
    
    return{
        garvey: errorPropBuilder(ErrorPropModel.garvey()),
        floydSteinberg: errorPropBuilder(ErrorPropModel.floydSteinberg()),
    };
    
    
})(App.Image, App.Pixel, App.PixelMath, App.ColorDitherModeFunctions, App.ErrorPropModel);