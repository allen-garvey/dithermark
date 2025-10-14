/*
In matrix, groups of 3 values. First number is x offset, second is y offset, third number is percentage of error
*/

function floydSteinberg() {
    const error1 = 1 / 16;
    const error7 = error1 * 7;
    const error5 = error1 * 5;
    const error3 = error1 * 3;

    const matrix = new Float32Array([
        1,
        0,
        error7,
        1,
        1,
        error1,
        0,
        1,
        error5,
        -1,
        1,
        error3,
    ]);

    return {
        matrix,
        lengthOffset: 1,
        numRows: 2,
    };
}

function javisJudiceNinke() {
    const error1 = 1 / 48;
    const error7 = error1 * 7;
    const error5 = error1 * 5;
    const error3 = error1 * 3;

    const matrix = new Float32Array([
        1,
        0,
        error7,
        2,
        0,
        error5,

        -2,
        1,
        error3,
        -1,
        1,
        error5,
        0,
        1,
        error7,
        1,
        1,
        error5,
        2,
        1,
        error3,

        -2,
        2,
        error1,
        -1,
        2,
        error3,
        0,
        2,
        error5,
        1,
        2,
        error3,
        2,
        2,
        error1,
    ]);

    return {
        matrix,
        lengthOffset: 2,
        numRows: 3,
    };
}

function stucki() {
    const error1 = 1 / 42;
    const error8 = error1 * 8;
    const error4 = error1 * 4;
    const error2 = error1 * 2;

    const matrix = new Float32Array([
        1,
        0,
        error8,
        2,
        0,
        error4,

        -2,
        1,
        error2,
        -1,
        1,
        error4,
        0,
        1,
        error8,
        1,
        1,
        error4,
        2,
        1,
        error2,

        -2,
        2,
        error1,
        -1,
        2,
        error2,
        0,
        2,
        error4,
        1,
        2,
        error2,
        2,
        2,
        error1,
    ]);

    return {
        matrix,
        lengthOffset: 2,
        numRows: 3,
    };
}

function burkes() {
    const errorPart = 1 / 32;
    const error8 = errorPart * 8;
    const error4 = errorPart * 4;
    const error2 = errorPart * 2;

    const matrix = new Float32Array([
        1,
        0,
        error8,
        2,
        0,
        error4,

        -2,
        1,
        error2,
        -1,
        1,
        error4,
        0,
        1,
        error8,
        1,
        1,
        error4,
        2,
        1,
        error2,
    ]);

    return {
        matrix,
        lengthOffset: 2,
        numRows: 2,
    };
}

function sierra3() {
    const error1 = 1 / 32;

    const error5 = error1 * 5;
    const error4 = error1 * 4;
    const error3 = error1 * 3;
    const error2 = error1 * 2;

    const matrix = new Float32Array([
        1,
        0,
        error5,
        2,
        0,
        error3,

        -2,
        1,
        error2,
        -1,
        1,
        error4,
        0,
        1,
        error5,
        1,
        1,
        error4,
        2,
        1,
        error2,

        -1,
        2,
        error2,
        0,
        2,
        error3,
        1,
        2,
        error2,
    ]);

    return {
        matrix,
        lengthOffset: 2,
        numRows: 3,
    };
}

function sierra2() {
    const error1 = 1 / 16;
    const error4 = error1 * 4;
    const error3 = error1 * 3;
    const error2 = error1 * 2;

    const matrix = new Float32Array([
        1,
        0,
        error4,
        2,
        0,
        error3,

        -2,
        1,
        error1,
        -1,
        1,
        error2,
        0,
        1,
        error3,
        1,
        1,
        error2,
        2,
        1,
        error1,
    ]);

    return {
        matrix,
        lengthOffset: 2,
        numRows: 2,
    };
}

function sierra1() {
    const error1 = 1 / 4;
    const error2 = error1 * 2;

    const matrix = new Float32Array([
        1,
        0,
        error2,
        -1,
        1,
        error1,
        0,
        1,
        error1,
    ]);

    return {
        matrix,
        lengthOffset: 1,
        numRows: 2,
    };
}

function atkinson() {
    const error1 = 1 / 8;

    const matrix = new Float32Array([
        1,
        0,
        error1,
        2,
        0,
        error1,

        -1,
        1,
        error1,
        0,
        1,
        error1,
        1,
        1,
        error1,

        0,
        2,
        error1,
    ]);

    return {
        matrix,
        lengthOffset: 2,
        numRows: 3,
    };
}
//based on atkinson, but with further reduced bleed
function reducedAtkinson() {
    const error1 = 1 / 16;
    const error2 = error1 * 2;

    const matrix = new Float32Array([
        1,
        0,
        error2,
        2,
        0,
        error1,

        0,
        1,
        error2,
        1,
        1,
        error1,
    ]);

    return {
        matrix,
        lengthOffset: 2,
        numRows: 2,
    };
}

export default {
    floydSteinberg,
    javisJudiceNinke,
    stucki,
    burkes,
    sierra3,
    sierra2,
    sierra1,
    atkinson,
    reducedAtkinson,
};
