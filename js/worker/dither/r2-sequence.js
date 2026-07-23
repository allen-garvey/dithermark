// Implementation of R2 Sequence from: https://matejlou.blog/2023/12/06/ordered-dithering-for-arbitrary-or-irregular-palettes/

/**
 * Simplified implementation of fmodf
 * Don't use second number since we are using 1.0 for that anyway
 * @param {number} x
 * @returns {number}
 */
const mod = x => {
    const remainder = Math.trunc(x);
    return x - remainder;
};

/**
 *
 * @param {number} x
 * @param {number} y
 * @returns {number}
 */
export const r2Sequence = (x, y) => {
    const value = mod(0.7548776662 * x + 0.56984029 * y);
    return value < 0.5 ? 2.0 * value : 2.0 - 2.0 * value;
};
