import FocusDirective from './focus-directive.js';


export default{
    name: 'modal-prompt', 
    template: document.getElementById('modal-prompt-component'),
    directives: {
        'focus': FocusDirective,
    },
    data(){
        return {
            labelValue: '',
            inputValue: '',
            placeholder: '',
            okButtonValue: '',
            showModal: false,
            inputType: 'text',
            okCallback: null,
        };
    },
    methods: {
        setupOptions(options){
            this.okButtonValue = options.okButtonValue || 'Ok';
            this.inputType = options.inputType || 'text';
            this.placeholder = options.placeholder || '';
        },
        show(labelValue, inputValue, okCallback, options={}){
            this.inputValue = inputValue;
            this.labelValue = labelValue;
            this.okCallback = okCallback;
            this.setupOptions(options);
            this.showModal = true;
        },
        cancelAction(){
            this.showModal = false;
        },
        okAction(){
            //ok disabled if there is no value
            if(!this.inputValue){
                return;
            }
            if(this.okCallback){
                this.okCallback(this.inputValue);
            }
            this.showModal = false;
        },
    }
};