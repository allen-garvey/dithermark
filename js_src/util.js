var App = App || {};

App.Util = (function(){
    
    function timeInMilliseconds(){
        var d = new Date();
        return d.getTime();
    }
    
    function timeFunction(name, functionToTime){
        var start = timeInMilliseconds();
        functionToTime();
        var end = timeInMilliseconds();
        var seconds = (end - start) / 1000;
        console.log(name + 'took ' + seconds);
    }
    
    function openFile(e, imageLoadFunc) {
        var files = e.target.files;
        if(files.length < 1){
            return;
        }
        var file = files[0];
        if(!file.type.startsWith('image/')){
            return;
        }
        
        var image = new window.Image();
        image.onload = ()=> {
            
            imageLoadFunc(image);
        };
        image.src = window.URL.createObjectURL(file);
    }
    
    return {
        timeFunction: timeFunction,
        openFile: openFile
    };
})();