//used to fulfill guidelines from:
//https://medium.com/unsplash/unsplash-api-guidelines-attribution-4d433941d777

import Constants from '../../generated_output/app/constants.js';


export default{
    name: 'unsplash-attribution',
    template: document.getElementById('unsplash-attribution-component'),
    props: ['unsplashInfo'],
    computed: {
        unsplashQueryParam(){
            return `?utm_source=${Constants.unsplashReferralAppName}&utm_medium=referral`;
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