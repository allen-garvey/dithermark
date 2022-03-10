<template>
    <div v-if="showModal" @keyup.esc="cancelAction" class="modal-layout-container">
        <div class="modal-overlay" @click="cancelAction"></div>
        <div class="modal-container">
            <label>{{labelValue}}
                <!-- //trigger needs to be keydown and not keyup, since otherwise it will be triggered if modal is opened via enter key on button -->
                <input ref="input" v-focus class="modal-input" tabindex="1" :type="inputType" :placeholder="placeholder" v-model="inputValue" @keydown.enter="okAction" />
            </label>
            <div class="modal-buttons-container">
                <button class="btn btn-default" tabindex="2" @click="cancelAction">Cancel</button>
                <button class="btn btn-primary" tabindex="3" @click="okAction" :disabled="!inputValue">{{okButtonValue}}</button>
            </div>
        </div>
    </div>
</template>

<script>
import FocusDirective from './directives/focus.js';


export default {
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
</script>