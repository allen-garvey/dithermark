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
// HDR_L_1.png
/**
 * dimensions should be power of 2
 * @param {number} dimensions
 */
const blueNoise = dimensions => {
    return new Uint8Array([
        232, 130, 251, 155, 98, 238, 199, 162, 85, 34, 101, 70, 44, 254, 29, 81,
        197, 120, 40, 19, 188, 137, 8, 128, 248, 178, 10, 160, 125, 181, 59,
        164, 11, 177, 88, 63, 112, 171, 22, 222, 58, 116, 208, 239, 17, 141,
        229, 104, 50, 215, 240, 144, 225, 46, 94, 76, 200, 152, 51, 90, 190, 77,
        36, 151, 126, 73, 161, 4, 203, 245, 192, 142, 39, 233, 132, 27, 223,
        113, 206, 249, 26, 186, 102, 35, 83, 124, 28, 107, 176, 5, 100, 157, 64,
        173, 0, 93, 221, 133, 235, 57, 180, 149, 68, 163, 250, 62, 217, 183,
        242, 136, 53, 196, 69, 16, 154, 209, 117, 18, 230, 212, 21, 82, 121, 42,
        15, 84, 165, 119, 246, 174, 45, 91, 255, 195, 49, 97, 131, 189, 202,
        148, 108, 210, 231, 38, 140, 78, 110, 9, 138, 169, 75, 1, 159, 236, 52,
        72, 253, 30, 153, 99, 201, 182, 214, 234, 33, 105, 224, 145, 114, 31,
        172, 12, 129, 191, 61, 6, 20, 127, 55, 158, 66, 187, 207, 43, 241, 87,
        219, 103, 179, 89, 226, 167, 220, 92, 247, 24, 86, 123, 13, 60, 166,
        198, 65, 143, 237, 41, 118, 74, 32, 106, 194, 139, 228, 175, 252, 96,
        134, 7, 122, 23, 204, 56, 156, 243, 147, 47, 170, 3, 115, 37, 150, 213,
        184, 48, 244, 80, 168, 2, 135, 185, 14, 67, 205, 79, 216, 54, 71, 25,
        109, 227, 146, 193, 218, 111, 95, 211,
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
