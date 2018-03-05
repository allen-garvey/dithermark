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
    
    function openRandomImage(imageLoadFunc){
        let fetch = window.fetch;
        
        let image = new Image();
        image.onload = ()=> {
            imageLoadFunc(image, {});
        };
        
        let imageWidth = Math.min(window.innerWidth, <?= RANDOM_IMAGE_MAX_WIDTH; ?>);
        let imageHeight = Math.min(window.innerHeight, <?= RANDOM_IMAGE_MAX_HEIGHT; ?>);
        let randomImageUrl = `https://source.unsplash.com/random/${imageWidth}x${imageHeight}`;
        
        //based on: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
        fetch(randomImageUrl).then((res)=>{ return res.blob(); }).then((imageBlob)=>{
            image.src = URL.createObjectURL(imageBlob);
        });
    }
    
    return {
        openImageFile: openImageFile,
        openRandomImage: openRandomImage,
    };
    
})();