(function(Vue, Fs, Canvas, Timer, WorkerUtil, WebGl, Polyfills, WorkerHeaders){
    
    var app = new Vue({
        el: '#app',
        components: {
            //'bw-dither-section': BwDitherComponent,
        },
        mounted: function(){
            this.sourceCanvas = Canvas.create('source-canvas');
            this.transformCanvas = Canvas.create('transform-canvas');
            this.transformCanvasWebGl = WebGl.createCanvas('transform-canvas-webgl');
            this.sourceCanvasOutput = Canvas.create('source-canvas-output');
            this.transformCanvasOutput = Canvas.create('transform-canvas-output');
            
            this.currentEditorThemeIndex = 0;
            //check for webgl support
            this.isWebglSupported = !!this.transformCanvasWebGl.gl;
            this.isWebglEnabled = this.isWebglSupported;
        },
        data: {
            sourceCanvas: null,
            transformCanvas: null,
            transformCanvasWebGl: null,
            sourceCanvasOutput: null,
            transformCanvasOutput: null,
            //loadedImage has properties: width, height, fileName, fileType, fileSize
            loadedImage: null,
            isLivePreviewEnabled: true,
            isCurrentlyLoadingRandomImage: false,
            isWebglSupported: false,
            isWebglEnabled: false,
            zoom: 100,
            zoomMin: 10,
            zoomMax: 400,
            numPanels: 2,
            editorThemes: [{name: 'Light', className: 'editor-light'}, {name: 'Gray', className: 'editor-gray'}, {name: 'Dark', className: 'editor-dark'},],
            currentEditorThemeIndex: null,
        },
        computed: {
            isImageLoaded: function(){
              return this.loadedImage != null;  
            },
            imageTitle: function(){
                if(this.loadedImage){
                    return this.loadedImage.fileName || '';
                }
                return '';
            },
            
        },
        watch: {
            currentEditorThemeIndex: function(newThemeIndex){
                document.documentElement.className = this.editorThemes[newThemeIndex].className;
            },
            zoom: function(newZoom, oldZoom){
                let newZoomCleaned = Math.floor(newZoom);
                if(isNaN(newZoomCleaned)){
                    this.zoom = oldZoom;
                    return;
                }
                
                if(newZoomCleaned < this.zoomMin){
                    newZoomCleaned = this.zoomMin;
                }
                else if(newZoomCleaned > this.zoomMax){
                    newZoomCleaned = this.zoomMax;
                }
                if(newZoomCleaned !== newZoom){
                    this.zoom = newZoomCleaned;   
                }
                this.zoomImage();
            },
            
        },
        methods: {
            loadImageTrigger: function(){
                fileInput.click();
            },
            //downloads image
            //based on: https://stackoverflow.com/questions/30694433/how-to-give-browser-save-image-as-option-to-button
            saveImage: function(){
                let outputCanvas = this.transformedImageCanvasSource.canvas;
                let dataURL = outputCanvas.toDataURL(this.loadedImage.fileType);
                saveImageLink.href = dataURL;
                saveImageLink.download = this.loadedImage.fileName;
                saveImageLink.click();
            },
            loadRandomImage: function(){
                this.isCurrentlyLoadingRandomImage = true;
                var randomImageUrl = 'https://source.unsplash.com/random/800x600';
                Fs.openRandomImage(randomImageUrl, (image, file)=>{
                    this.loadImage(image, file);
                    this.isCurrentlyLoadingRandomImage = false;
                });
            },
            loadImage: function(image, file){
                Canvas.loadImage(this.sourceCanvas, image);
                Canvas.loadImage(this.transformCanvas, image);
                
                this.transformCanvasWebGl.canvas.width = image.width;
                this.transformCanvasWebGl.canvas.height = image.height;
                
                this.loadedImage = {
                    width: image.width,
                    height: image.height,
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type,
                };
                //adjust zoom
                this.zoomMax = Canvas.maxScalePercentageForImage(this.loadedImage.width, this.loadedImage.height, Math.ceil(window.innerWidth * 2 * Canvas.devicePixelRatio));
                this.zoomMin = Canvas.minScalePercentageForImage(this.loadedImage.width, this.loadedImage.height, 200);
                if(this.zoom > this.zoomMax){
                    this.zoom = this.zoomMax;
                }
                else if(this.zoom < this.zoomMin){
                    this.zoom = this.zoomMin;
                }
                
                //call selected tab image loaded hook here
                this.$refs.bwDitherSection.imageLoaded(this.loadedImage);
            },
            zoomImage: function(){
                var scaleAmount = this.zoom / 100;
                Canvas.scale(this.sourceCanvas, this.sourceCanvasOutput, scaleAmount);
                Canvas.scale(this.transformCanvas, this.transformCanvasOutput, scaleAmount);
            },
            resetZoom: function(){
                this.zoom = 100;
            },
            
        }
    });
    
    
    var saveImageLink = document.getElementById('save-image-link');
    var fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', (e)=>{
        Fs.openImageFile(e, app.loadImage);   
    }, false);
    
    
    
})(window.Vue, App.Fs, App.Canvas, App.Timer, App.WorkerUtil, App.WebGl, App.Polyfills, App.WorkerHeaders);