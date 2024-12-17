<template>
    <modal
        v-if="showModal"
        title="Open image from url"
        :cancelAction="cancelAction"
        :okAction="okAction"
        :okButtonText="okButtonValue"
        :isOkButtonDisabled="!inputValue"
        :tabIndexOffset="1"
    >
        <label>{{labelValue}}
            <!-- //trigger needs to be keydown and not keyup, since otherwise it will be triggered if modal is opened via enter key on button -->
            <input  
                v-focus
                tabindex="1" 
                :type="inputType" 
                :placeholder="placeholder" 
                v-model="inputValue"
                @keydown.enter="okAction"
                :class="$style.input" 
            />
        </label>
    </modal>
</template>

<style lang="scss" module>
.input {
    margin-left: 0.5rem;
    width: 20em;
    max-width: 100%;
}
</style>

<script>
import FocusDirective from './directives/focus.js';
import Modal from './modal.vue';

export default {
    directives: {
        focus: FocusDirective,
    },
    components: {
        Modal,
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