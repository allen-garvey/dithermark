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
        },
    });
    
    
})(window.Vue, window.VueColor.VueColor);