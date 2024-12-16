<template>
    <modal
        v-if="showModal"
        :cancelAction="cancelAction"
        :okAction="onOk"
        okButtonText="Export video"
        :isOkButtonDisabled="!isSubmitEnabled"
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
                {{ fileExtension }}
            </label>
            <label>FPS
                <input  
                    tabindex="2" 
                    type="number" 
                    min="1"
                    v-model.number="fps"
                />
            </label>
            <input 
                tabindex="3"
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
        canSubmit: {
            type: Boolean,
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
            fileExtension: '.mp4',
            fps: 24,
            files: null,
            showModal: false,
        };
    },
    computed: {
        isSubmitEnabled(){
            return this.canSubmit && this.files?.length > 0 && this.filename && this.fps >= 1;
        },
    },
    methods: {
        show(){
            this.showModal = true;
        },
        cancelAction(){
            this.files = null;
            this.showModal = false;
        },
        onOk(){
            this.showModal = false;
            this.onSubmit(this.files, {
                fps: this.fps,
                filename: this.filename + this.fileExtension,
            });
            this.files = null;
        },
        onBatchFileInputChange($event){
            const fileInput = $event.target;
            this.files = Array.from(fileInput.files).filter(file => isImageFile(file));
        },
    }
};
</script>