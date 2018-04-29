App.ArrayUtil = (function(){

    function create(length, fillFunc){
        const ret = new Array(length);

        for(let i=0;i<length;i++){
            ret[i] = fillFunc(i);
        }
        return ret;
    }

    return {
        create,
    };

})();