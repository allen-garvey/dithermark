<template>
    <div :class="$style.textureCombineContainer">
        <button class="btn btn-default btn-sm" @click="saveTexture">Save texture</button>
        <span>{{ savedTextures.length }} / {{ maxTextureLength }} textures saved</span>
        <button class="btn btn-default btn-sm" v-show="savedTextures.length >= maxTextureLength" @click="combineDitherTextures">Combine textures</button>
    </div>
</template>

<style lang="scss" module>
    .textureCombineContainer {
        display: flex;
        flex-wrap: wrap;
        gap: 1em;
        align-items: center;
    }
</style>


<script>
import WebGl from '../webgl/webgl.js';
import WebGlBwDither from '../webgl/webgl-bw-dither.js';

export default {
    props: {
        loadedImage: {
            // type: Object, //might be null
            required: true,
        },
        requestCanvases: {
            type: Function,
            required: true,
        },
        requestDisplayTransformedImage: {
            type: Function,
            required: true,
        },
        colorReplaceBlackPixel: {
            type: Uint8ClampedArray,
            required: true,
        },
        colorReplaceWhitePixel: {
            type: Uint8ClampedArray,
            required: true,
        },
    },
    data(){
        return {
            savedTextures: [],
        };
    },
    computed: {
        maxTextureLength(){
            return 3;
        },
    },
    methods: {
        resetTextures(gl){
            this.savedTextures.forEach(texture => {
                gl.deleteTexture(texture);
            });
            this.savedTextures = [];
        },
        saveTexture(){
            this.requestCanvases((transformCanvas, transformCanvasWebGl)=>{
                let gl = transformCanvasWebGl.gl;
                let texture = WebGl.createAndLoadTextureFromCanvas(gl, transformCanvas.canvas);
                this.savedTextures.push(texture);
            });
        },
        combineDitherTextures(){
            this.requestCanvases((transformCanvas, transformCanvasWebGl)=>{

                const texturesLength = this.savedTextures.length;
                const textures = this.savedTextures.slice(texturesLength - this.maxTextureLength, texturesLength);
                WebGlBwDither.textureCombine(transformCanvasWebGl.gl, this.loadedImage.width, this.loadedImage.height, this.colorReplaceBlackPixel, this.colorReplaceWhitePixel, textures);
                transformCanvas.context.drawImage(transformCanvasWebGl.canvas, 0, 0);
                this.requestDisplayTransformedImage();
                this.resetTextures(transformCanvasWebGl.gl);
            });
        },
    }
};
</script>