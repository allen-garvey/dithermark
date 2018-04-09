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
    
    function errorMatrixIncrement(matrix, x, y, error, errorFraction){
        if(x >= matrix.width || y >= matrix.height){
            return;
        }
        let matrixValues = errorMatrixValue(matrix, x, y);
        for(let i=0;i<matrixValues.length;i++){
            matrixValues[i] = matrixValues[i] + (error[i] * errorFraction);
        }
    }
    
    function errorMatrixValue(matrix, x, y){
        const startIndex = (matrix.trueWidth * y) + x * matrix.dimensions;
        return matrix.data.subarray(startIndex, startIndex + matrix.dimensions);
    }

   /**
     * Propagate error functions
    */
    function propagateError(propagationModel, errorPropMatrix, x, y, currentError){
        propagationModel.forEach((item)=>{
            errorMatrixIncrement(errorPropMatrix, x + item.xOffset, y + item.yOffset, currentError, item.errorFraction);
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

        Image.transform(pixels, imageWidth, imageHeight, (pixel, x, y)=>{
            const pixelRawValue = pixelValueFunc(pixel);
            let errorValue = errorMatrixValue(errorMatrix, x, y);
            const pixelAdjustedValue = incrementValueFunc(pixelRawValue, errorValue);
            const closestColors = Image.findClosestColors(pixelAdjustedValue, colorValues, pixelDistanceFunc);

            const currentError = errorAmountFunc(pixelAdjustedValue, colorValues[closestColors.closestIndex], currentErrorBuffer);
            
            propagateError(propagateErrorModel, errorMatrix, x, y, currentError);

            const closestColor = colors[closestColors.closestIndex];
            pixel[0] = closestColor[0];
            pixel[1] = closestColor[1];
            pixel[2] = closestColor[2];
            return pixel;
        });
    }

    function errorPropBuilder(propagateErrorModel){
        return (pixels, imageWidth, imageHeight, colorDitherModeId, colors)=>{
            return errorPropDitherBase(pixels, imageWidth, imageHeight, colorDitherModeId, colors, propagateErrorModel);
        };
    }
    
    return{
        floydSteinberg: errorPropBuilder(ErrorPropModel.floydSteinberg()),
        javisJudiceNinke: errorPropBuilder(ErrorPropModel.javisJudiceNinke()),
        stucki: errorPropBuilder(ErrorPropModel.stucki()),
        burkes: errorPropBuilder(ErrorPropModel.burkes()),
        sierra3: errorPropBuilder(ErrorPropModel.sierra3()),
        sierra2: errorPropBuilder(ErrorPropModel.sierra2()),
        sierra1: errorPropBuilder(ErrorPropModel.sierra1()),
        atkinson: errorPropBuilder(ErrorPropModel.atkinson()),
        garvey: errorPropBuilder(ErrorPropModel.garvey()),
        
    };
    
    
})(App.Image, App.Pixel, App.PixelMath, App.ColorDitherModeFunctions, App.ErrorPropModel);