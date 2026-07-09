export const sleep = delay =>
    new Promise(resolve => {
        setTimeout(() => resolve(), delay);
    });

/**
 *
 * @param {Function} callback
 * @param {number} throttleTime
 * @returns {Function}
 * Same functionality as lodash.throttle with both leading and trailing options set to true
 */
export const throttle = (callback, throttleTime) => {
    let timeout = null;
    let lastCalled = 0;

    return (...args) => {
        const now = performance.now();
        const timeElapsed = now - lastCalled;
        const timeBeforeNextInvocation = throttleTime - timeElapsed;
        lastCalled = now;
        clearTimeout(timeout);
        // function approaching throttle time, call immediately
        if (timeBeforeNextInvocation < 0.1) {
            timeout = null;
            callback(...args);
            return;
        }
        // function is throttled, schedule invocation for later
        timeout = setTimeout(() => {
            callback(...args);
            timeout = null;
        }, timeBeforeNextInvocation);
    };
};
