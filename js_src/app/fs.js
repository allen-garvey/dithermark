App.Fs = (function(Constants){
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
        
        let imageWidth = Math.min(window.innerWidth, Constants.randomImageMaxWidth);
        let imageHeight = Math.min(window.innerHeight, Constants.randomImageMaxHeight);
        let randomImageUrl = `https://source.unsplash.com/random/${imageWidth}x${imageHeight}`;
        
        let image = new Image();
        image.onload = ()=> {
            imageLoadFunc(image, {
                name: 'unsplash-random-image.jpg',
                type: 'image/jpeg',
            });
        };
        
        //based on: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
        fetch(randomImageUrl).then((res)=>{ return res.blob(); }).then((imageBlob)=>{
            image.src = URL.createObjectURL(imageBlob);
        });
    }
    
    function saveImage(canvas, fileType, callback){
        if(!canvas.toBlob){
            callback(canvas.toDataURL(fileType));
        }
        else{
            canvas.toBlob((blob)=>{
                callback(URL.createObjectURL(blob));
            }, fileType);
        }
    }
    
    return {
        openImageFile: openImageFile,
        openRandomImage: openRandomImage,
        saveImage: saveImage,
    };
    
})(App.Constants);