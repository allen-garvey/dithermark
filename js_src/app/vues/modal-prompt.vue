<template>
    <div v-if="showModal" @keyup.esc="cancelAction" :class="$style.modal">
        <div :class="$style.overlay" @click="cancelAction"></div>
        <div :class="$style.contents">
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
            <div :class="$style.buttonsContainer">
                <button 
                    class="btn btn-default" 
                    tabindex="2" 
                    @click="cancelAction"
                >
                    Cancel
                </button>
                <button 
                    class="btn btn-primary" 
                    :class="$style.okButton"
                    tabindex="3" 
                    @click="okAction" 
                    :disabled="!inputValue"
                >
                    {{okButtonValue}}
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" module>
.overlay, .modal{
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
}

.overlay{
    background-color: black;
    opacity: 0.7;
    z-index: 999;
}

.modal{
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
}

.contents{
    position: relative;
    z-index: 1000;
    background-color: var(--main-bg-color);
    border: 1px solid var(--border-color);
    box-sizing: border-box;
    max-height: 100vh;
    max-width: 100vw;
    padding: 3.5em 3em;
    border-radius: 4px;

    display: flex;
    flex-direction: column;
    align-items: center;
}

.buttonsContainer{
    margin-top: 1.5em;
}

.input {
    margin-left: 0.5rem;
    width: 20em;
    max-width: 100%;
}

.okButton {
    margin-left: 0.5rem;
}
</style>

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