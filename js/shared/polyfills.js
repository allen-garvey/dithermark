
/**
 * 
 * @param {number} byteLength 
 * @returns {SharedArrayBuffer|ArrayBuffer}
 */
export const createSharedArrayBuffer = (byteLength) => {
    const bufferConstructor = typeof SharedArrayBuffer === 'undefined' ? ArrayBuffer : SharedArrayBuffer;

    return new bufferConstructor(byteLength);
};
