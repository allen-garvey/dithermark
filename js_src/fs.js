var App = App || {};

App.Fs = (function(){
    
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
        openFile: openFile
    };
})();