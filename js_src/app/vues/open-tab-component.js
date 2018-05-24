
(function(Vue, Constants, Canvas, Fs, RandomImage){

    let fileInput;

    Vue.component('open-tab', {
        template: document.getElementById('open-tab-component'),
        props: ['imageOpened', 'openImageError', 'requestModal'],
        data: function(){
            return {
                isCurrentlyLoadingImageUrl: false,
            };
        },
        methods: {
            openDeviceImage: function(){
                if(!fileInput){
                    fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    
                    fileInput.addEventListener('change', (e)=>{
                        Fs.openImageFile(e, this.imageOpened, this.openImageError);
                        fileInput.value = null;
                    }, false);
                }
                fileInput.click();
            },
            openImageFromUrlFailed: function(error, imageUrl){
                this.openImageError(Fs.messageForOpenImageUrlError(error, imageUrl));
                this.isCurrentlyLoadingImageUrl = false;
            },
            showOpenImageUrlPrompt: function(){
                this.requestModal('Image Url', '', this.openImageUrl, {okButtonValue: 'Open', inputType: 'url', placeholder: 'http://example.com/image.jpg'});
            },
            openImageUrl: function(imageUrl){
                if(!imageUrl){
                    return;
                }
                this.isCurrentlyLoadingImageUrl = true;
                Fs.openImageUrl(imageUrl).then(({image, file})=>{
                    this.imageOpened(image, file);
                    this.isCurrentlyLoadingImageUrl = false;
                }).catch((error)=>{
                    this.openImageFromUrlFailed(error, imageUrl);
                });
            },
            openRandomImage: function(){
                this.isCurrentlyLoadingImageUrl = true;
                
                RandomImage.get(window.innerWidth, window.innerHeight).then(({image, file})=>{
                    this.imageOpened(image, file);
                    this.isCurrentlyLoadingImageUrl = false;
                }).catch(this.openImageFromUrlFailed);
            },
        },
    });
    
})(window.Vue, App.Constants, App.Canvas, App.Fs, App.RandomImage);