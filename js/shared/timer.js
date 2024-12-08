/**
 * Used for performance timing
 * if changing public functions, make sure to update timer-dummy.js for release builds
 */

/**
 *
 * @param {string} name
 * @param {number} numPixels
 * @param {Function} functionToTime
 */
function megapixelsPerSecond(name, numPixels, functionToTime) {
    const start = performance.now();
    functionToTime();
    const end = performance.now();
    const seconds = (end - start) / 1000;
    const megapixels = numPixels / 1000000;
    const megapixelsPerSecond = megapixels / seconds;
    console.log(
        `${name}: ${seconds}s, ${megapixelsPerSecond.toFixed(2)} megapixels/s`
    );
}

export default {
    megapixelsPerSecond,
};
