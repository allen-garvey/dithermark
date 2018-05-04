/**
 * Dithering utility functions shared between app and worker
*/
App.DitherUtil = (function(Bayer){
    /**
    * Used to automagically generated exports based on patterns in BayerMatrix module
    */
    //capitalizes first letter
    //from https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript\
    function capitalize(s){
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    function generateBayerKeys(callback){
        Object.keys(Bayer).forEach((key)=>{
            const bwDitherKey = `create${capitalize(key)}Dither`;
            const colorDitherKey = `create${capitalize(key)}ColorDither`;
            callback(key, bwDitherKey, colorDitherKey);
        });
    }
    

    return {
        generateBayerKeys,
    };

})(App.BayerMatrix);