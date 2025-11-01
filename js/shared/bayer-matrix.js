/**
 *
 * @param {Uint8Array} source
 * @param {number} dimensions
 */
const rotate90Degrees = (source, dimensions) => {
    const ret = new Uint8Array(source.length);
    for (let x = dimensions - 1, retIndex = 0; x >= 0; x--) {
        for (let y = 0; y < dimensions; y++, retIndex++) {
            ret[retIndex] = source[x + y * dimensions];
        }
    }
    return ret;
};

/** iterative bayer matrix creation const based on recursive definition from
 * https://en.wikipedia.org/wiki/Ordered_dithering of bayer matrix
 * @param {number} dimensions = power of 2 greater than or equal to 2 (length of 1 side of the matrix)
 */
const bayer = dimensions => {
    const bayerBase = new Uint8Array([0, 2, 3, 1]);

    //guard against infinite loop
    if (dimensions <= 2) {
        return bayerBase;
    }

    // let arrayTotalLength = dimensions * dimensions;
    let currentDimension = 2;
    let bayerArray = new Uint8Array(bayerBase);

    while (currentDimension < dimensions) {
        //dimensions of 1 of the four blocks
        let sectionDimensions = currentDimension;
        currentDimension *= 2;
        let subarrayLength = currentDimension * currentDimension;
        let newBayerArray = new Uint8Array(subarrayLength);

        //cycle through source in 4 equal blocks going clockwise starting from top left
        for (let i = 0; i < 4; i++) {
            let destOffset = 0;
            //last 2 blocks are in bottom half of matrix
            if (i > 1) {
                destOffset += subarrayLength / 2;
            }
            //2nd and 4th blocks are in right half of matrix
            if (i % 2 != 0) {
                destOffset += sectionDimensions;
            }

            let j = 0;
            for (let y = 0; y < sectionDimensions; y++) {
                for (let x = 0; x < sectionDimensions; x++) {
                    let destIndex = x + destOffset;
                    newBayerArray[destIndex] = bayerArray[j] * 4 + bayerBase[i];
                    j++;
                }
                destOffset += currentDimension;
            }
        }
        bayerArray = newBayerArray;
    }
    return bayerArray;
};

//based on: http://research.cs.wisc.edu/graphics/Courses/559-f2002/lectures/cs559-5.ppt
//example for 4x4
// return new Uint8Array([
//     15, 11, 7, 3,
//     11, 11, 7, 3,
//     7, 7, 7, 3,
//     3, 3, 3, 0,
// ]);
/**
 * dimensions should be power of 2
 * @param {number} dimensions
 */
const square = dimensions => {
    const length = dimensions * dimensions;
    const ret = new Uint8Array(length);
    ret[0] = length - 1;

    for (let i = 1; i < dimensions; i++) {
        const value = (dimensions - i) * dimensions - 1;
        for (let j = 0; j < i; j++) {
            ret[j * dimensions + i] = value;
        }

        const offset = i * dimensions;
        for (let j = 0; j < dimensions; j++) {
            ret[offset + j] = value;
        }
    }
    ret[length - 1] = 0;

    return ret;
};

//based on: http://research.cs.wisc.edu/graphics/Courses/559-f2004/lectures/cs559-5.ppt
/**
 * dimensions should be power of 2
 * @param {number} dimensions
 */
const cluster = dimensions => {
    return new Uint8Array([
        11, 5, 9, 3, 0, 15, 13, 6, 7, 12, 14, 1, 2, 8, 4, 10,
    ]);
};

//diagonal hatch pattern to upper right
/**
 * dimensions should be power of 2
 * @param {number} dimensions
 */
const hatchRight = dimensions => {
    return new Uint8Array([15, 7, 0, 7, 7, 0, 7, 15, 0, 7, 15, 7, 7, 15, 7, 0]);
};

//diagonal hatch pattern to upper left
//(reflection of hatchRight)
/**
 * dimensions should be power of 2
 * @param {number} dimensions
 */
const hatchLeft = dimensions => {
    return rotate90Degrees(hatchRight(dimensions), dimensions);
};

