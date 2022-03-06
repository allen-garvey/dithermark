<template>
    <div class="controls-tab-container">
        <fieldset>
            <legend>Device</legend>
            <button 
                class="btn btn-primary" 
                @click="openDeviceImage" 
                title="Open local image file"
            >
                Image file
            </button>
            <input 
                type="file"
                @change.prevent="onFileInputChange($event)"
                ref="fileInput" 
                v-show="false" 
            />
        </fieldset>
        <fieldset>
            <legend>Web</legend>
            <button 
                class="btn btn-default" 
                @click="showOpenImageUrlPrompt" 
                :disabled="isCurrentlyLoadingImageUrl" 
                title="Open image from Url"
            >
                Image url
            </button>
            <button 
                class="btn btn-default" 
                @click="openRandomImage" 
                :disabled="isCurrentlyLoadingImageUrl" 
                title="Open random image from Unsplash"
            >
                Random image
            </button>
        </fieldset>    
    </div>
</template>

<script>
import Fs from '../fs.js';
import RandomImage from '../random-image.js';

export default { 
    name: 'open-tab',
    props: {
        imageOpened: {
            type: Function,
            required: true,
        },
        openImageError: {
            type: Function,
            required: true,
        },
        requestModal: {
            type: Function,
            required: true,
        },
    },
    data(){
        return {
            isCurrentlyLoadingImageUrl: false,
        };
    },
    methods: {
        openDeviceImage(){
            this.$refs.fileInput.click();
        },
        onFileInputChange($event){
            const fileInput = $event.target;

            Fs.openImageFile(fileInput.files[0], this.imageOpened, this.openImageError);
            fileInput.value = '';
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
</script>