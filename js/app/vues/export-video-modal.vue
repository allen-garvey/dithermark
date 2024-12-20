<template>
    <modal
        v-if="showModal"
        title="Convert images to video"
        :cancelAction="cancelAction"
        :okAction="onOk"
        okButtonText="Export video"
        :isOkButtonDisabled="!isSubmitEnabled"
        :tabIndexOffset="4"
    >
        <div :class="$style.container">
            <div :class="$style.form">
                <label :class="$style.label"><span>File name</span>
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
                <label :class="$style.label"><span>Frames per second</span>
                    <input  
                        tabindex="2" 
                        type="number" 
                        min="1"
                        v-model.number="fps"
                        :class="{[$style.invalid]: hasFpsError, [$style.fpsInput]: true}"
                    />
                </label>
                <div :class="$style.fileInputContainer">
                    <file-input-button 
                        :tabindex="3"
                        label="Add image files"
                        tooltip="Select image files to convert to video"
                        :onFilesChanged="onBatchFilesOpened"
                        :multiple="true"
                    />
                    <span>{{ imagesSelectedText }}</span>
                </div>
            </div>
            <div :class="$style.alertsContainer">
                <banner-messages 
                    :messages="errorMessages"
                    type="danger"
                />
                <video-warning-banner 
                    :automaticallyResizeLargeImages="automaticallyResizeLargeImages"
                    :isPixelatedActualSize="isPixelatedActualSize"
                />
            </div>
            <div :class="$style.hint">
                For more information on how to convert video to images, <a href="https://www.bannerbear.com/blog/how-to-extract-images-from-a-video-using-ffmpeg/" target="_blank" rel="noreferrer noopener" tabindex="4">see this guide.</a>
            </div>
        </div>
    </modal>
</template>

<style lang="scss" module>
    .container {
        max-width: 600px;
    }
    .form {
        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        gap: 1em;
    }

    .alertsContainer {
        margin: 1rem 0;
        display: flex;
        flex-direction: column;
        gap: 1em;
    }

    .invalid, .invalid:focus {
        border-color: variables.$danger_input_border_color;
    }

    .label {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 1em;
        max-width: 100%;
    }

    .fileInputContainer {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 1em;
    }

    .fpsInput {
        width: 11em;
    }

    .hint {
        font-size: 0.8rem;
    }
    
</style>

<script>
import { isImageFile } from '../fs.js';
import FocusDirective from './directives/focus.js';
import Modal from './modal.vue';
import BannerMessages from './widgets/banner-messages.vue';
import VideoWarningBanner from './widgets/video-warning-banner.vue';
import FileInputButton from './widgets/file-input-button.vue';

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
        automaticallyResizeLargeImages: {
            type: Boolean,
            required: true,
        },
        isPixelatedActualSize: {
            type: Boolean,
            required: true,
        },
    },
    directives: {
        focus: FocusDirective,
    },
    components: {
        Modal,
        BannerMessages,
        VideoWarningBanner,
        FileInputButton,
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
            const length = this.files?.length || 0;

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
        onBatchFilesOpened(filesRaw){
            const files = Array.from(filesRaw);
            // so files don't get removed if you open the file picker and don't select anything
            if(files.length === 0){
                return;
            }
            this.files = files.filter(file => isImageFile(file));
        },
    }
};
</script>