/**
 * dimensions should be power of 2
 * @param {number} dimensions
 */
const hatchVertical = dimensions => {
    return new Uint8Array([7, 0, 7, 15, 7, 0, 7, 15, 7, 0, 7, 15, 7, 0, 7, 15]);
};

/**
 * dimensions should be power of 2
 * @param {number} dimensions
 */
const hatchHorizontal = dimensions => {
    return rotate90Degrees(hatchVertical(dimensions), dimensions);
};

/**
 * dimensions should be power of 2
 * @param {number} dimensions
 */
const crossHatchVertical = dimensions => {
    return new Uint8Array([9, 2, 9, 15, 5, 0, 5, 13, 9, 2, 9, 15, 5, 0, 5, 13]);
};

/**
 * dimensions should be power of 2
 * @param {number} dimensions
 */
const crossHatchHorizontal = dimensions => {
    return rotate90Degrees(crossHatchVertical(dimensions), dimensions);
};

/**
 * dimensions should be power of 2
 * @param {number} dimensions
 */
const crossHatchRight = dimensions => {
    return new Uint8Array([13, 6, 2, 7, 8, 0, 6, 15, 2, 8, 13, 6, 7, 15, 8, 0]);
};

/**
 * dimensions should be power of 2
 * @param {number} dimensions
 */
const crossHatchLeft = dimensions => {
    return rotate90Degrees(crossHatchRight(dimensions), dimensions);
};

/**
 * dimensions should be power of 2
 * @param {number} dimensions
 */
const zigzagHorizontal = dimensions => {
    if (dimensions <= 4) {
        return new Uint8Array([
            7, 0, 0, 7, 0, 7, 7, 0, 7, 15, 15, 7, 15, 7, 7, 15,
        ]);
    }
    if (dimensions >= 16) {
        return new Uint8Array([
            127, 0, 127, 191, 127, 63, 127, 255, 255, 127, 63, 127, 191, 127, 0,
            127, 0, 127, 191, 127, 63, 127, 255, 127, 127, 255, 127, 63, 127,
            191, 127, 0, 127, 191, 127, 63, 127, 255, 127, 0, 0, 127, 255, 127,
            63, 127, 191, 127, 191, 127, 63, 127, 255, 127, 0, 127, 127, 0, 127,
            255, 127, 63, 127, 191, 127, 63, 127, 255, 127, 0, 127, 191, 191,
            127, 0, 127, 255, 127, 63, 127, 63, 127, 255, 127, 0, 127, 191, 127,
            127, 191, 127, 0, 127, 255, 127, 63, 127, 255, 127, 0, 127, 191,
            127, 63, 63, 127, 191, 127, 0, 127, 255, 127, 255, 127, 0, 127, 191,
            127, 63, 127, 127, 63, 127, 191, 127, 0, 127, 255, 127, 0, 127, 191,
            127, 63, 127, 255, 255, 127, 63, 127, 191, 127, 0, 127, 0, 127, 191,
            127, 63, 127, 255, 127, 127, 255, 127, 63, 127, 191, 127, 0, 127,
            191, 127, 63, 127, 255, 127, 0, 0, 127, 255, 127, 63, 127, 191, 127,
            191, 127, 63, 127, 255, 127, 0, 127, 127, 0, 127, 255, 127, 63, 127,
            191, 127, 63, 127, 255, 127, 0, 127, 191, 191, 127, 0, 127, 255,
            127, 63, 127, 63, 127, 255, 127, 0, 127, 191, 127, 127, 191, 127, 0,
            127, 255, 127, 63, 127, 255, 127, 0, 127, 191, 127, 63, 63, 127,
            191, 127, 0, 127, 255, 127, 255, 127, 0, 127, 191, 127, 63, 127,
            127, 63, 127, 191, 127, 0, 127, 255,
        ]);
    }
    return new Uint8Array([
        63, 31, 0, 31, 31, 0, 31, 63, 31, 0, 31, 63, 63, 31, 0, 31, 0, 31, 63,
        31, 31, 63, 31, 0, 31, 63, 31, 0, 0, 31, 63, 31, 63, 31, 0, 31, 31, 0,
        31, 63, 31, 0, 31, 63, 63, 31, 0, 31, 0, 31, 63, 31, 31, 63, 31, 0, 31,
        63, 31, 0, 0, 31, 63, 31,
    ]);
};

