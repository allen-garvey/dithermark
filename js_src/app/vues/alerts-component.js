(function(Vue){
    Vue.component('alerts', {
        template: document.getElementById('alerts-component'),
        props: ['is-webgl-enabled', 'loaded-image'],
        data: function(){
            return {
                showOpenImageErrorMessage: false,
                openImageErrorMessage: null,
                showWebglWarningMessage: false,
                webglMaxTextureSize: 0,
            };
        },
        computed: {
            isImageLoaded: function(){
                return this.loadedImage != null;
            },
            webglWarningMessage: function(){
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
            loadedImage: function(){
                //everytime loadedImageChanges, reset webgl alert
                this.showWebglWarningMessage = true;
                //hide open image error message, since if image is opened,
                //there must not have been an error
                this.showOpenImageErrorMessage = false;
            },
            openImageErrorMessage: function(){
                this.showOpenImageErrorMessage = true;
            },
        },
    });
})(window.Vue);