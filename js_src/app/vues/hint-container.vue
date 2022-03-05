<template>
    <div 
        class="hint-container"
        :class="{[$style.dragHover]: isDraggedOver}"
        @drop.prevent="fileDropped($event)"
        @dragover.prevent="() => {}"
        @dragenter.prevent="onDragEnter"
        @dragleave.prevent="onDragLeave"
    >
        Open an image to begin
    </div>
</template>

<style lang="scss" module>
    .dragHover {
        background-color: #ffc2ff;
    }
</style>

<script>
import Fs from '../fs.js';

export default {
    props: {
        imageOpened: {
            type: Function,
            required: true,
        },
        openImageError: {
            type: Function,
            required: true,
        },
    },
    data(){
        return {
            isDraggedOver: false,
        };
    },
    methods: {
        onDragEnter(){
            this.isDraggedOver = true;
        },
        onDragLeave(){
            this.isDraggedOver = false;
        },
        fileDropped($event){
            if($event.dataTransfer.files.length > 0){
                const file = $event.dataTransfer.files[0];
                Fs.openImageFile(file, this.imageOpened, this.openImageError);
            }
        },
    }
};
</script>