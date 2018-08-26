import Fs from '../fs.js';
import RandomImage from '../random-image.js';


let fileInput;

export default { 
    name: 'open-tab',
    template: document.getElementById('open-tab-component'),
    props: ['imageOpened', 'openImageError', 'requestModal'],
    data(){
        return {
            isCurrentlyLoadingImageUrl: false,
        };
    },
    methods: {
        openDeviceImage(){
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
        openImageFromUrlFailed(error, imageUrl){
            this.openImageError(Fs.messageForOpenImageUrlError(error, imageUrl));
            this.isCurrentlyLoadingImageUrl = false;
        },
        showOpenImageUrlPrompt(){
            this.requestModal('Image Url', '', this.openImageUrl, {okButtonValue: 'Open', inputType: 'url', placeholder: 'http://example.com/image.jpg'});
        },
        openImageUrl(imageUrl){
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
        openRandomImage(){
            this.isCurrentlyLoadingImageUrl = true;
            
            RandomImage.get(window.innerWidth, window.innerHeight).then(({image, file})=>{
                this.imageOpened(image, file);
                this.isCurrentlyLoadingImageUrl = false;
            }).catch(this.openImageFromUrlFailed);
        },
    },
};