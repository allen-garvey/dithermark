(function(Vue, Canvas, ImageFiltersModel, WebGlContourFilter, ColorPicker, WebGlEdgeFilter, WebGl){
    let outlineFilterCanvas;

    Vue.component('outline-filter-controls', {
        template: document.getElementById('outline-filters-controls-component'),
        props: ['is-image-outline-filter-enabled', 'is-color-picker-live-preview-enabled', 'request-outline-display', 'request-resources-for-outline', 'display-image'],
        data: function(){
            return {
                selectedImageOutlineContourRadiusPercent: 25, //value of 6.5 is a decent default for both pixelated and not
                imageOutlineContourRadiusPercentages: ImageFiltersModel.outlineContourRadiusPercentages(),
                imageOutlineColorModes: ImageFiltersModel.outlineColorModes(),
                selectedOutlineColorMode: 0,
                imageOutlineTypes: ImageFiltersModel.outlineFilterTypes(),
                selectedImageOutlineType: 0,
                outlineOpacities: ImageFiltersModel.outlineOpacities(),
                selectedOutlineOpacity: 0,
                imageOutlineEdgeStrengths: ImageFiltersModel.outlineEdgeStrengths(),
                selectedImageOutlineStrength: 2,
                imageOutlineEdgeThicknesses: ImageFiltersModel.outlineEdgeThicknesses(),
                selectedImageOutlineEdgeThickness: 1, //value of 2 is decent default
                fixedOutlineColor: '#000000',
                imageOutlineFixedColorBlendModes: ImageFiltersModel.canvasBlendModes(),
                selectedOutlineFixedColorBlendMode: 0,
                shouldShowColorPicker: false,
            };
        },
        computed: {
            isImageOutlineFilterActive: function(){
                return this.isImageOutlineFilterEnabled && this.selectedImageOutlineTypeId !== 0;
            },
            isImageEdgeFilterActive: function(){
                return this.isImageOutlineFilterActive && this.selectedImageOutlineTypeId === 1;
            },
            isImageContourFilterActive: function(){
                return this.isImageOutlineFilterActive && this.selectedImageOutlineTypeId === 2;
            },
            selectedImageOutlineTypeId: function(){
                return this.imageOutlineTypes[this.selectedImageOutlineType].id;
            },
            isImageOutlineFixedColor: function(){
                return this.imageOutlineColorModes[this.selectedOutlineColorMode].id === 1;
            },
            areOutlineBlendModesSupported: function(){
                return this.imageOutlineFixedColorBlendModes.length > 1;
            },
        },
        watch: {
            isImageOutlineFilterActive: function(newValue, oldValue){
                if(newValue === oldValue){
                    return;
                }
                //create outlineFilterCanvas, if it's the first time we are using it
                if(newValue && !outlineFilterCanvas){
                    this.initializeOutlineFilterCanvas();
                }
                //clear outline canvas when not active to free up memory
                else if(!newValue && outlineFilterCanvas){
                    Canvas.clear(outlineFilterCanvas);
                }
            },
            selectedImageOutlineContourRadiusPercent: function(newValue, oldValue){
                if(newValue !== oldValue){
                    this.imageOutlineFilterAction();
                    this.displayImage();
                }
            },
            selectedOutlineColorMode: function(newValue, oldValue){
                if(newValue !== oldValue){
                    this.imageOutlineFilterAction();
                    this.displayImage();
                }
            },
            fixedOutlineColor: function(newValue, oldValue){
                if(newValue !== oldValue){
                    this.imageOutlineFilterAction();
                    this.displayImage();
                }
            },
            selectedOutlineFixedColorBlendMode: function(newValue, oldValue){
                if(newValue !== oldValue){
                    this.imageOutlineFilterAction();
                    this.displayImage();
                }
            },
            selectedImageOutlineType: function(newValue, oldValue){
                if(newValue !== oldValue){
                    this.imageOutlineFilterAction();
                    this.displayImage();
                }
            },
            selectedImageOutlineStrength: function(newValue, oldValue){
                if(newValue !== oldValue){
                    this.imageOutlineFilterAction();
                    this.displayImage();
                }
            },
            selectedImageOutlineEdgeThickness: function(newValue, oldValue){
                if(newValue !== oldValue){
                    this.imageOutlineFilterAction();
                    this.displayImage();
                }
            },
            selectedOutlineOpacity: function(newValue, oldValue){
                if(newValue !== oldValue){
                    this.imageOutlineFilterAction();
                    this.displayImage();
                }
            },
        },
        methods: {
            getCanvas: function(){
                return outlineFilterCanvas;
            },
            initializeOutlineFilterCanvas: function(){
                outlineFilterCanvas = Canvas.create();
                //remove unsupported canvas blend modes
                this.imageOutlineFixedColorBlendModes = this.imageOutlineFixedColorBlendModes.filter((blendMode)=>{
                    return Canvas.isBlendModeSupported(outlineFilterCanvas, blendMode.value);
                });
                //reset to default blend mode
                Canvas.resetBlendMode(outlineFilterCanvas);
            },
            imageOutlineFilterAction: function(){
                if(!this.isImageOutlineFilterActive){
                    return;
                }
                if(this.isImageContourFilterActive){
                    this.imageContourFilterAction();
                }
                else{
                    this.imageEdgeFilterAction();
                }

                //merge on top of transformCanvas
                const blendMode = this.areOutlineBlendModesSupported ? this.imageOutlineFixedColorBlendModes[this.selectedOutlineFixedColorBlendMode].value : null;
                const outlineOpacity = this.outlineOpacities[this.selectedOutlineOpacity];
                
                this.requestOutlineDisplay((transformCanvas, transformCanvasWebGl)=>{
                    Canvas.copy(transformCanvas, outlineFilterCanvas);
                    Canvas.merge(transformCanvasWebGl, outlineFilterCanvas, outlineOpacity, blendMode);
                });
            },
            imageContourFilterAction: function(){
                const radiusPercent = this.imageOutlineContourRadiusPercentages[this.selectedImageOutlineContourRadiusPercent];
                
                this.requestResourcesForOutline((imageWidth, imageHeight, sourceWebglTexture, ditherOutputWebglTexture, transformCanvasWebGl, paletteColorsVec)=>{
                    //better to use source texture as input instead of dither results, because there will be less noise in image outline 
                    const inputTexture = sourceWebglTexture;
                    // const originTexture = ditherOutputWebglTexture;
                    WebGlContourFilter.outlineImage1(transformCanvasWebGl.gl, inputTexture, imageWidth, imageHeight, radiusPercent);
                    const outline1OutputTexture = WebGl.createAndLoadTextureFromCanvas(transformCanvasWebGl.gl, transformCanvasWebGl.canvas);
                    
                    if(this.isImageOutlineFixedColor){
                        WebGlContourFilter.outlineImage2(transformCanvasWebGl.gl, outline1OutputTexture, imageWidth, imageHeight, radiusPercent, ColorPicker.colorsToVecArray([this.fixedOutlineColor], 1));
                    }
                    else{
                        const backgroundTexture = ditherOutputWebglTexture;
                        WebGlContourFilter.outlineImage2Background(transformCanvasWebGl.gl, outline1OutputTexture, imageWidth, imageHeight, radiusPercent, paletteColorsVec, backgroundTexture, this.selectedOutlineColorMode);
                        //don't delete ditherOutputTexture, since it is deleted automatically by filters after dither changed
                    }
                    transformCanvasWebGl.gl.deleteTexture(outline1OutputTexture);
                });
            },
            imageEdgeFilterAction: function(){
                const strength = this.imageOutlineEdgeStrengths[this.selectedImageOutlineStrength];
                
                this.requestResourcesForOutline((imageWidth, imageHeight, sourceWebglTexture, ditherOutputWebglTexture, transformCanvasWebGl, paletteColorsVec)=>{
                    //better to use source texture as input instead of dither results, because there will be less noise in image outline 
                    const inputTexture = sourceWebglTexture;
                    
                    if(this.isImageOutlineFixedColor){
                        WebGlEdgeFilter.edgeFixed(transformCanvasWebGl.gl, inputTexture, imageWidth, imageHeight, strength, this.selectedImageOutlineEdgeThickness, ColorPicker.colorsToVecArray([this.fixedOutlineColor], 1));
                    }
                    else{
                        const backgroundTexture = ditherOutputWebglTexture;
                        WebGlEdgeFilter.edgeBackground(transformCanvasWebGl.gl, inputTexture, imageWidth, imageHeight, strength, paletteColorsVec, backgroundTexture, this.selectedImageOutlineEdgeThickness, this.selectedOutlineColorMode);
                        //don't delete ditherOutputTexture, since it is deleted automatically by filters after dither changed
                    }
                });
            },
            /**
             * Color picker stuff for fixed color
             */
            colorPickerValueChanged: function(colorHex){
                this.fixedOutlineColor = colorHex;
            },
            colorPickerDone: function(colorHex){
                this.fixedOutlineColor = colorHex;
                this.shouldShowColorPicker = false;
            },
        },
    });
})(window.Vue, App.Canvas, App.ImageFiltersModel, App.WebGlContourFilter, App.ColorPicker, App.WebGlEdgeFilter, App.WebGl);