/**
 * dimensions should be power of 2
 * @param {number} dimensions
 */
const zigzagVertical = dimensions => {
    return rotate90Degrees(zigzagHorizontal(dimensions), dimensions);
};

/**
 * dimensions should be power of 2
 * @param {number} dimensions
 */
const fishnet = dimensions => {
    return new Uint8Array([
        47, 15, 15, 15, 15, 15, 15, 47, 15, 31, 15, 15, 15, 15, 31, 15, 15, 15,
        47, 15, 15, 47, 15, 15, 15, 15, 15, 63, 63, 15, 15, 15, 15, 15, 15, 63,
        63, 15, 15, 15, 15, 15, 47, 15, 15, 47, 15, 15, 15, 31, 15, 15, 15, 15,
        31, 15, 47, 15, 15, 15, 15, 15, 15, 47,
    ]);
};

/**
 * dimensions should be power of 2
 * @param {number} dimensions
 */
const dot = dimensions => {
    if (dimensions === 4) {
        return new Uint8Array([
            0, 2, 3, 0, 2, 15, 12, 3, 3, 13, 14, 2, 0, 3, 2, 0,
        ]);
    }
    return new Uint8Array([
        0, 0, 15, 15, 15, 15, 0, 0, 0, 15, 31, 31, 31, 31, 15, 0, 15, 31, 31,
        47, 47, 31, 31, 15, 15, 31, 47, 63, 63, 47, 31, 15, 15, 31, 47, 63, 63,
        47, 31, 15, 15, 31, 31, 47, 47, 31, 31, 15, 0, 15, 31, 31, 31, 31, 15,
        0, 0, 0, 15, 15, 15, 15, 0, 0,
    ]);
};

//from: http://caca.zoy.org/study/part2.html
//halftone pattern, similar to newspapers
/**
 * dimensions should be power of 2
 * @param {number} dimensions
 */
const halftone = dimensions => {
    return new Uint8Array([
        24, 10, 12, 26, 35, 47, 49, 37, 8, 0, 2, 14, 45, 59, 61, 51, 22, 6, 4,
        16, 43, 57, 63, 53, 30, 20, 18, 28, 33, 41, 55, 39, 34, 46, 48, 36, 25,
        11, 13, 27, 44, 58, 60, 50, 9, 1, 3, 15, 42, 56, 62, 52, 23, 7, 5, 17,
        32, 40, 54, 38, 31, 121, 19, 29,
    ]);
};

/**
 * dimensions should be power of 2
 * @param {number} dimensions
 */
const checkerboard = dimensions => {
    return new Uint8Array([1, 2, 2, 1]);
};

/**
 * dimensions should be power of 2
 * @param {number} dimensions
 */
const smile = dimensions => {
    if (dimensions === 8) {
        return new Uint8Array([
            18, 26, 26, 26, 26, 26, 26, 18, 26, 40, 54, 26, 26, 54, 40, 26, 26,
            54, 63, 26, 26, 63, 54, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 63,
            26, 26, 26, 26, 63, 26, 26, 40, 63, 26, 26, 63, 40, 26, 26, 31, 40,
            63, 63, 40, 31, 26, 18, 26, 26, 26, 26, 26, 26, 18,
        ]);
    }

    return new Uint8Array([
        62, 75, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 75, 62, 75, 94,
        94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 75, 94, 128, 128,
        128, 128, 128, 94, 94, 94, 94, 128, 128, 128, 128, 128, 94, 94, 128,
        201, 201, 201, 228, 94, 94, 94, 94, 228, 201, 201, 201, 128, 94, 94,
        128, 201, 228, 255, 255, 94, 94, 94, 94, 255, 255, 228, 201, 128, 94,
        94, 128, 201, 255, 255, 255, 94, 94, 94, 94, 255, 255, 255, 201, 128,
        94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94,
        94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94,
        94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 111, 144, 144, 201,
        144, 144, 144, 144, 144, 144, 144, 144, 201, 144, 144, 111, 111, 144,
        201, 255, 201, 144, 144, 144, 144, 144, 144, 201, 255, 201, 144, 111,
        94, 111, 144, 201, 255, 201, 144, 144, 144, 144, 201, 255, 201, 144,
        111, 94, 94, 94, 111, 144, 201, 255, 201, 201, 201, 201, 255, 201, 144,
        111, 94, 94, 94, 94, 111, 144, 201, 255, 255, 255, 255, 255, 255, 201,
        144, 111, 94, 94, 55, 94, 94, 111, 111, 144, 144, 201, 201, 144, 144,
        111, 111, 94, 94, 55, 75, 75, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94,
        94, 94, 75, 75, 62, 75, 55, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 55,
        75, 62,
    ]);
};

