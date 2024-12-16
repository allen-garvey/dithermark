<template>
    <div class="controls-tab-container">
        <div>
            <label :class="$style.exportLabel" for="export-tab-filename">File name</label>
            <input placeholder="File name" v-model="saveImageFileName" @keyup.enter="saveImage" id="export-tab-filename" /><span>{{saveImageFileType.extension}}</span>
        </div>
        <div>
            <label :class="$style.exportLabel" for="export-tab-filetype">File type</label>
            <select v-model="saveImageFileTypeValue" id="export-tab-filetype">
                <option v-for="fileType of saveImageFileTypes" :key="fileType.value" :value="fileType.value">{{ fileType.label }}</option>
            </select>
        </div>
        <div v-if="isImagePixelated">
            <label :class="$style.exportLabel">Size</label>
            <label :class="$style.radioLabel">Upsampled
                <input type="radio" v-model.number="shouldUpsample" :value="1" />
            </label>
            <label :class="$style.radioLabel">Actual
                <input type="radio" v-model.number="shouldUpsample" :value="0" />
            </label>
        </div>
        <div>
            <button class="btn btn-success" @click="saveImage" :disabled="isCurrentlySavingImage" title="Save image to downloads folder">Save</button>
        </div>
    </div>
</template>

<style lang="scss" module>
.exportLabel {
    display: inline-block;
    min-width: 4.5em;
    margin-right: 0.8em;
}

.radioLabel{
    font-size: 0.8rem;

    & + & {
        margin-left: 0.5em;
    }
}

</style>

<script>
import { APP_NAME, UNSPLASH_DOWNLOAD_URL, UNSPLASH_API_PHOTO_ID_QUERY_KEY } from '../../../constants.js';
import Canvas from '../canvas.js'
import {saveImage, canvasToArray, arrayToObjectUrl} from '../fs.js';
import { getSaveImageFileTypes } from '../models/export-model.js';
import  userSettings from '../user-settings.js';
import { exportFramesToVideo, saveImageFrame } from '../ffmpeg.js';

let saveImageCanvas;
let saveImageLink;


function createSaveImageLink(){
    const link = document.createElement('a');
    //firefox needs the link attached to the body in order for downloads to work
    //so display none in order to hide it
    //https://stackoverflow.com/questions/38869328/unable-to-download-a-blob-file-with-firefox-but-it-works-in-chrome
    link.style.display = 'none';
    document.body.appendChild(link);
    return link;
}


export default {
    props: {
        saveRequested: {
            type: Function,
            required: true,
        },
        isImagePixelated: {
            type: Boolean,
            required: true,
        },
        sourceFileName: {
            type: String,
            required: true,
        },
    },
    created(){
        saveImageCanvas = Canvas.create();
        saveImageLink = createSaveImageLink();
    },
    data(){
        return {
            saveImageFileName: '',
            saveImageFileTypeValue: userSettings.getExportSettings().fileType,
            isCurrentlySavingImage: false,
            //should be boolean, but v-model only supports numbers
            //only used if image is pixelated
            shouldUpsample: 1,
        };
    },
    computed: {
        saveImageFileTypes(){
            return getSaveImageFileTypes();
        },
        saveImageFileType(){
            return this.saveImageFileTypes.find(fileType => fileType.value === this.saveImageFileTypeValue);
        },
    },
    watch: {
        sourceFileName(newValue){
            this.saveImageFileName = newValue.replace(/\.(png|bmp|jpg|jpeg|webp|tiff)$/i, '');
        },
        saveImageFileName(newValue, oldValue){
            if(newValue === oldValue){
                return;
            }
            let title = APP_NAME;
            if(newValue){
                title = `${title} | ${newValue}`;
            }
            document.title = title;
        },
        saveImageFileTypeValue(newValue){
            userSettings.saveExportSettings({
                fileType: newValue,
            });
        },
    },
    methods: {
        //downloads image
        //based on: https://stackoverflow.com/questions/30694433/how-to-give-browser-save-image-as-option-to-button
        saveImage(){
            return new Promise((resolve) => {
                if(this.isCurrentlySavingImage){
                    return resolve();
                }
                this.isCurrentlySavingImage = true;
                this.saveRequested(saveImageCanvas, !!this.shouldUpsample, (sourceCanvas, unsplash)=>{
                    saveImage(sourceCanvas.canvas, this.saveImageFileType.mime, (objectUrl)=>{
                        saveImageLink.href = objectUrl;
                        saveImageLink.download = this.saveImageFileName + this.saveImageFileType.extension;
                        saveImageLink.click();

                        //clear the canvas to free up memory
                        Canvas.clear(saveImageCanvas);
                        //follow Unsplash API guidelines for triggering download
                        //https://medium.com/unsplash/unsplash-api-guidelines-triggering-a-download-c39b24e99e02
                        if(unsplash){
                            //arguably should be POST request here, but much easier to just use GET
                            fetch(`${UNSPLASH_DOWNLOAD_URL}?${UNSPLASH_API_PHOTO_ID_QUERY_KEY}=${unsplash.id}`);
                        }
                        this.isCurrentlySavingImage = false;
                        resolve();
                    });
                });
            });
        },
        saveImageToFfmpeg(ffmpeg){
            return new Promise((resolve) => {
                if(this.isCurrentlySavingImage){
                    return resolve();
                }
                this.isCurrentlySavingImage = true;
                this.saveRequested(saveImageCanvas, !!this.shouldUpsample, (sourceCanvas, unsplash)=>{
                    canvasToArray(sourceCanvas.canvas, this.saveImageFileType.mime)
                    .then(array => 
                        saveImageFrame(ffmpeg, this.saveImageFileName + this.saveImageFileType.extension, array)
                    )
                    .then(() => {
                        //clear the canvas to free up memory
                        Canvas.clear(saveImageCanvas);
                        this.isCurrentlySavingImage = false;
                        resolve();
                    });

                });
            });
        },
        exportVideoFromFrames(ffmpeg, videoExportOptions){
            const exportFilename = videoExportOptions.filename;

            return new Promise((resolve) => {
                exportFramesToVideo(ffmpeg, exportFilename, videoExportOptions.fps, this.saveImageFileType.extension)
                .then((data) => {
                    arrayToObjectUrl(data, (objectUrl) => {
                        saveImageLink.href = objectUrl;
                        saveImageLink.download = exportFilename;
                        saveImageLink.click();
                        resolve();
                    });
                });
            });
        },

    },
};
</script>