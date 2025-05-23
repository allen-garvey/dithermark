// Adapted from: https://github.com/jwagner/simplex-noise.js/blob/main/simplex-noise.ts

/*
 * A fast javascript implementation of simplex noise by Jonas Wagner

Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
Better rank ordering method by Stefan Gustavson in 2012.

 Copyright (c) 2024 Jonas Wagner

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

// these __PURE__ comments help uglifyjs with dead code removal
//
const SQRT3 = /*#__PURE__*/ Math.sqrt(3.0);
const F2 = 0.5 * (SQRT3 - 1.0);
const G2 = (3.0 - SQRT3) / 6.0;

// I'm really not sure why this | 0 (basically a coercion to int)
// is making this faster but I get ~5 million ops/sec more on the
// benchmarks across the board or a ~10% speedup.
/**
 *
 * @param {number} x
 * @returns {number}
 */
const fastFloor = (x) => Math.floor(x) | 0;

const grad2 = /*#__PURE__*/ new Float64Array([
    1, 1, -1, 1, 1, -1,

    -1, -1, 1, 0, -1, 0,

    1, 0, -1, 0, 0, 1,

    0, -1, 0, 1, 0, -1,
]);

/**
 * Samples the noise field in two dimensions
 *
 * Coordinates should be finite, bigger than -2^31 and smaller than 2^31.
 * @name NoiseFunction2D
 * @function
 * @param {number} x
 * @param {number} y
 * @returns {number} a number in the interval [0, 1]
 */
// export type NoiseFunction2D = (x: number, y: number) => number;

/**
 * Creates a 2D noise function
 * //@returns {NoiseFunction2D}
 */
export function createNoise2D() {
    const perm = buildPermutationTable();
    // precalculating this yields a little ~3% performance improvement.
    const permGrad2x = new Float64Array(perm).map((v) => grad2[(v % 12) * 2]);
    const permGrad2y = new Float64Array(perm).map(
        (v) => grad2[(v % 12) * 2 + 1]
    );
    /**
     * @param {number} x
     * @param {number} y
     * @returns {number}
     */
    return function noise2D(x, y) {
        let n0 = 0; // Noise contributions from the three corners
        let n1 = 0;
        let n2 = 0;
        // Skew the input space to determine which simplex cell we're in
        const s = (x + y) * F2; // Hairy factor for 2D
        const i = fastFloor(x + s);
        const j = fastFloor(y + s);
        const t = (i + j) * G2;
        const X0 = i - t; // Unskew the cell origin back to (x,y) space
        const Y0 = j - t;
        const x0 = x - X0; // The x,y distances from the cell origin
        const y0 = y - Y0;
        // For the 2D case, the simplex shape is an equilateral triangle.
        // Determine which simplex we are in.
        let i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
        if (x0 > y0) {
            i1 = 1;
            j1 = 0;
        } // lower triangle, XY order: (0,0)->(1,0)->(1,1)
        else {
            i1 = 0;
            j1 = 1;
        } // upper triangle, YX order: (0,0)->(0,1)->(1,1)
        // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
        // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
        // c = (3-sqrt(3))/6
        const x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
        const y2 = y0 - 1.0 + 2.0 * G2;
        // Work out the hashed gradient indices of the three simplex corners
        const ii = i & 255;
        const jj = j & 255;
        // Calculate the contribution from the three corners
        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 >= 0) {
            const gi0 = ii + perm[jj];
            const g0x = permGrad2x[gi0];
            const g0y = permGrad2y[gi0];
            t0 *= t0;
            // n0 = t0 * t0 * (grad2[gi0] * x0 + grad2[gi0 + 1] * y0); // (x,y) of grad3 used for 2D gradient
            n0 = t0 * t0 * (g0x * x0 + g0y * y0);
        }
        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 >= 0) {
            const gi1 = ii + i1 + perm[jj + j1];
            const g1x = permGrad2x[gi1];
            const g1y = permGrad2y[gi1];
            t1 *= t1;
            // n1 = t1 * t1 * (grad2[gi1] * x1 + grad2[gi1 + 1] * y1);
            n1 = t1 * t1 * (g1x * x1 + g1y * y1);
        }
        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 >= 0) {
            const gi2 = ii + 1 + perm[jj + 1];
            const g2x = permGrad2x[gi2];
            const g2y = permGrad2y[gi2];
            t2 *= t2;
            // n2 = t2 * t2 * (grad2[gi2] * x2 + grad2[gi2 + 1] * y2);
            n2 = t2 * t2 * (g2x * x2 + g2y * y2);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [0,1].
        return 35.0 * (n0 + n1 + n2) + 0.5;
    };
}

/**
 * Builds a random permutation table.
 * @return {Uint8Array}
 */
