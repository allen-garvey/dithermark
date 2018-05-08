App.Fs = (function(Constants){
    const imageElement = new Image();
    //need to store reference so we can free it when a new one is created
    let currentImageObjectUrl = null;

    class HttpRequestError extends Error{
        constructor(message, statusCode, statusMessage, url) {
            super(message);
            this.statusCode = statusCode;
            this.statusMessage = statusMessage;
            this.url = url;
          }
    }

    class UnsupportedFileTypeError extends Error{
        constructor(message, url, fileType) {
            super(message);
            this.url = url;
            this.fileType = fileType;
          }
    }

    function openImageFile(e, imageLoadFunc, errFunc) {
        const files = e.target.files;
        if(files.length < 1){
            return errFunc('No files selected');;
        }
        const file = files[0];
        if(!file.type.startsWith('image/')){
            return errFunc(`${file.name} appears to be of type ${file.type} rather than an image`);
        }
        imageElement.onload = ()=> {
            imageLoadFunc(imageElement, file);
        };
        if(currentImageObjectUrl){
            URL.revokeObjectURL(currentImageObjectUrl);
        }
        currentImageObjectUrl = URL.createObjectURL(file);
        imageElement.src = currentImageObjectUrl;
    }
    
    function openImageUrl(imageUrl){
        const urlSplit = imageUrl.split('/');
        const imageName = urlSplit[urlSplit.length - 1];
        
        //based on: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
        return fetch(imageUrl).then((res)=>{ 
            //error in response code will not throw error
            if(!res.ok){
                throw new HttpRequestError('Problem fetching image url', res.status, res.statusText, res.url);
            }
            return res.blob(); 
        }).then((blob)=>{
            if(!blob.type.startsWith('image')){
                throw new UnsupportedFileTypeError('File does not appear to be an image', imageUrl, blob.type);
            }
            const promise = new Promise((resolve, reject)=>{
                imageElement.onload = ()=>{
                    resolve({
                        image: imageElement,
                        file: {
                            name: imageName,
                            type: blob.type,
                        },
                    });
                };
            });
            if(currentImageObjectUrl){
                URL.revokeObjectURL(currentImageObjectUrl);
            }
            currentImageObjectUrl = URL.createObjectURL(blob);
            imageElement.src = currentImageObjectUrl;
            
            return promise;
        });
    }
    //so that urls are escaped properly, message is divided into beforeUrl, url and afterUrl parts
    //assembled message will read:
    //{{message.beforeUrl}} <a :href="message.url">{{message.url}}</a> {{message.afterUrl}}
    function messageForOpenImageUrlError(error, imageUrl){
        let url = imageUrl;
        let beforeUrl = 'Could not open';
        let afterUrl = 'It is recommended you first download the image to your device, and then open it from there.';
        //error from fetch, most likely due to CORS
        if(error instanceof TypeError){
            afterUrl = `This is mostly likely due to CORS. ${afterUrl}`;
        }
        else if(error instanceof UnsupportedFileTypeError){
            url = error.url;
            afterUrl = `It appears to be a ${error.fileType} file rather than an image.`;
        }
        else if(error instanceof HttpRequestError){
            url = error.url;
            if(error.statusCode === 404){
                beforeUrl = '';
                afterUrl = 'was not found';
            }
            else if(error.statusCode >= 500){
                afterUrl = 'due to server error.';
            }
            else if(error.statusCode >= 400){
                afterUrl = `This is most likely due to lacking proper authentication. ${afterUrl}`;
            }
        }

        return {
            beforeUrl,
            url,
            afterUrl,
        };
    }
    
    function saveImage(canvas, fileType, callback){
        //edge and mobile safari don't support toBlob
        if(!canvas.toBlob){
            callback(canvas.toDataURL(fileType));
        }
        else{
            canvas.toBlob((blob)=>{
                let objectUrl = URL.createObjectURL(blob); 
                callback(objectUrl);
                URL.revokeObjectURL(objectUrl);
            }, fileType);
        }
    }
    
    return {
        openImageFile,
        openImageUrl,
        saveImage,
        messageForOpenImageUrlError,
    };
    
})(App.Constants);