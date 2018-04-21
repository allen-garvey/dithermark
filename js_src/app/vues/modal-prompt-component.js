(function(Vue){
    Vue.component('modal-prompt', {
        template: document.getElementById('modal-prompt-component'),
        data: function(){
            return {
                labelValue: '',
                inputValue: '',
                okButtonValue: '',
                showModal: false,
                inputType: 'text',
                okCallback: null,
            };
        },
        methods: {
            setupOptions: function(options){
                this.okButtonValue = options.okButtonValue || 'Ok';
                this.inputType = options.inputType || 'text';
            },
            show: function(labelValue, inputValue, okCallback, options={}){
                this.inputValue = inputValue;
                this.labelValue = labelValue;
                this.okCallback = okCallback;
                this.setupOptions(options);
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