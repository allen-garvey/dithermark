/**
 * Dithering utility functions shared between app and worker
*/

import Bayer from './bayer-matrix.js';


//based on the value of r from https://en.wikipedia.org/wiki/Ordered_dithering
//formula is hightestValue / cube_root(numColors)
//for webgl highestValue is 1.0, while for webworker it should be 255
//for bw dither in worker, using 255 gives incorrect results for some reason
function ditherRCoefficient(numColors, isWebgl=false){
    const highestValue = isWebgl ? 1 : 256;
    return highestValue / Math.cbrt(numColors);
}

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


export default {
    generateBayerKeys,
    ditherRCoefficient,
};