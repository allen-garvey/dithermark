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
    /**
     * canvas css filters
     * values are percentage
     */
    const imageFilterValues = [0, 5, 10, 15, 20, 30, 40, 50, 60, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 150, 160, 180, 200];


    return{
        //pixel values for smoothing filter
        smoothingValues: [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16],
        //-1 means filter disabled
        bilateralFilterValues:  [-1, 0, 3, 4, 5, 7, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25, 30, 35, 40, 50, 60],
        imageFilterValues,
        //contrast highest value is 300%
        contrastFilterValues: imageFilterValues.filter((value)=>{ return value >= 100; }),
        calculatePixelationZoom,
    };

})();