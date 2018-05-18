(function(Vue, Canvas, Timer, Histogram, WorkerUtil, AlgorithmModel, Polyfills, WorkerHeaders, ColorPicker, ColorDitherModes, Constants, VueMixins, ColorQuantizationModes, Palettes, UserSettings){
    //canvas stuff
    let histogramCanvas;

    //caching for optimize palette
    let optimizedPalettes;

    let numPalettesSaved = 0;

    function optimizePaletteMemorizationKey(numColors, modeId, pixelation, contrast, saturation, smoothing){
        return `${numColors}-${modeId}-${pixelation}-${contrast}-${saturation}-${smoothing}`;
    }
    
    Vue.component('color-dither-section', {
        template: document.getElementById('color-dither-component'),
        props: ['isWebglEnabled', 'isLivePreviewEnabled', 'requestCanvases', 'requestDisplayTransformedImage', 'ditherAlgorithms'],
        created: function(){
            //select first non-custom palette
            //needs to be done here to initialize palettes correctly
            this.selectedPaletteIndex = 1;
            this.numColors = this.numColorsMax;
            this.palettes = Palettes.get().concat(UserSettings.getPalettes());
        },
        mounted: function(){
            //have to get canvases here, because DOM manipulation needs to happen in mounted hook
            histogramCanvas = Canvas.create(this.$refs.histogramCanvas);
        },
        data: function(){ 
            return{
                selectedDitherAlgorithmIndex: 20,
                ditherGroups: AlgorithmModel.colorDitherGroups,
                loadedImage: null,
                colors: [],
                //colors shadow and draggedIndex are for dragging colors in palette
                colorsShadow: [],
                draggedIndex: null,
                palettes: [],
                selectedPaletteIndex: null,
                numColors: null,
                numColorsMin: 2,
                numColorsMax: Constants.colorDitherMaxColors,
                colorDitherModes: [...ColorDitherModes.values()],
                selectedColorDitherModeIndex: 4,
                colorQuantizationModes: ColorQuantizationModes.modes,
                colorQuantizationGroups: ColorQuantizationModes.groups,
                selectedColorQuantizationModeIndex: 0,
                pendingColorQuantizations: {},
            };
        },
        computed: {
            selectedDitherAlgorithm: function(){
                return this.ditherAlgorithms[this.selectedDitherAlgorithmIndex];
            },
            isSelectedAlgorithmWebGl: function(){
                return this.isWebglEnabled && this.selectedDitherAlgorithm.webGlFunc;
            },
            isImageLoaded: function(){
              return this.loadedImage != null;  
            },
            selectedColors: function(){
              return this.colors.slice(0, this.numColors);  
            },
            selectedColorsVec: function(){
                return ColorPicker.colorsToVecArray(this.selectedColors, this.numColorsMax);
            },
            selectedColorDitherModeId: function(){
                return this.colorDitherModes[this.selectedColorDitherModeIndex].id;
            },
            isSelectedColorQuantizationPending: function(){
                if(!this.isImageLoaded){
                    return false;
                }
                const key = optimizePaletteMemorizationKey(this.numColors, this.selectedColorQuantizationModeIndex, this.loadedImage.pixelation, this.loadedImage.contrast, this.loadedImage.saturation, this.loadedImage.smoothing);
                return this.pendingColorQuantizations[key] > 0;
            },
            selectedColorQuantizationPendingMessage: function(){
                if(!this.isImageLoaded){
                    return '';
                }
                const key = optimizePaletteMemorizationKey(this.numColors, this.selectedColorQuantizationModeIndex, this.loadedImage.pixelation, this.loadedImage.contrast, this.loadedImage.saturation, this.loadedImage.smoothing);
                const percentage = this.pendingColorQuantizations[key];
                const messageBase = 'Working…';
                if(percentage === 1){
                    return messageBase;
                }
                if(percentage > 0){
                    return `${messageBase} ${percentage}%`;
                }
                return '';
            },
            currentPalette: function(){
                return this.palettes[this.selectedPaletteIndex];
            },
        },
        watch: {
            isLivePreviewEnabled: function(newValue){
                if(newValue){
                    this.ditherImageWithSelectedAlgorithm();
                }
            },
            selectedDitherAlgorithmIndex: function(newIndex){
                if(this.isLivePreviewEnabled){
                    this.ditherImageWithSelectedAlgorithm();
                }
            },
            selectedColorQuantizationModeIndex: function(){
                if(this.isLivePreviewEnabled){
                    this.optimizePalette();
                }
            },
            numColors: function(newValue, oldValue){
                let value = newValue;
                if(value < this.numColorsMin){
                    value = this.numColorsMin;
                }
                else if(value > this.numColorsMax){
                    value = this.numColorsMax;
                }
                if(value !== this.numColors){
                    this.numColors = value;
                }
                if(value === oldValue){
                    return;
                }
                if(this.isLivePreviewEnabled){
                    this.ditherImageWithSelectedAlgorithm();
                }
            },
            colorsShadow: function(newValue){
                if(this.draggedIndex === null){
                    this.colors = this.colorsShadow.slice();   
                }
            },
            colors: function(newValue, oldValue){
                //don't dither image if colors changed are not enabled
                if(this.isLivePreviewEnabled && !ColorPicker.areColorArraysIdentical(newValue.slice(0, this.numColors), oldValue.slice(0, this.numColors))){
                    this.ditherImageWithSelectedAlgorithm();
                }
                //set palette to custom if a color is changed
                if(!this.currentPalette.isCustom && !ColorPicker.areColorArraysIdentical(this.colors, this.currentPalette.colors)){
                    this.selectedPaletteIndex = 0;
                }
            },
            currentPalette: function(newValue){
                if(!this.currentPalette.isCustom){
                    this.colorsShadow = this.currentPalette.colors.slice();
                }
            },
            selectedColorDitherModeIndex: function(newValue){
                if(this.isLivePreviewEnabled){
                    this.ditherImageWithSelectedAlgorithm();
                }
            },
        },
        methods: {
            //isNewImage is used to determine if the image is actually different,
            //or it is the same image with filters changed
            imageLoaded: function(loadedImage, isNewImage=false){
                this.loadedImage = loadedImage;
                if(isNewImage){
                    optimizedPalettes = {};
                    this.pendingColorQuantizations = {};
                }
                
                //draw histogram
                this.$emit('request-worker', (worker)=>{
                    worker.postMessage(WorkerUtil.colorHistogramWorkerHeader());
                });
                
                if(this.isLivePreviewEnabled){
                    this.ditherImageWithSelectedAlgorithm();   
                }
                else{
                    //if live preview is not enabled, transform canvas will be blank unless we do this
                    this.requestDisplayTransformedImage();
                }
            },
            ditherImageWithSelectedAlgorithm: function(){
                if(!this.isImageLoaded){
                    return;
                }
                if(this.isSelectedAlgorithmWebGl){
                    this.requestCanvases((transformCanvas, transformCanvasWebGl, sourceWebglTexture)=>{
                        Timer.megapixelsPerSecond(this.selectedDitherAlgorithm.title + ' webgl', this.loadedImage.width * this.loadedImage.height, ()=>{
                            this.selectedDitherAlgorithm.webGlFunc(transformCanvasWebGl.gl, sourceWebglTexture, this.loadedImage.width, this.loadedImage.height, this.selectedColorDitherModeId, this.selectedColorsVec, this.numColors); 
                        });
                        //have to copy to 2d context, since chrome will clear webgl context after switching tabs
                        //https://stackoverflow.com/questions/44769093/how-do-i-prevent-chrome-from-disposing-of-my-webgl-drawing-context-after-swit
                        transformCanvas.context.drawImage(transformCanvasWebGl.canvas, 0, 0);
                        this.requestDisplayTransformedImage();
                    });
                    return;
                }
                this.$emit('request-worker', (worker)=>{
                    worker.postMessage(WorkerUtil.ditherWorkerColorHeader(this.loadedImage.width, this.loadedImage.height, this.selectedDitherAlgorithm.id, this.selectedColorDitherModeId, this.selectedColors));
                });
            },
            ditherWorkerMessageReceivedDispatcher: function(messageTypeId, messageBody){
                switch(messageTypeId){
                    case WorkerHeaders.DITHER_COLOR:
                        this.ditherWorkerMessageReceived(messageBody);
                        break;
                    case WorkerHeaders.OPTIMIZE_PALETTE:
                        const colors = messageBody.subarray(5, messageBody.length);
                        const optimizePaletteKey = optimizePaletteMemorizationKey(colors.length / 3, messageBody[0], messageBody[1], messageBody[2], messageBody[3], messageBody[4]);
                        this.optimizePaletteMessageReceived(colors, optimizePaletteKey);
                        break;
                    case WorkerHeaders.OPTIMIZE_PALETTE_PROGRESS:
                        const key = optimizePaletteMemorizationKey(messageBody[1], messageBody[0], messageBody[3], messageBody[4], messageBody[5], messageBody[6]);
                        //check to make sure still pending and not done first, to avoid race condition
                        if(this.pendingColorQuantizations[key]){
                            //have to use Vue.set for object keys
                            Vue.set(this.pendingColorQuantizations, key, messageBody[2]);
                        }
                        break;
                    //histogram
                    default:
                        this.histogramWorkerMessageReceived(messageBody);
                        break;
                }
            },
            optimizePaletteMessageReceived: function(colors, key){
                //avoids race condition where image is changed before color quantization returns
                if(!this.pendingColorQuantizations[key]){
                    return;
                }
                optimizedPalettes[key] = ColorPicker.pixelsToHexArray(colors, this.numColorsMax);
                //have to use Vue.set for object keys
                Vue.set(this.pendingColorQuantizations, key, false);
                //avoids race conditions when color quantization mode or number of colors is changed before results return
                const currentKey = optimizePaletteMemorizationKey(this.numColors, this.selectedColorQuantizationModeIndex, this.loadedImage.pixelation, this.loadedImage.contrast, this.loadedImage.saturation, this.loadedImage.smoothing);
                if(key === currentKey){
                    this.colorsShadow = optimizedPalettes[key].slice();
                }
            },
            histogramWorkerMessageReceived: function(huePercentages){
                Histogram.drawColorHistogram(histogramCanvas, huePercentages);
            },
            ditherWorkerMessageReceived: function(pixels){
                this.requestCanvases((transformCanvas)=>{
                    Canvas.replaceImageWithArray(transformCanvas, this.loadedImage.width, this.loadedImage.height, pixels);
                    this.requestDisplayTransformedImage();
                });
            },
            optimizePalette: function(){
                const key = optimizePaletteMemorizationKey(this.numColors, this.selectedColorQuantizationModeIndex, this.loadedImage.pixelation, this.loadedImage.contrast, this.loadedImage.saturation, this.loadedImage.smoothing);
                if(this.pendingColorQuantizations[key]){
                    return;
                }
                if(optimizedPalettes[key]){
                    this.colorsShadow = optimizedPalettes[key].slice();
                    return;
                }
                //have to use Vue.set for object keys
                Vue.set(this.pendingColorQuantizations, key, 1);
                this.$emit('request-worker', (worker)=>{
                    worker.postMessage(WorkerUtil.optimizePaletteHeader(this.numColors, this.selectedColorQuantizationModeIndex, this.loadedImage.pixelation, this.loadedImage.contrast, this.loadedImage.saturation, this.loadedImage.smoothing));
                });
            },
            randomizePalette: function(){
                this.colorsShadow = ColorPicker.randomPalette(this.numColorsMax);
            },
            savePalette: function(){
                this.palettes.push(Palettes.generateUserSavedPalette(this.colors.slice(), ++numPalettesSaved));
                this.selectedPaletteIndex = this.palettes.length - 1;
                this.saveUserPalettes();
            },
            deletePalette: function(){
                //we change the selectedPaletteIndex to 0 first, 
                //so that the current colors will persist after the palette is deleted
                const indexToDelete = this.selectedPaletteIndex;
                this.selectedPaletteIndex = 0;
                this.palettes.splice(indexToDelete, 1);
                this.saveUserPalettes();
            },
            showRenamePalette: function(){
                this.$emit('request-modal-prompt', 'Palette name', this.currentPalette.title, this.renamePalette, {okButtonValue: 'Save'});
            },
            renamePalette: function(newTitle){
                this.currentPalette.title = newTitle;
                this.saveUserPalettes();
            },
            saveUserPalettes: function(){
                UserSettings.savePalettes(this.palettes.filter((palette)=>{
                    return palette.isSaved;
                }));
            },
            cyclePropertyList: VueMixins.cyclePropertyList,
            /**
            * Color palette drag stuff
            */
            handleColorDragstart: function(e, colorIndex){
                this.draggedIndex = colorIndex;
            },
            //drag functions based on: https://www.w3schools.com/html/html5_draganddrop.asp
            handleColorDragover: function(e, colorIndex){
                e.preventDefault();
                e.stopPropagation();
                //will be defined if we are over the container
                if(colorIndex === undefined){
                    return;
                }
                let swapIndex = colorIndex;

                if(this.draggedIndex != swapIndex){
                    let colorsCopy = this.colorsShadow.slice();
                    let draggedColor = colorsCopy.splice(this.draggedIndex, 1)[0];
                    colorsCopy.splice(swapIndex, 0, draggedColor);
                    this.colorsShadow = colorsCopy;
                    this.draggedIndex = swapIndex;
                }
                
            },
            //according to spec, must happen after drop
            handleColorDragend: function(e){
                this.draggedIndex = null;
                
                //draggedIndex has to be null before resetting colorsShadow
                //need to do this to trigger refresh
                this.colorsShadow = this.colorsShadow.slice();
            },
            colorPickerValueChanged: function(colorValue, colorIndex){
                Vue.set(this.colorsShadow, colorIndex, colorValue);
            },
        }
    });
    
    
})(window.Vue, App.Canvas, App.Timer, App.Histogram, App.WorkerUtil, App.AlgorithmModel, App.Polyfills, App.WorkerHeaders, App.ColorPicker, App.ColorDitherModes, App.Constants, App.VueMixins, App.ColorQuantizationModes, App.ColorPalettes, App.UserSettings);