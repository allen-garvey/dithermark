/**
 * Dithering utility functions shared between app and worker
 */

//based on the value of r from https://en.wikipedia.org/wiki/Ordered_dithering
//formula is hightestValue / cube_root(numColors)
//for webgl highestValue is 1.0, while for webworker it should be 255
//for bw dither in worker, using 255 gives incorrect results for some reason
function ditherRCoefficient(numColors, isWebgl = false) {
    const highestValue = isWebgl ? 1 : 256;
    return highestValue / Math.cbrt(numColors);
}

export default {
    ditherRCoefficient,
};
