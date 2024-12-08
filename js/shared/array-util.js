/**
 *
 * @param {number} length
 * @param {Function} fillFunc
 * @returns {Array}
 */
export const createArray = (length, fillFunc) => {
    const ret = new Array(length);

    for (let i = 0; i < length; i++) {
        ret[i] = fillFunc(i);
    }
    return ret;
};

/**
 * @template {Uint16Array|Uint8Array|Uint8ClampedArray|Float32Array} T
 * @param {T} typedArray
 * @param {Function} fillFunc
 * @returns {T}
 */
export const fillArray = (typedArray, fillFunc) => {
    const length = typedArray.length;

    for (let i = 0; i < length; i++) {
        typedArray[i] = fillFunc(i);
    }
    return typedArray;
};
