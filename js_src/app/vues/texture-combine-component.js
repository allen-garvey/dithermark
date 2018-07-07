(function(Vue, WebGl, WebGlBwDither){
    Vue.component('texture-combine', {
        template: document.getElementById('texture-combine-component'),
        props: ['loadedImage', 'requestCanvases', 'requestDisplayTransformedImage', 'colorReplaceBlackPixel', 'colorReplaceWhitePixel'],
        data: function(){
            return {
                savedTextures: [],
            };
        },
        methods: {
            resetTextures: function(){
                //technically we should probably actually delete the textures from the GPU here,
                //rather than merely losing references to them
                this.savedTextures = [];
            },
            saveTexture: function(){
                this.requestCanvases((transformCanvas, transformCanvasWebGl)=>{
                    let gl = transformCanvasWebGl.gl;
                    let texture = WebGl.createAndLoadTextureFromCanvas(gl, transformCanvas.canvas);
                    this.savedTextures.push(texture);
                });
            },
            combineDitherTextures: function(){
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
    });
    
    
})(window.Vue, App.WebGl, App.WebGlBwDither);