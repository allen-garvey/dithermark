import WebGl from '../webgl.js';
import WebGlBwDither from '../webgl-bw-dither.js';

export default{
    name: 'texture-combine',
    template: document.getElementById('texture-combine-component'),
    props: ['loadedImage', 'requestCanvases', 'requestDisplayTransformedImage', 'colorReplaceBlackPixel', 'colorReplaceWhitePixel'],
    data(){
        return {
            savedTextures: [],
        };
    },
    methods: {
        resetTextures(){
            //technically we should probably actually delete the textures from the GPU here,
            //rather than merely losing references to them
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
                //get last 3 added textures
                const texturesLength = this.savedTextures.length;
                let textures = this.savedTextures.slice(texturesLength - 3, texturesLength);
                this.savedTextures = [];
                WebGlBwDither.textureCombine(transformCanvasWebGl.gl, this.loadedImage.width, this.loadedImage.height, this.colorReplaceBlackPixel, this.colorReplaceWhitePixel, textures);
                transformCanvas.context.drawImage(transformCanvasWebGl.canvas, 0, 0);
                this.requestDisplayTransformedImage();
            });
        },
    }
};