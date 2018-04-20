App.Fs = (function(Constants){
    const imageElement = new Image();

    function openImageFile(e, imageLoadFunc) {
        const files = e.target.files;
        if(files.length < 1){
            return;
        }
        const file = files[0];
        if(!file.type.startsWith('image/')){
            return;
        }
        
        imageElement.onload = ()=> {
            imageLoadFunc(imageElement, file);
        };
        imageElement.src = URL.createObjectURL(file);
    }
    
    function openImageUrl(imageUrl, imageLoadFunc, imageName=null){
        //get image name from url if not specified
        if(!imageName){
            const urlSplit = imageUrl.split('/');
            imageName = urlSplit[urlSplit.length - 1];
        }
        //based on: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
        return fetch(imageUrl).then((res)=>{ 
            //error in response code will not throw error
            if(!res.ok){
                throw Error(JSON.stringify({
                    status: res.status,
                    statusText: res.statusText,
                    url: res.url,
                }));
            }
            return res.blob(); 
        }).then((imageBlob)=>{
            imageElement.onload = ()=> {
                imageLoadFunc(imageElement, {
                    name: imageName,
                    type: imageBlob.type,
                });
            };
            imageElement.src = URL.createObjectURL(imageBlob);
        });
    }
    
    function saveImage(canvas, fileType, callback){
        //edge and mobile safari don't support toBlob
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
        openImageFile,
        openImageUrl,
        saveImage,
    };
    
})(App.Constants);