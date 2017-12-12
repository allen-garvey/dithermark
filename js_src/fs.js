var App = App || {};

App.Fs = (function(){
    
    function openImageFile(e, imageLoadFunc) {
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
            
            imageLoadFunc(file, image);
        };
        image.src = window.URL.createObjectURL(file);
    }
    
    return {
        openImageFile: openImageFile
    };
})();