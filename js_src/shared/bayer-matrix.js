/** iterative bayer matrix creation function based on recursive definition from
 * https://en.wikipedia.org/wiki/Ordered_dithering of bayer matrix
 * @param dimensions = power of 2 greater than or equal to 2 (length of 1 side of the matrix)
 */
function bayer(dimensions) {
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
}
function rotate90Degrees(source, dimensions) {
    const ret = new Uint8Array(source.length);
    for (let x = dimensions - 1, retIndex = 0; x >= 0; x--) {
        for (let y = 0; y < dimensions; y++, retIndex++) {
            ret[retIndex] = source[x + y * dimensions];
        }
    }
    return ret;
}

//based on: http://research.cs.wisc.edu/graphics/Courses/559-f2002/lectures/cs559-5.ppt
//dimensions should be power of 2
//example for 4x4
// return new Uint8Array([
//     15, 11, 7, 3,
//     11, 11, 7, 3,
//     7, 7, 7, 3,
//     3, 3, 3, 0,
// ]);
function square(dimensions) {
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
}

//based on: http://research.cs.wisc.edu/graphics/Courses/559-f2004/lectures/cs559-5.ppt
function cluster(dimensions) {
    return new Uint8Array([
        11, 5, 9, 3, 0, 15, 13, 6, 7, 12, 14, 1, 2, 8, 4, 10,
    ]);
}

//diagonal hatch pattern
//to upper right
function hatchRight(dimensions) {
    return new Uint8Array([15, 7, 0, 7, 7, 0, 7, 15, 0, 7, 15, 7, 7, 15, 7, 0]);
}

//diagonal hatch pattern
//to upper left
//(reflection of hatchRight)
function hatchLeft(dimensions) {
    return rotate90Degrees(hatchRight(dimensions), dimensions);
}

function hatchVertical(dimensions) {
    return new Uint8Array([7, 0, 7, 15, 7, 0, 7, 15, 7, 0, 7, 15, 7, 0, 7, 15]);
}

function hatchHorizontal(dimensions) {
    return rotate90Degrees(hatchVertical(dimensions), dimensions);
}

function crossHatchVertical(dimensions) {
    return new Uint8Array([9, 2, 9, 15, 5, 0, 5, 13, 9, 2, 9, 15, 5, 0, 5, 13]);
}

function crossHatchHorizontal(dimensions) {
    return rotate90Degrees(crossHatchVertical(dimensions), dimensions);
}

function crossHatchRight(dimensions) {
    return new Uint8Array([13, 6, 2, 7, 8, 0, 6, 15, 2, 8, 13, 6, 7, 15, 8, 0]);
}

function crossHatchLeft(dimensions) {
    return rotate90Degrees(crossHatchRight(dimensions), dimensions);
}

function zigzagHorizontal(dimensions) {
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
}

function zigzagVertical(dimensions) {
    return rotate90Degrees(zigzagHorizontal(dimensions), dimensions);
}

//fishnet pattern
function fishnet(dimensions) {
    return new Uint8Array([
        47, 15, 15, 15, 15, 15, 15, 47, 15, 31, 15, 15, 15, 15, 31, 15, 15, 15,
        47, 15, 15, 47, 15, 15, 15, 15, 15, 63, 63, 15, 15, 15, 15, 15, 15, 63,
        63, 15, 15, 15, 15, 15, 47, 15, 15, 47, 15, 15, 15, 31, 15, 15, 15, 15,
        31, 15, 47, 15, 15, 15, 15, 15, 15, 47,
    ]);
}

function dot(dimensions) {
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
}

//from: http://caca.zoy.org/study/part2.html
//halftone pattern, similar to newspapers
function halftone(dimensions) {
    return new Uint8Array([
        24, 10, 12, 26, 35, 47, 49, 37, 8, 0, 2, 14, 45, 59, 61, 51, 22, 6, 4,
        16, 43, 57, 63, 53, 30, 20, 18, 28, 33, 41, 55, 39, 34, 46, 48, 36, 25,
        11, 13, 27, 44, 58, 60, 50, 9, 1, 3, 15, 42, 56, 62, 52, 23, 7, 5, 17,
        32, 40, 54, 38, 31, 121, 19, 29,
    ]);
}

function checkerboard(dimensions) {
    return new Uint8Array([1, 2, 2, 1]);
}

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
};
