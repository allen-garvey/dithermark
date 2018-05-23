(function(Vue, VueColor){
    Vue.component('color-picker', {
        template: document.getElementById('color-picker-component'),
        props: ['selectedColor'],
        components: {
            'photoshop-picker': VueColor.Photoshop,
        },
        methods: {
            bubbleEvent: function(e){
                console.log(e);
            },
        },
    });
    
    
})(window.Vue, window.VueColor);