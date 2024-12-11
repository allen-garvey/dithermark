<template>
    <modal
        v-if="showModal"
        :cancelAction="cancelAction"
        :okAction="onOk"
        okButtonText="Export video"
        :isOkButtonDisabled="isOkAllowed"
        :tabIndexOffset="3"
    >
        <div :class="$style.container">
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
            <label>FPS
                <input  
                    tabindex="2" 
                    type="number" 
                    min="1"
                    v-model="fps"
                />
            </label>
            <input 
                type="file"
                @change="onBatchFileInputChange($event)"
                ref="batchFileInput" 
                multiple
            />
        </div>
    </modal>
</template>

<style lang="scss" module>
    .container {
        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        gap: 1em;
    }
    
</style>

<script>
import { isImageFile } from '../fs.js';
import FocusDirective from './directives/focus.js';
import Modal from './modal.vue';

export default {
    props: {
        onSubmit: {
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
            filename: 'video',
            fps: 24,
            files: null,
            showModal: false,
        };
    },
    computed: {
        isOkAllowed(){
            return true;
        },
    },
    methods: {
        show(){
            this.showModal = true;
        },
        cancelAction(){
            this.showModal = false;
            this.$refs.batchFileInput.value = '';
        },
        onOk(){
            this.showModal = false;
            this.onSubmit();
        },
        onBatchFileInputChange($event){
            const fileInput = $event.target;
            const files = Array.from(fileInput.files).filter(file => isImageFile(file));
            if(files.length === 0){
                return this.openImageError('No image files selected');
            }
            console.log(files);
            this.files = files;
        },
    }
};
</script>