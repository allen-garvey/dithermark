App.ArrayUtil = (function(){

    function create(length, fillFunc, arrayConstructor=Array){
        const ret = new arrayConstructor(length);

        for(let i=0;i<length;i++){
            ret[i] = fillFunc(i);
        }
        return ret;
    }

    return {
        create,
    };

})();