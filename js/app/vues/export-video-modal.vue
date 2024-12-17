<template>
    <modal
        v-if="showModal"
        :cancelAction="cancelAction"
        :okAction="onOk"
        okButtonText="Export video"
        :isOkButtonDisabled="!isSubmitEnabled"
        :tabIndexOffset="4"
    >
        <div :class="$style.container">
            <label>File name
                <input  
                    v-focus
                    tabindex="1" 
                    type="text" 
                    placeholder="video" 
                    v-model="filename"
                    :class="{[$style.invalid]: hasFilenameError}"
                />
                {{ fileExtension }}
            </label>
            <label>Frames per second
                <input  
                    tabindex="2" 
                    type="number" 
                    min="1"
                    v-model.number="fps"
                    :class="{[$style.invalid]: hasFpsError}"
                />
            </label>
            <input 
                type="file"
                @change="onBatchFileInputChange($event)"
                ref="batchFileInput" 
                multiple
                v-show="false"
            />
            <div :class="$style.fileInputContainer">
                <button 
                    tabindex="3"
                    class="btn btn-default" 
                    @click="openDeviceImages"
                    title="Select image files to convert to video"
                >
                    Add image files
                </button>
                <span>{{ imagesSelectedText }}</span>
            </div>
        </div>
        <div :class="$style.alertsContainer">
            <div 
                v-if="errorMessages.length > 0" 
                class="alert danger" 
                role="alert"
            >
                <ul :class="$style.alertList">
                    <li v-for="errorMessage in errorMessages">
                        {{ errorMessage }}
                    </li>
                </ul>
            </div>
        </div>
        <div :class="$style.hint">
            For more information on how to convert video to images, <a href="https://www.bannerbear.com/blog/how-to-extract-images-from-a-video-using-ffmpeg/" target="_blank" rel="noreferrer noopener" tabindex="4">see this guide.</a>
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

    .alertsContainer {
        margin: 1rem 0;
    }

    .alertList {
        padding: 0.5em 2em;
    }

    .invalid, .invalid:focus {
        border-color: variables.$danger_input_border_color;
    }

    .fileInputContainer {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 1em;
    }

    .hint {
        font-size: 0.8rem;
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
        imagesSelectedText(){
            const length = this.files?.length;
            if(!length){
                return '';
            }
            return `${length} image${length === 1 ? '' : 's'} selected`;
        },
        isSubmitEnabled(){
            return this.canSubmit && this.files?.length > 0 && this.errorMessages.length === 0 && !this.hasFilenameError;
        },
        hasFpsError(){
            return !this.fps > 0;
        },
        hasFilenameError(){
            return !this.filename;
        },
        errorMessages(){
            const errorMessages = [];
            
            if(this.hasFpsError){
                errorMessages.push('Frames per second must be greater than 0.');
            }

            return errorMessages;
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
        openDeviceImages(){
            this.$refs.batchFileInput.click();
        },
        onBatchFileInputChange($event){
            const fileInput = $event.target;
            this.files = Array.from(fileInput.files).filter(file => isImageFile(file));
        },
    }
};
</script>