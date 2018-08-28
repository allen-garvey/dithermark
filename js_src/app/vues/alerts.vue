<template>
    <div class="alerts-container">
        <div class="alert alert-danger" v-if="showOpenImageErrorMessage && openImageErrorMessage">
            <div @click="showOpenImageErrorMessage=false" class="alert-close-button"></div>
            <template v-if="typeof openImageErrorMessage === 'object'">
                {{openImageErrorMessage.beforeUrl}} <a :href="openImageErrorMessage.url" class="alert-link">{{openImageErrorMessage.url}}</a> {{openImageErrorMessage.afterUrl}}
            </template>
            <template v-else>
                {{openImageErrorMessage}}
            </template>
        </div>
        <div class="alert alert-warning" v-if="showWebglWarningMessage && webglWarningMessage">
            <div @click="showWebglWarningMessage=false" class="alert-close-button"></div>
            {{webglWarningMessage}}
        </div>
    </div>
</template>

<script>
export default {
    name: 'alerts',
    props: {
        isWebglEnabled: {
            type: Boolean,
            required: true,
        },
        loadedImage: {
            // type: Object, //object or null
            required: true,
        }
    },
    data(){
        return {
            showOpenImageErrorMessage: false,
            openImageErrorMessage: null,
            showWebglWarningMessage: false,
            webglMaxTextureSize: 0,
        };
    },
    computed: {
        isImageLoaded(){
            return this.loadedImage != null;
        },
        webglWarningMessage(){
            //based on: https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
            //for integers only
            function formatInteger(d){
                return d.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
            //I have no idea what units MAX_TEXTURE_SIZE is in, and no resource seems to explain this,
            //but multiplying it by 1024 seems to get the maximum image dimensions webgl will dither 
            const maxTextureDimensions = this.webglMaxTextureSize * 1024;
            if(this.isImageLoaded && this.isWebglEnabled && this.loadedImage.height*this.loadedImage.width > maxTextureDimensions){
                return `It appears that the image you just opened has larger total dimensions than your max WebGL texture size of ${formatInteger(maxTextureDimensions)} pixels. It is recommended you either: disable WebGL in settings (this will decrease performance), pixelate the image, or crop or resize the image in the image editor of you choice and reopen it.`;
            }
            return false;
        },
    },
    watch: {
        loadedImage(){
            //everytime loadedImageChanges, reset webgl alert
            this.showWebglWarningMessage = true;
            //hide open image error message, since if image is opened,
            //there must not have been an error
            this.showOpenImageErrorMessage = false;
        },
        openImageErrorMessage(){
            this.showOpenImageErrorMessage = true;
        },
    },
};
</script>

