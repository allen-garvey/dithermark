App.ErrorPropModel = (function(){
    function PropagationValue(xOffset, yOffset, errorFraction){
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.errorFraction = errorFraction;
    }


    function garvey(){
        const errorPart = 1 / 16;
        const error2 = errorPart * 2;
        
        return [
            new PropagationValue(1, 0, error2),
            new PropagationValue(2, 0, errorPart),

            new PropagationValue(-1, 1, errorPart),
            new PropagationValue(0, 1, error2),
            new PropagationValue(1, 1, errorPart),

            new PropagationValue(0, 2, errorPart),
        ];
    }

    function floydSteinberg(){
        const errorPart = 1 / 16;
        const error7 = errorPart * 7;
        const error5 = errorPart * 5;
        const error3 = errorPart * 3;

        return [
            new PropagationValue(1, 0, error7),
            new PropagationValue(1, 1, errorPart),
            new PropagationValue(0, 1, error5),
            new PropagationValue(-1, 1, error3),
        ];
    }

    return {
        garvey,
        floydSteinberg,
    };

})();