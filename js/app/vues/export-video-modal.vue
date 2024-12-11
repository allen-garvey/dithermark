<template>
    <modal
        :showModal="showModal"
        :cancelAction="cancelAction"
        :okAction="okAction"
        :okButtonText="okButtonValue"
        :isOkButtonDisabled="!inputValue"
        :tabIndexOffset="3"
    >
        <label>File name
            <input  
                v-focus
                tabindex="1" 
                type="text" 
                placeholder="video" 
                v-model="filename"
            />
            .mp4
        </label>
        
    </modal>
</template>

<style lang="scss" module>
    
</style>

<script>
import FocusDirective from './directives/focus.js';
import Modal from './modal.vue';

export default {
    props: {
        cancel: {
            type: Function,
            required: true,
        },
        
    },
    directives: {
        focus: FocusDirective,
    },
    components: {
        Modal,
    },
    created(){
    },
    data(){
        return {
        };
    },
    computed: {
    },
    methods: {
    }
};
</script>