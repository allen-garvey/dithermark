<template>
    <div :class="$style.alertsContainer">
        <div 
            class="alert danger"
            :class="$style.alert" 
            v-if="showOpenImageErrorMessage && openImageErrorMessage" 
            role="alert"
        >
            <div :class="$style.closeButtonContainer">
                <button @click="showOpenImageErrorMessage=false" :class="$style.closeButton">×</button>
            </div>
            <template v-if="typeof openImageErrorMessage === 'object'">
                {{openImageErrorMessage.beforeUrl}} <a :href="openImageErrorMessage.url" target="_blank" rel="noopener noreferrer">{{openImageErrorMessage.url}}</a> {{openImageErrorMessage.afterUrl}}
            </template>
            <template v-else>
                {{openImageErrorMessage}}
            </template>
        </div>
        <div 
            class="alert warning" 
            :class="$style.alert"
            v-if="showWebglWarningMessage && webglWarningMessage" role="alert"
        >
            <div :class="$style.closeButtonContainer">
                <button @click="showWebglWarningMessage=false" :class="$style.closeButton">×</button>
            </div>
            {{webglWarningMessage}}
        </div>
    </div>
</template>

<style lang="scss" module>
// alerts based on bootstrap alerts

.alertsContainer{
    max-width: 100vw;
    position: -webkit-sticky;
    position: sticky;
    //so displayed above unsplash attribution
    z-index: 1;
    left: 0;
    //so position sticky works
    display: inline-block;
    word-break: break-word;
}

@include mixins.pinned_controls_mq{
    .alertsContainer{
        top: 0;
        max-width: calc(100vw - #{variables.$pinned_dither_controls_width});
    }
}

.alert{
    display: inline-block;
    padding: 0.75em 1.25em;
}

.closeButtonContainer {
    display: flex;
    justify-content: flex-end;
}

.closeButton{
    background: transparent;
    border: none;
    color: inherit;
    font-size: 1.5rem;
    
    &:hover {
        cursor: pointer;
        font-weight: bold;
    }
}
</style>

<script>
export default {
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

