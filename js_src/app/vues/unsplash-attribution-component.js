//used to fulfill guidelines from:
//https://medium.com/unsplash/unsplash-api-guidelines-attribution-4d433941d777
(function(Vue, Constants){
    Vue.component('unsplash-attribution', {
        template: document.getElementById('unsplash-attribution-component'),
        props: ['unsplashInfo'],
        computed: {
            unsplashQueryParam: function(){
                return `?utm_source=${Constants.appName.toLowerCase()}&utm_medium=referral`;
            },
            authorName: function(){
                return this.unsplashInfo.author.name;
            },
            authorUrl: function(){
                return this.unsplashInfo.author.link + this.unsplashQueryParam;
            },
            photoUrl: function(){
                return this.unsplashInfo.link + this.unsplashQueryParam;
            },
            unsplashUrl: function(){
                return `https://unsplash.com/${this.unsplashQueryParam}`;
            },
        }
    });
    
    
})(window.Vue, App.Constants);