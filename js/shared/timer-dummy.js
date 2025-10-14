/**
 * Version of timer for release builds with timer logging off
 * make sure public functions are the same as timer.js
 */

function megapixelsPerSecond(a, b, func, gl) {
    func();
}

export default {
    megapixelsPerSecond,
};
