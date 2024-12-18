<template>
    <banner-messages 
        :messages="warningMessages"
        type="warning"
    />
</template>

<style lang="scss" module>
</style>

<script>
import BannerMessages from './banner-messages.vue';

export default {
    props: {
        automaticallyResizeLargeImages: {
            type: Boolean,
            required: true,
        },
        isPixelatedActualSize: {
            type: Boolean,
            required: true,
        },
    },
    components: {
        BannerMessages
    },
    computed: {
        warningMessages(){
            const messages = [];

            if(this.automaticallyResizeLargeImages){
                messages.push(`'Shrink large images' is checked in the settings tab. This will reduce the output video resolution.`);
            }

            if(this.isPixelatedActualSize){
                messages.push(`'Actual size' is selected in the export tab. This will reduce the output video resolution.`);
            }

            return messages;
        },
    },
};
</script>