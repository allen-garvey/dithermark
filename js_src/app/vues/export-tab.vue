<template>
    <div class="controls-tab-container">
        <div v-if="shouldShowFileName">
            <label>File name
                <input placeholder="File name" v-model="saveImageFileName" @keyup.enter="saveImage" /><span>{{saveImageFileType.extension}}</span>
            </label>
        </div>
        <div>
            <label class="radio-super-label">File type</label>
            <label v-for="(fileType, i) of saveImageFileTypes" :key="fileType.mime">{{ fileType.label }}
                <input type="radio" v-model="saveImageFileTypeIndex" :value="i" />
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
    },
    created(){
        saveImageCanvas = Canvas.create();
        this.shouldShowFileName = Fs.isDirectDownloadSupported(saveImageCanvas.canvas);
    },
    data(){
        return {
            saveImageFileName: '',
            saveImageFileTypeIndex: 0,
            isCurrentlySavingImage: false,
            shouldShowFileName: true,
            //should be boolean, but v-model only supports numbers
            //only used if image is pixelated
            shouldUpsample: 1,
        };
    },
    computed: {
        saveImageFileTypes(){
            return [
                {
                    label: 'png',
                    mime: 'image/png',
                    extension: '.png',
                },
                {
                    label: 'jpeg',
                    mime: 'image/jpeg',
                    extension: '.jpg',
                },
                {
                    label: 'webp',
                    mime: 'image/webp',
                    extension: '.webp',
                },
            ];
        },
        saveImageFileType(){
            return this.saveImageFileTypes[this.saveImageFileTypeIndex];
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
            this.saveImageFileName = fileName.replace(/\.(png|bmp|jpg|jpeg|webp|tiff)$/i, '');
        },
        //downloads image
        //based on: https://stackoverflow.com/questions/30694433/how-to-give-browser-save-image-as-option-to-button
        saveImage(){
            if(this.isCurrentlySavingImage){
                return;
            }
            this.isCurrentlySavingImage = true;
            this.saveRequested(saveImageCanvas, !!this.shouldUpsample, (sourceCanvas, unsplash)=>{
                Fs.saveImage(sourceCanvas.canvas, this.saveImageFileType.mime, (objectUrl=null)=>{
                    //objectUrl will be null if we are using toBlob polyfill, which opens image in new tab
                    if(objectUrl){
                        saveImageLink = saveImageLink || createSaveImageLink();
                        saveImageLink.href = objectUrl;
                        saveImageLink.download = this.saveImageFileName + this.saveImageFileType.extension;
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