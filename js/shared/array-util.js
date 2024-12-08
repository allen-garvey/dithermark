/**
 *
 * @param {number} length
 * @param {Function} fillFunc
 * @returns {Array}
 */
function create(length, fillFunc) {
    const ret = new Array(length);

    for (let i = 0; i < length; i++) {
        ret[i] = fillFunc(i);
    }
    return ret;
}

/**
 * @template {Uint16Array|Uint8Array|Uint8ClampedArray|Float32Array} T
 * @param {T} arrayLike
 * @param {Function} fillFunc
 * @returns {T}
 */
export const fillArray = (arrayLike, fillFunc) => {
    const length = arrayLike.length;

    for (let i = 0; i < length; i++) {
        arrayLike[i] = fillFunc(i);
    }
    return arrayLike;
};

export default {
    create,
};
