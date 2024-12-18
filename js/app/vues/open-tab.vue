<template>
    <div class="controls-tab-container" :class="$style.container">
        <fieldset>
            <legend>Device</legend>
            <file-input-button 
                buttonClass="btn-primary"
                label="Image file"
                tooltip="Open local image file"
                :onFilesChanged="onDeviceImageOpened"
            />
            <file-input-button 
                label="Batch convert image files"
                tooltip="Dither and save multiple images"
                :onFilesChanged="onBatchFilesOpened"
                :multiple="true"
                v-if="isBatchConvertEnabled"
            />
            <button 
                class="btn btn-default" 
                @click="openVideoModal" 
                title="Dither multiple images and save as a video"
                v-if="isBatchConvertEnabled"
            >
                Images to video
            </button>
            <file-input-button 
                buttonClass="btn-primary"
                label="Video file"
                tooltip="Open local video file"
                :onFilesChanged="onVideoFileOpened"
            />
        </fieldset>
        <fieldset>
            <legend>Web</legend>
            <button 
                class="btn btn-default" 
                @click="showOpenImageUrlPrompt" 
                :disabled="isCurrentlyLoadingImageUrl" 
                title="Open image from Url"
            >
                Image url
            </button>
            <button 
                class="btn btn-default" 
                @click="openRandomImage" 
                :disabled="isCurrentlyLoadingImageUrl" 
                title="Open random image from Unsplash"
            >
                Random image
            </button>
        </fieldset>
        <video-player
            v-if="videoFile"
            :videoFile="videoFile"
            :onSeekChange="onVideoSeekChange" 
        />
        <export-video-modal
            :onSubmit="onVideoModalSubmitted"
            :canSubmit="isFfmpegReady"
            :automaticallyResizeLargeImages="automaticallyResizeLargeImages"
            :isPixelatedActualSize="isPixelatedActualSize"
            ref="videoModal"
        />    
    </div>
</template>

<style lang="scss" module>
    .container fieldset {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
</style>

<script>
import Fs, { isImageFile, isVideoFile } from '../fs.js';
import { getRandomImage } from '../random-image.js';
import ExportVideoModal from './export-video-modal.vue';
import FileInputButton from './widgets/file-input-button.vue';
import VideoPlayer from './widgets/video-player.vue';
import { BATCH_IMAGE_MODE_EXPORT_IMAGES, BATCH_IMAGE_MODE_EXPORT_VIDEO } from '../models/batch-export-modes.js';

export default { 
    props: {
        imageOpened: {
            type: Function,
            required: true,
        },
        onBatchFilesSelected: {
            type: Function,
            required: true,
        },
        openImageError: {
            type: Function,
            required: true,
        },
        requestModal: {
            type: Function,
            required: true,
        },
        isBatchConvertEnabled: {
            type: Boolean,
            required: true,
        },
        isFfmpegReady: {
            type: Boolean,
            required: true,
        },
        getFfmpegReady: {
            type: Function,
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
    components: {
        ExportVideoModal,
        FileInputButton,
        VideoPlayer,
    },
    data(){
        return {
            isCurrentlyLoadingImageUrl: false,
            videoFile: null,
        };
    },
    methods: {
        onBatchFilesOpened(rawFiles){
            this.videoFile = null;
            const files = Array.from(rawFiles).filter(file => isImageFile(file));
            if(files.length === 0){
                return this.openImageError('No image files selected');
            }
            this.onBatchFilesSelected(files, BATCH_IMAGE_MODE_EXPORT_IMAGES);
        },
        onDeviceImageOpened(files){
            this.videoFile = null;
            Fs.openImageFile(files[0])
                .then(([image, data]) => {
                    if(!image){
                        return this.openImageError(data);
                    }
                    this.imageOpened(image, data, {height: image.height, width: image.width});
                });
        },
        openImageFromUrlFailed(error, imageUrl){
            this.openImageError(Fs.messageForOpenImageUrlError(error, imageUrl));
            this.isCurrentlyLoadingImageUrl = false;
        },
        showOpenImageUrlPrompt(){
            this.requestModal('Open image from url', 'Image Url', '', this.openImageUrl, {okButtonValue: 'Open', inputType: 'url', placeholder: 'http://example.com/image.jpg'});
        },
        openImageUrl(imageUrl){
            if(!imageUrl){
                return;
            }
            this.videoFile = null;
            this.isCurrentlyLoadingImageUrl = true;
            Fs.openImageUrl(imageUrl).then(([image, file])=>{
                this.imageOpened(image, file, {height: image.height, width: image.width});
                this.isCurrentlyLoadingImageUrl = false;
            }).catch((error)=>{
                this.openImageFromUrlFailed(error, imageUrl);
            });
        },
        openRandomImage(){
            this.videoFile = null;
            this.isCurrentlyLoadingImageUrl = true;
            
            getRandomImage(window.innerWidth, window.innerHeight).then(({image, file})=>{
                this.imageOpened(image, file, {height: image.height, width: image.width});
                this.isCurrentlyLoadingImageUrl = false;
            }).catch(this.openImageFromUrlFailed);
        },
        openVideoModal(){
            this.videoFile = null;
            this.getFfmpegReady();
            this.$refs.videoModal.show();
        },
        onVideoModalSubmitted(files, videoExportOptions){
            this.onBatchFilesSelected(files, BATCH_IMAGE_MODE_EXPORT_VIDEO, videoExportOptions);
        },
        onVideoFileOpened(videoFiles){
            const videoFile = videoFiles[0];
            if(!isVideoFile(videoFile)){
                return this.openImageError(`${videoFile.name} does not appear to be a video file.`);
            }
            this.videoFile = videoFile;
        },
        onVideoSeekChange(video){
            this.imageOpened(video, this.videoFile, {height: video.videoHeight, width: video.videoWidth});
        },
    },
};
</script>