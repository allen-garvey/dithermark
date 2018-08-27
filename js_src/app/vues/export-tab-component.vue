<template>
    <div class="controls-tab-container">
        <!-- //for some reason, using v-if here breaks saveImageFileType -->
        <div v-show="shouldShowFileName">
            <label>File name
                <input placeholder="File name" v-model="saveImageFileName" @keyup.enter="saveImage" /><span>{{saveImageFileExtension}}</span>
            </label>
        </div>
        <div>
            <label class="radio-super-label">File type</label>
            <label>png
                <input type="radio" v-model="saveImageFileType" value="image/png" />
            </label>
            <label>jpeg
                <input type="radio" v-model="saveImageFileType" value="image/jpeg" />
            </label>
        </div>
        <div v-if="isImagePixelated">
            <label class="radio-super-label">Size</label>
            <label>Upsampled
                <input type="radio" v-model.number="shouldUpsample" value="1" />
            </label>
            <label>Actual
                <input type="radio" v-model.number="shouldUpsample" value="0" />
            </label>
        </div>
        <div>
            <button class="btn btn-success" @click="saveImage" :disabled="isCurrentlySavingImage" title="Save image to downloads folder">Save</button>
        </div>
        <div v-if="!shouldShowFileName" class="hint">
            Image will open in a new tab. Right click / long press on the image to save
        </div>
    </div>
</template>


<script>
import Constants from '../../generated_output/app/constants.js';
import Canvas from '../canvas.js'
import Fs from '../fs.js';


let saveImageCanvas;
let saveImageLink;

export default{
    name: 'export-tab',
    props: {
        saveRequested: {
            type: Function,
            required: true,
        },
        isImagePixelated: {
            type: Boolean,
            required: true,
        },
    },
    created(){
        saveImageCanvas = Canvas.create();
        this.shouldShowFileName = Fs.isDirectDownloadSupported(saveImageCanvas.canvas);
    },
    data(){
        return {
            saveImageFileName: '',
            saveImageFileType: 'image/png',
            isCurrentlySavingImage: false,
            shouldShowFileName: true,
            //should be boolean, but v-model only supports numbers
            //only used if image is pixelated
            shouldUpsample: 1,
        };
    },
    computed: {
        saveImageFileExtension(){
            if(this.saveImageFileType === 'image/jpeg'){
                return '.jpg';
            }
            return '.png';
        },
    },
    watch: {
        saveImageFileName(newValue, oldValue){
            if(newValue === oldValue){
                return;
            }
            let title = Constants.appName;
            if(newValue){
                title = `${title} | ${newValue}`;
            }
            document.title = title;
        },
    },
    methods: {
        fileChanged(fileName){
            this.saveImageFileName = fileName.replace(/\.(png|bmp|jpg|jpeg)$/i, '');
        },
        //downloads image
        //based on: https://stackoverflow.com/questions/30694433/how-to-give-browser-save-image-as-option-to-button
        saveImage(){
            if(this.isCurrentlySavingImage){
                return;
            }
            this.isCurrentlySavingImage = true;
            this.saveRequested(saveImageCanvas, !!this.shouldUpsample, (sourceCanvas, unsplash)=>{
                Fs.saveImage(sourceCanvas.canvas, this.saveImageFileType, (objectUrl=null)=>{
                    //objectUrl will be null if we are using toBlob polyfill, which opens image in new tab
                    if(objectUrl){
                        saveImageLink = saveImageLink || document.createElement('a');
                        saveImageLink.href = objectUrl;
                        saveImageLink.download = this.saveImageFileName + this.saveImageFileExtension;
                        saveImageLink.click();
                    }

                    //clear the canvas to free up memory
                    Canvas.clear(saveImageCanvas);
                    //follow Unsplash API guidelines for triggering download
                    //https://medium.com/unsplash/unsplash-api-guidelines-triggering-a-download-c39b24e99e02
                    if(unsplash){
                        //arguably should be POST request here, but much easier to just use GET
                        fetch(`${Constants.unsplashDownloadUrl}?${Constants.unsplashApiPhotoIdQueryKey}=${unsplash.id}`);
                    }
                    this.isCurrentlySavingImage = false;
                });
            });
        },
    },
};
</script>