export const sleep = delay =>
    new Promise(resolve => {
        setTimeout(() => resolve(), delay);
    });

// this function is brittle since navigator.vender is deprecated
// but hopefully by the time it is actually deprecated
// Safari webcodecs will be able to export H.264 and H.265 video correctly
export const isSafari = () =>
    navigator.vendor && navigator.vendor.startsWith('Apple');
