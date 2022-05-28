function createPropagationValue(xOffset, yOffset, errorFraction){
    const array = new Float32Array(3);
    array[0] = errorFraction;
    array[1] = xOffset;
    array[2] = yOffset;

    return array;
}

function floydSteinberg(){
    const error1 = 1 / 16;
    const error7 = error1 * 7;
    const error5 = error1 * 5;
    const error3 = error1 * 3;

    return [
        createPropagationValue(1, 0, error7),
        createPropagationValue(1, 1, error1),
        createPropagationValue(0, 1, error5),
        createPropagationValue(-1, 1, error3),
    ];
}

function javisJudiceNinke(){
    const error1 = 1 / 48;
    const error7 = error1 * 7;
    const error5 = error1 * 5;
    const error3 = error1 * 3;

    return [
        createPropagationValue(1, 0, error7),
        createPropagationValue(2, 0, error5),

        createPropagationValue(-2, 1, error3),
        createPropagationValue(-1, 1, error5),
        createPropagationValue(0, 1, error7),
        createPropagationValue(1, 1, error5),
        createPropagationValue(2, 1, error3),

        createPropagationValue(-2, 2, error1),
        createPropagationValue(-1, 2, error3),
        createPropagationValue(0, 2, error5),
        createPropagationValue(1, 2, error3),
        createPropagationValue(2, 2, error1),
    ];
}

function stucki(){
    const error1 = 1 / 42;
    const error8 = error1 * 8;
    const error4 = error1 * 4;
    const error2 = error1 * 2;

    return [
        createPropagationValue(1, 0, error8),
        createPropagationValue(2, 0, error4),

        createPropagationValue(-2, 1, error2),
        createPropagationValue(-1, 1, error4),
        createPropagationValue(0, 1, error8),
        createPropagationValue(1, 1, error4),
        createPropagationValue(2, 1, error2),

        createPropagationValue(-2, 2, error1),
        createPropagationValue(-1, 2, error2),
        createPropagationValue(0, 2, error4),
        createPropagationValue(1, 2, error2),
        createPropagationValue(2, 2, error1),
    ];
}

function burkes(){
    const errorPart = 1 / 32;
    const error8 = errorPart * 8;
    const error4 = errorPart * 4;
    const error2 = errorPart * 2;

    return [
        createPropagationValue(1, 0, error8),
        createPropagationValue(2, 0, error4),

        createPropagationValue(-2, 1, error2),
        createPropagationValue(-1, 1, error4),
        createPropagationValue(0, 1, error8),
        createPropagationValue(1, 1, error4),
        createPropagationValue(2, 1, error2),
    ];
}

function sierra3(){
    const error1 = 1 / 32;
    
    const error5 = error1 * 5;
    const error4 = error1 * 4;
    const error3 = error1 * 3;
    const error2 = error1 * 2;

    return [
        createPropagationValue(1, 0, error5),
        createPropagationValue(2, 0, error3),

        createPropagationValue(-2, 1, error2),
        createPropagationValue(-1, 1, error4),
        createPropagationValue(0, 1, error5),
        createPropagationValue(1, 1, error4),
        createPropagationValue(2, 1, error2),

        createPropagationValue(-1, 2, error2),
        createPropagationValue(0, 2, error3),
        createPropagationValue(1, 2, error2),
    ];
}

function sierra2(){
    const error1 = 1 / 16;
    const error4 = error1 * 4;
    const error3 = error1 * 3;
    const error2 = error1 * 2;

    return [
        createPropagationValue(1, 0, error4),
        createPropagationValue(2, 0, error3),

        createPropagationValue(-2, 1, error1),
        createPropagationValue(-1, 1, error2),
        createPropagationValue(0, 1, error3),
        createPropagationValue(1, 1, error2),
        createPropagationValue(2, 1, error1),
    ];
}

function sierra1(){
    const error1 = 1 / 4;
    const error2 = error1 * 2;

    return [
        createPropagationValue(1, 0, error2),
        createPropagationValue(-1, 1, error1),
        createPropagationValue(0, 1, error1),
    ];
}

function atkinson(){
    const error1 = 1 / 8;

    return [
        createPropagationValue(1, 0, error1),
        createPropagationValue(2, 0, error1),

        createPropagationValue(-1, 1, error1),
        createPropagationValue(0, 1, error1),
        createPropagationValue(1, 1, error1),

        createPropagationValue(0, 2, error1),
    ];
}
//based on atkinson, but with further reduced bleed
function reducedAtkinson(){
    const error1 = 1 / 16;
    const error2 = error1 * 2;
    
    return [
        createPropagationValue(1, 0, error2),
        createPropagationValue(2, 0, error1),

        createPropagationValue(0, 1, error2),
        createPropagationValue(1, 1, error1),
    ];
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