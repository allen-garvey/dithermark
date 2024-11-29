
function create(length, fillFunc, arrayConstructor = Array) {
    const ret = new arrayConstructor(length);

    for (let i = 0; i < length; i++) {
        ret[i] = fillFunc(i);
    }
    return ret;
}

/**
 * @template T
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