/**
 * dimensions should be power of 2
 * @param {number} dimensions
 */
const heart = dimensions => {
    if (dimensions === 16) {
        return new Uint8Array([
            54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 54,
            80, 128, 201, 201, 178, 84, 54, 84, 178, 201, 201, 128, 80, 54, 54,
            54, 128, 201, 201, 201, 201, 178, 118, 178, 201, 201, 201, 201, 128,
            54, 54, 80, 178, 201, 201, 201, 201, 201, 178, 201, 201, 201, 201,
            201, 178, 80, 54, 108, 201, 201, 201, 201, 201, 201, 201, 201, 201,
            201, 201, 201, 201, 108, 54, 108, 201, 201, 201, 201, 201, 201, 201,
            201, 201, 201, 201, 201, 201, 108, 54, 80, 178, 201, 201, 201, 201,
            201, 201, 201, 201, 201, 201, 201, 178, 80, 54, 54, 128, 201, 201,
            201, 201, 201, 201, 201, 201, 201, 201, 201, 128, 54, 54, 54, 80,
            178, 201, 201, 201, 201, 201, 201, 201, 201, 201, 178, 80, 54, 54,
            54, 54, 128, 178, 201, 201, 201, 201, 201, 201, 201, 178, 128, 54,
            54, 54, 54, 54, 80, 128, 201, 201, 201, 201, 201, 201, 201, 128, 80,
            54, 54, 54, 54, 54, 54, 80, 178, 201, 201, 201, 201, 201, 178, 80,
            54, 54, 54, 54, 54, 54, 54, 54, 80, 128, 201, 201, 201, 128, 80, 54,
            54, 54, 54, 54, 54, 54, 54, 54, 54, 80, 128, 201, 128, 80, 54, 54,
            54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 108, 54, 54, 54, 54, 54,
            54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 54,
            54, 54,
        ]);
    }

    return new Uint8Array([
        15, 17, 12, 12, 12, 12, 17, 15, 23, 63, 63, 20, 20, 63, 63, 23, 31, 63,
        63, 44, 44, 63, 63, 31, 12, 44, 63, 63, 63, 63, 44, 12, 12, 44, 63, 63,
        63, 63, 44, 12, 12, 12, 44, 63, 63, 44, 12, 12, 12, 12, 12, 40, 40, 12,
        12, 12, 12, 12, 12, 17, 17, 12, 12, 12,
    ]);
};

/**
 * dimensions should be power of 2
 * @param {number} dimensions
 */
