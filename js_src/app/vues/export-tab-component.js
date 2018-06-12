
(function(Vue, Constants, Canvas, Fs){

    let saveImageCanvas;
    let saveImageLink;

    Vue.component('export-tab', {
        template: document.getElementById('export-tab-component'),
        props: ['save-requested'],
        data: function(){
            return {
                saveImageFileName: '',
                saveImageFileType: 'image/png',
                isCurrentlySavingImage: false,
            };
        },
        computed: {
            saveImageFileExtension: function(){
                if(this.saveImageFileType === 'image/jpeg'){
                    return '.jpg';
                }
                return '.png';
            },
        },
        watch: {
            saveImageFileName: function(newValue, oldValue){
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
            fileChanged: function(fileName){
                this.saveImageFileName = fileName.replace(/\.(png|bmp|jpg|jpeg)$/i, '');
            },
            //downloads image
            //based on: https://stackoverflow.com/questions/30694433/how-to-give-browser-save-image-as-option-to-button
            saveImage: function(){
                if(this.isCurrentlySavingImage){
                    return;
                }
                this.isCurrentlySavingImage = true;
                this.saveRequested((transformCanvas, pixelateImageZoom, unsplash)=>{
                    //if the image is pixelated, that means the transformCanvas is scaled down,
                    //so we have to scale it back up to 100% first. Otherwise, we can just use the transformCanvas
                    //directly, for a performance gain
                    let sourceCanvas = transformCanvas;
                    if(pixelateImageZoom !== 100){
                        saveImageCanvas = saveImageCanvas || Canvas.create();
                        Canvas.copy(sourceCanvas, saveImageCanvas, 100 / pixelateImageZoom);
                        sourceCanvas = saveImageCanvas;
                    }
                    Fs.saveImage(sourceCanvas.canvas, this.saveImageFileType, (objectUrl)=>{
                        saveImageLink = saveImageLink || document.createElement('a');
                        saveImageLink.href = objectUrl;
                        saveImageLink.download = this.saveImageFileName + this.saveImageFileExtension;
                        saveImageLink.click();

                        //clear the canvas to free up memory
                        if(sourceCanvas === saveImageCanvas){
                            Canvas.clear(saveImageCanvas);
                        }
                        //follow Unsplash API guidelines for triggering download
                        //https://medium.com/unsplash/unsplash-api-guidelines-triggering-a-download-c39b24e99e02
                        if(unsplash){
                            //arguably should be POST request here, but much easier to just use GET
                            fetch(`${Constants.unsplashDownloadUrl}?photo_id=${unsplash.id}`);
                        }
                        this.isCurrentlySavingImage = false;
                    });
                });
            },
        },
    });
    
})(window.Vue, App.Constants, App.Canvas, App.Fs);