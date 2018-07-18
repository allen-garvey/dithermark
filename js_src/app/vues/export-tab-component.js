
(function(Vue, Constants, Canvas, Fs){

    let saveImageCanvas;
    let saveImageLink;

    Vue.component('export-tab', {
        template: document.getElementById('export-tab-component'),
        props: ['save-requested', 'is-image-pixelated'],
        created: function(){
            saveImageCanvas = Canvas.create();
            this.shouldShowFileName = Fs.isDirectDownloadSupported(saveImageCanvas.canvas);
        },
        data: function(){
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
    });
    
})(window.Vue, App.Constants, App.Canvas, App.Fs);