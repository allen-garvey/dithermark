function PropagationValue(xOffset, yOffset, errorFraction){
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.errorFraction = errorFraction;
}

function floydSteinberg(){
    const error1 = 1 / 16;
    const error7 = error1 * 7;
    const error5 = error1 * 5;
    const error3 = error1 * 3;

    return [
        new PropagationValue(1, 0, error7),
        new PropagationValue(1, 1, error1),
        new PropagationValue(0, 1, error5),
        new PropagationValue(-1, 1, error3),
    ];
}

function javisJudiceNinke(){
    const error1 = 1 / 48;
    const error7 = error1 * 7;
    const error5 = error1 * 5;
    const error3 = error1 * 3;

    return [
        new PropagationValue(1, 0, error7),
        new PropagationValue(2, 0, error5),

        new PropagationValue(-2, 1, error3),
        new PropagationValue(-1, 1, error5),
        new PropagationValue(0, 1, error7),
        new PropagationValue(1, 1, error5),
        new PropagationValue(2, 1, error3),

        new PropagationValue(-2, 2, error1),
        new PropagationValue(-1, 2, error3),
        new PropagationValue(0, 2, error5),
        new PropagationValue(1, 2, error3),
        new PropagationValue(2, 2, error1),
    ];
}

function stucki(){
    const error1 = 1 / 42;
    const error8 = error1 * 8;
    const error4 = error1 * 4;
    const error2 = error1 * 2;

    return [
        new PropagationValue(1, 0, error8),
        new PropagationValue(2, 0, error4),

        new PropagationValue(-2, 1, error2),
        new PropagationValue(-1, 1, error4),
        new PropagationValue(0, 1, error8),
        new PropagationValue(1, 1, error4),
        new PropagationValue(2, 1, error2),

        new PropagationValue(-2, 2, error1),
        new PropagationValue(-1, 2, error2),
        new PropagationValue(0, 2, error4),
        new PropagationValue(1, 2, error2),
        new PropagationValue(2, 2, error1),
    ];
}

function burkes(){
    const errorPart = 1 / 32;
    const error8 = errorPart * 8;
    const error4 = errorPart * 4;
    const error2 = errorPart * 2;

    return [
        new PropagationValue(1, 0, error8),
        new PropagationValue(2, 0, error4),

        new PropagationValue(-2, 1, error2),
        new PropagationValue(-1, 1, error4),
        new PropagationValue(0, 1, error8),
        new PropagationValue(1, 1, error4),
        new PropagationValue(2, 1, error2),
    ];
}

function sierra3(){
    const error1 = 1 / 32;
    
    const error5 = error1 * 5;
    const error4 = error1 * 4;
    const error3 = error1 * 3;
    const error2 = error1 * 2;

    return [
        new PropagationValue(1, 0, error5),
        new PropagationValue(2, 0, error3),

        new PropagationValue(-2, 1, error2),
        new PropagationValue(-1, 1, error4),
        new PropagationValue(0, 1, error5),
        new PropagationValue(1, 1, error4),
        new PropagationValue(2, 1, error2),

        new PropagationValue(-1, 2, error2),
        new PropagationValue(0, 2, error3),
        new PropagationValue(1, 2, error2),
    ];
}

function sierra2(){
    const error1 = 1 / 16;
    const error4 = error1 * 4;
    const error3 = error1 * 3;
    const error2 = error1 * 2;

    return [
        new PropagationValue(1, 0, error4),
        new PropagationValue(2, 0, error3),

        new PropagationValue(-2, 1, error1),
        new PropagationValue(-1, 1, error2),
        new PropagationValue(0, 1, error3),
        new PropagationValue(1, 1, error2),
        new PropagationValue(2, 1, error1),
    ];
}

function sierra1(){
    const error1 = 1 / 4;
    const error2 = error1 * 2;

    return [
        new PropagationValue(1, 0, error2),
        new PropagationValue(-1, 1, error1),
        new PropagationValue(0, 1, error1),
    ];
}

function atkinson(){
    const error1 = 1 / 8;

    return [
        new PropagationValue(1, 0, error1),
        new PropagationValue(2, 0, error1),

        new PropagationValue(-1, 1, error1),
        new PropagationValue(0, 1, error1),
        new PropagationValue(1, 1, error1),

        new PropagationValue(0, 2, error1),
    ];
}
//based on atkinson, but with further reduced bleed
function reducedAtkinson(){
    const error1 = 1 / 16;
    const error2 = error1 * 2;
    
    return [
        new PropagationValue(1, 0, error2),
        new PropagationValue(2, 0, error1),

        new PropagationValue(0, 1, error2),
        new PropagationValue(1, 1, error1),
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