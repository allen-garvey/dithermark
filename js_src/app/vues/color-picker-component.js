(function(Vue, VueColor){
    Vue.component('color-picker', {
        template: document.getElementById('color-picker-component'),
        props: ['selectedColor'],
        components: {
            'photoshop-picker': VueColor.Photoshop,
        },
        methods: {
            bubbleEvent: function(name, args){
                this.$emit(name, args);
            },
            getAttention: function(){
                const container = this.$refs.colorPickerContainer;
                container.scrollIntoView({behavior: 'smooth'})
                container.classList.remove('attention-animation');
                //from https://css-tricks.com/restart-css-animation/
                //we need to do this to retrigger the animation
                void container.offsetWidth;
                container.classList.add('attention-animation');
            },

        },
    });
    
    
})(window.Vue, window.VueColor.VueColor);