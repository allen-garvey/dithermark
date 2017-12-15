var App = App || {};

App.Fs = (function(){
    var URL = window.URL;
    var Image = window.Image;
    
    
    function openImageFile(e, imageLoadFunc) {
        var files = e.target.files;
        if(files.length < 1){
            return;
        }
        var file = files[0];
        if(!file.type.startsWith('image/')){
            return;
        }
        
        var image = new Image();
        image.onload = ()=> {
            imageLoadFunc(image, file);
        };
        image.src = URL.createObjectURL(file);
    }
    
    function openRandomImage(url, imageLoadFunc){
        var fetch = window.fetch;
        
        var image = new Image();
        image.onload = ()=> {
            imageLoadFunc(image, {});
        };
        
        //based on: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
        fetch(url).then((res)=>{ return fetch(res.url); }).then((res)=>{ return res.blob(); }).then((imageBlob)=>{
            var objectURL = URL.createObjectURL(imageBlob);
            image.src = objectURL;
        });
    }
    
    return {
        openImageFile: openImageFile,
        openRandomImage: openRandomImage,
    };
    
})();