// function buildPermutationTable() {
//     const tableSize = 512;
//     const p = new Uint8Array(tableSize);
//     for (let i = 0; i < tableSize / 2; i++) {
//         p[i] = i;
//     }
//     for (let i = 0; i < tableSize / 2 - 1; i++) {
//         const r = i + ~~(Math.random() * (256 - i));
//         const aux = p[i];
//         p[i] = p[r];
//         p[r] = aux;
//     }
//     for (let i = 256; i < tableSize; i++) {
//         p[i] = p[i - 256];
//     }
//     return p;
// }

/**
 * Using a hard-coded permutation table instead of the function above,
 * because otherwise all the webworkers will be using a different version of the table
 * @return {Uint8Array}
 */
function buildPermutationTable() {
    return new Uint8Array([
        139, 215, 156, 15, 218, 175, 146, 188, 200, 212, 209, 117, 223, 170,
        230, 14, 79, 9, 128, 127, 94, 83, 41, 255, 42, 37, 176, 75, 23, 122,
        228, 252, 11, 238, 240, 115, 166, 84, 36, 74, 164, 10, 133, 101, 205,
        185, 32, 58, 109, 135, 65, 147, 63, 227, 246, 245, 125, 203, 18, 51,
        219, 202, 50, 213, 241, 235, 180, 5, 7, 207, 98, 178, 132, 157, 196,
        251, 145, 165, 77, 171, 53, 78, 150, 34, 43, 29, 220, 204, 85, 1, 30,
        90, 0, 40, 47, 136, 141, 80, 104, 57, 111, 95, 56, 158, 234, 182, 226,
        244, 70, 39, 201, 187, 12, 87, 130, 169, 140, 113, 6, 211, 129, 25, 81,
        92, 155, 54, 123, 153, 250, 181, 82, 64, 210, 152, 68, 45, 193, 69, 110,
        103, 168, 46, 89, 38, 17, 61, 198, 33, 22, 120, 154, 20, 143, 44, 2, 72,
        214, 60, 225, 237, 239, 191, 161, 208, 236, 199, 222, 183, 67, 8, 190,
        172, 206, 86, 4, 194, 26, 217, 138, 91, 100, 163, 116, 52, 249, 142,
        248, 105, 221, 62, 121, 16, 192, 184, 159, 253, 97, 151, 162, 247, 49,
        144, 88, 177, 73, 186, 3, 107, 71, 93, 21, 148, 102, 55, 149, 66, 119,
        112, 233, 137, 13, 126, 174, 243, 131, 28, 31, 231, 197, 179, 160, 124,
        96, 19, 254, 216, 189, 24, 224, 118, 167, 76, 48, 35, 106, 229, 242, 59,
        195, 134, 114, 27, 173, 232, 108, 99, 139, 215, 156, 15, 218, 175, 146,
        188, 200, 212, 209, 117, 223, 170, 230, 14, 79, 9, 128, 127, 94, 83, 41,
        255, 42, 37, 176, 75, 23, 122, 228, 252, 11, 238, 240, 115, 166, 84, 36,
        74, 164, 10, 133, 101, 205, 185, 32, 58, 109, 135, 65, 147, 63, 227,
        246, 245, 125, 203, 18, 51, 219, 202, 50, 213, 241, 235, 180, 5, 7, 207,
        98, 178, 132, 157, 196, 251, 145, 165, 77, 171, 53, 78, 150, 34, 43, 29,
        220, 204, 85, 1, 30, 90, 0, 40, 47, 136, 141, 80, 104, 57, 111, 95, 56,
        158, 234, 182, 226, 244, 70, 39, 201, 187, 12, 87, 130, 169, 140, 113,
        6, 211, 129, 25, 81, 92, 155, 54, 123, 153, 250, 181, 82, 64, 210, 152,
        68, 45, 193, 69, 110, 103, 168, 46, 89, 38, 17, 61, 198, 33, 22, 120,
        154, 20, 143, 44, 2, 72, 214, 60, 225, 237, 239, 191, 161, 208, 236,
        199, 222, 183, 67, 8, 190, 172, 206, 86, 4, 194, 26, 217, 138, 91, 100,
        163, 116, 52, 249, 142, 248, 105, 221, 62, 121, 16, 192, 184, 159, 253,
        97, 151, 162, 247, 49, 144, 88, 177, 73, 186, 3, 107, 71, 93, 21, 148,
        102, 55, 149, 66, 119, 112, 233, 137, 13, 126, 174, 243, 131, 28, 31,
        231, 197, 179, 160, 124, 96, 19, 254, 216, 189, 24, 224, 118, 167, 76,
        48, 35, 106, 229, 242, 59, 195, 134, 114, 27, 173, 232, 108, 99,
    ]);
}
