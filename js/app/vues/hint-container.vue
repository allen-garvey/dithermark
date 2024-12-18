<template>
    <div 
        :class="{[$style.hintContainer]: true, [$style.dragHover]: isDraggedOver}"
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

    .hintContainer{
        color: var(--hint-text-color);
        font-size: 1.25em;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 3em;
        //have to have min-width since app-container
        //needs to be display: inline-block for stick alerts to work
        //-22px for width of vertical scrollbar
        min-width: calc(100vw - 22px);
    }

    @include mixins.pinned_controls_mq{
        .hintContainer{
            font-size: 3.15em;
            min-height: 90vh;
        }
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
                Fs.openImageFile(file)
                .then(([image, data]) => {
                    if(!image){
                        return this.openImageError(data);
                    }
                    this.imageOpened(image, data);
                });
            }
            this.isDraggedOver = false;
        },
    }
};
</script>