const stars = dimensions => {
    return new Uint8Array([
        81, 81, 81, 81, 81, 81, 81, 81, 81, 81, 81, 81, 81, 81, 81, 81, 81, 81,
        81, 95, 81, 81, 81, 81, 95, 81, 81, 81, 81, 95, 81, 81, 81, 81, 126,
        193, 126, 81, 81, 81, 153, 81, 81, 81, 126, 193, 126, 81, 81, 95, 193,
        255, 193, 95, 81, 81, 184, 81, 81, 95, 193, 255, 193, 95, 81, 81, 126,
        193, 126, 81, 81, 184, 255, 184, 81, 81, 126, 193, 126, 81, 81, 81, 81,
        95, 81, 81, 118, 184, 255, 184, 118, 81, 81, 95, 81, 81, 81, 81, 81, 81,
        81, 118, 184, 255, 255, 255, 184, 118, 81, 81, 81, 81, 81, 81, 81, 81,
        184, 184, 255, 255, 255, 255, 255, 184, 184, 81, 81, 81, 81, 95, 153,
        184, 255, 255, 255, 255, 255, 255, 255, 255, 255, 184, 153, 95, 81, 81,
        81, 81, 184, 184, 255, 255, 255, 255, 255, 184, 184, 81, 81, 81, 81, 81,
        81, 81, 81, 118, 184, 255, 255, 255, 184, 118, 81, 81, 81, 81, 81, 81,
        81, 95, 81, 81, 118, 184, 255, 184, 118, 81, 81, 95, 81, 81, 81, 81,
        126, 193, 126, 81, 81, 184, 255, 184, 81, 81, 126, 193, 126, 81, 81, 95,
        193, 255, 193, 95, 81, 81, 184, 81, 81, 95, 193, 255, 193, 95, 81, 81,
        126, 193, 126, 81, 81, 81, 153, 81, 81, 81, 126, 193, 126, 81, 81, 81,
        81, 95, 81, 81, 81, 81, 95, 81, 81, 81, 81, 95, 81, 81,
    ]);
};

// from: https://momentsingraphics.de/BlueNoise.html free blue noise textures download
// HDR_L_6.png
/**
 * dimensions should be power of 2
 * @param {number} dimensions
 */
const blueNoise = dimensions => {
    return new Uint8Array([
        208, 131, 159, 21, 143, 93, 126, 252, 101, 149, 242, 23, 54, 136, 191,
        236, 59, 35, 77, 248, 49, 200, 166, 80, 219, 64, 196, 109, 229, 73, 94,
        114, 244, 168, 105, 217, 182, 4, 112, 36, 140, 8, 122, 180, 37, 163,
        151, 26, 197, 141, 13, 123, 65, 153, 235, 55, 207, 170, 83, 238, 14,
        203, 221, 84, 50, 230, 178, 41, 90, 222, 132, 186, 25, 246, 97, 48, 142,
        62, 119, 5, 130, 67, 98, 240, 204, 15, 81, 104, 158, 70, 216, 128, 184,
        102, 253, 174, 154, 20, 190, 162, 32, 146, 254, 44, 199, 0, 148, 29,
        233, 74, 39, 214, 110, 247, 79, 135, 116, 61, 175, 125, 228, 111, 58,
        167, 206, 10, 194, 89, 56, 225, 2, 46, 220, 195, 11, 88, 34, 177, 245,
        92, 117, 156, 139, 27, 121, 179, 209, 106, 165, 71, 234, 210, 138, 78,
        192, 18, 45, 66, 232, 171, 40, 145, 85, 243, 28, 150, 99, 22, 157, 51,
        224, 127, 211, 249, 100, 201, 237, 63, 16, 129, 187, 53, 120, 250, 183,
        107, 6, 144, 164, 24, 82, 7, 189, 161, 96, 205, 75, 223, 3, 202, 38, 69,
        241, 95, 57, 185, 113, 134, 215, 31, 251, 172, 42, 137, 155, 86, 115,
        169, 218, 198, 33, 152, 226, 72, 147, 52, 118, 9, 108, 239, 176, 60,
        231, 133, 12, 76, 124, 255, 47, 103, 181, 87, 227, 193, 68, 213, 30, 17,
        188, 43, 160, 91, 212, 173, 1, 19,
    ]);
};

export default {
    bayer,
    square,
    cluster,
    hatchRight,
    hatchLeft,
    hatchVertical,
    hatchHorizontal,
    crossHatchVertical,
    crossHatchHorizontal,
    crossHatchRight,
    crossHatchLeft,
    fishnet,
    dot,
    zigzagHorizontal,
    zigzagVertical,
    halftone,
    checkerboard,
    smile,
    heart,
    stars,
    blueNoise,
};
