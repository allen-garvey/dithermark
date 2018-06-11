//values used in global settings- Image tab
App.ImageFiltersModel = (function(){
    //imageDimensions = height * width
    //percentage is 0-100
    //returns percentage 0-100
    function calculatePixelationZoom(imageDimensions, percentage){
        if(percentage >= 100){
            return 100;
        }
        //based on 720 x 960 image, since large images won't be pixelized enough
        const baseDimensions = Math.min(691200, imageDimensions) * percentage;
        return Math.ceil(baseDimensions / imageDimensions);
    }

    function pixelationValues(imageDimensions){
        return [100, 70, 60, 50, 45, 40, 37, 35, 32, 30, 27, 25, 22, 20, 17, 15, 12, 10, 7, 5, 4, 3].map((zoomPercentage)=>{
            return calculatePixelationZoom(imageDimensions, zoomPercentage);
        });
    }


    /**
     * canvas css filters
     * values are percentage
     * contrast highest supported value for WebGL (used for Edge and Safari) is 300%
     */
    const canvasFilterValues = [0, 5, 10, 15, 20, 30, 40, 50, 60, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 150, 160, 180, 200];


    return{
        //pixel values for smoothing filter
        smoothingValues: [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16],
        //-1 means filter disabled
        //higher values are sharper, while lower values are blurrier, so it makes more sense to reverse them
        bilateralFilterValues:  [-1, 60, 50, 40, 35, 30, 25, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 7, 5, 4, 3, 0],
        canvasFilterValues,
        canvasFilterValuesDefaultIndex: canvasFilterValues.indexOf(100),
        pixelationValues,
    };

})();