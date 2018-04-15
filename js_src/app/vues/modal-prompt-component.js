(function(Vue){
    Vue.component('modal-prompt', {
        template: document.getElementById('modal-prompt-component'),
        data: function(){
            return {
                paletteName: '',
                showModal: false,
            };
        },
        methods: {
            show: function(paletteName){
                console.log('show called');
                this.paletteName = paletteName;
                this.showModal = true;
            },
            cancelAction: function(){
                this.showModal = false;
            },
            okAction: function(){
                this.$emit('modal-success', this.paletteName);
                this.showModal = false;
            },
        }
    });
    
    
})(window.Vue);