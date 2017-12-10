var App = App || {};

App.Timer = (function(){
    
    function timeInMilliseconds(){
        var d = new Date();
        return d.getTime();
    }
    
    function timeFunction(name, functionToTime){
        var start = timeInMilliseconds();
        functionToTime();
        var end = timeInMilliseconds();
        var seconds = (end - start) / 1000;
        console.log(name + ' took ' + seconds);
    }
    
    return {
        timeFunction: timeFunction
    };
})();