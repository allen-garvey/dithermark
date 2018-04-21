(function(Vue){
    Vue.component('modal-prompt', {
        template: document.getElementById('modal-prompt-component'),
        data: function(){
            return {
                labelValue: '',
                inputValue: '',
                placeholder: '',
                okButtonValue: '',
                showModal: false,
                inputFocused: false,
                inputType: 'text',
                okCallback: null,
            };
        },
        updated: function(){
            //unfortunately have to do this here, or focus will not work, because in the show method,
            //the modal is still hidden
            if(this.showModal && !this.inputFocused){
                this.inputFocused = true;
                this.$refs.input.focus();
            }
        },
        methods: {
            setupOptions: function(options){
                this.okButtonValue = options.okButtonValue || 'Ok';
                this.inputType = options.inputType || 'text';
                this.placeholder = options.placeholder || '';
            },
            show: function(labelValue, inputValue, okCallback, options={}){
                this.inputValue = inputValue;
                this.labelValue = labelValue;
                this.okCallback = okCallback;
                this.setupOptions(options);
                this.inputFocused = false;
                this.showModal = true;
            },
            cancelAction: function(){
                this.showModal = false;
            },
            okAction: function(){
                if(this.okCallback){
                    this.okCallback(this.inputValue);
                }
                this.showModal = false;
            },
        }
    });
    
    
})(window.Vue);