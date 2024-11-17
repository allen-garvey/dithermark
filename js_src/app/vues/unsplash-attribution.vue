<template>
    <div :class="$style.unsplashAttribution">
        <p>
            <a :href="photoUrl" target="_blank" rel="noopener noreferrer">Photo</a> by <a :href="authorUrl" target="_blank" rel="noopener noreferrer">{{authorName}}</a> on <a :href="unsplashUrl" target="_blank" rel="noopener noreferrer">Unsplash</a>
        </p>
    </div>
</template>

<style lang="scss" module>

.unsplashAttribution{
    position: -webkit-sticky;
    position: sticky;
    left: variables.$global_horizontal_padding;
    //so position sticky works
    display: inline-block;
}

</style>

<script>
//used to fulfill guidelines from:
//https://medium.com/unsplash/unsplash-api-guidelines-attribution-4d433941d777

import { UNSPLASH_REFERRAL_APP_NAME } from '../../../constants.js';

export default {
    props: {
        unsplashInfo: {
            type: Object,
            required: true,
        },
    },
    computed: {
        unsplashQueryParam(){
            return `?utm_source=${UNSPLASH_REFERRAL_APP_NAME}&utm_medium=referral`;
        },
        authorName(){
            return this.unsplashInfo.author.name;
        },
        authorUrl(){
            return this.unsplashInfo.author.link + this.unsplashQueryParam;
        },
        photoUrl(){
            return this.unsplashInfo.link + this.unsplashQueryParam;
        },
        unsplashUrl(){
            return `https://unsplash.com/${this.unsplashQueryParam}`;
        },
    }
};
</script>