<template>
    <fieldset v-if="isImageOutlineFilterEnabled">
        <legend>Outline</legend>
        <div class="spread-content">
            <div class="label-align">
                <label for="image-outline-filter-type">Type</label>
                <select id="image-outline-filter-type" v-model.number="selectedImageOutlineType">
                    <option v-for="(value, index) in imageOutlineTypes" :value="index" :key="index">{{value.title}}</option>
                </select>
            </div>
            <cycle-property-list model-name="outline type" v-model="selectedImageOutlineType" :array-length="imageOutlineTypes.length" />
        </div>
        <div class="spread-content" v-if="isImageOutlineFilterActive">
            <div class="label-align">
                <label for="image-outline-filter-color-mode">Color</label>
                <select id="image-outline-filter-color-mode" v-model.number="selectedOutlineColorMode">
                    <option v-for="(value, index) in imageOutlineColorModes" :value="index" :key="index">{{value.title}}</option>
                </select>
            </div>
            <cycle-property-list model-name="outline color mode" v-model="selectedOutlineColorMode" :array-length="imageOutlineColorModes.length" />
        </div>
        <div class="spread-content" v-if="isImageEdgeFilterActive">
            <div class="label-align">
                <label for="image-edge-filter-thickness">Thickness</label>
                <select id="image-edge-filter-thickness" v-model.number="selectedImageOutlineEdgeThickness">
                    <option v-for="(value, index) in imageOutlineEdgeThicknesses" :value="index" :key="index">{{value}}</option>
                </select>
            </div>
            <cycle-property-list model-name="edge thickness" v-model="selectedImageOutlineEdgeThickness" :array-length="imageOutlineEdgeThicknesses.length" />
        </div>
        <div class="spread-content" v-if="isImageEdgeFilterActive">
            <div class="label-align">
                <label for="image-edge-filter-strength">Threshold</label>
                <select id="image-edge-filter-strength" v-model.number="selectedImageOutlineStrength">
                    <option v-for="(value, index) in imageOutlineEdgeStrengths" :value="index" :key="index">{{value}}</option>
                </select>
            </div>
            <cycle-property-list model-name="edge strength" v-model="selectedImageOutlineStrength" :array-length="imageOutlineEdgeStrengths.length" />
        </div>
        <div class="spread-content" v-if="isImageContourFilterActive">
            <div class="label-align">
                <label for="image-contour-filter-radius">Radius</label>
                <select id="image-contour-filter-radius" v-model.number="selectedImageOutlineContourRadiusPercent">
                    <option v-for="(value, index) in imageOutlineContourRadiusPercentages" :value="index" :key="index">{{value}}</option>
                </select>
            </div>
            <cycle-property-list model-name="outline radius" v-model="selectedImageOutlineContourRadiusPercent" :array-length="imageOutlineContourRadiusPercentages.length" />
        </div>
        <div class="spread-content" v-if="isImageOutlineFilterActive &amp;&amp; areOutlineBlendModesSupported">
            <div class="label-align">
                <label for="image-outline-filter-blend-mode">Blend mode</label>
                <select id="image-outline-filter-blend-mode" v-model.number="selectedOutlineFixedColorBlendMode">
                    <option v-for="(mode, index) in imageOutlineFixedColorBlendModes" :value="index" :key="index">{{mode.title}}</option>
                </select>
            </div>
            <cycle-property-list model-name="blend mode" v-model="selectedOutlineFixedColorBlendMode" :array-length="imageOutlineFixedColorBlendModes.length" />
        </div>
        <div class="spread-content" v-if="isImageOutlineFilterActive">
            <div class="label-align">
                <label for="image-outline-filter-opacity">Opacity</label>
                <select id="image-outline-filter-opacity" v-model.number="selectedOutlineOpacity">
                    <option v-for="(value, index) in outlineOpacities" :value="index" :key="index">{{Math.round(value * 100)}}%</option>
                </select>
            </div>
            <cycle-property-list model-name="outline opacity" v-model="selectedOutlineOpacity" :array-length="outlineOpacities.length" />
        </div>
        <div v-if="isImageOutlineFilterActive &amp;&amp; isImageOutlineFixedColor">
            <color-picker v-if="shouldShowColorPicker" :should-live-update="isColorPickerLivePreviewEnabled" :selected-color="fixedOutlineColor" @input="colorPickerValueChanged" @ok="colorPickerDone" @cancel="colorPickerDone" />
            <div class="spread-content image-outline-color-input">
                <color-input label="Color" id-prefix="outline-color" :is-selected="shouldShowColorPicker" :on-click="()=>{shouldShowColorPicker = true;}" :color-value="fixedOutlineColor" />
            </div>
        </div>
    </fieldset>
</template>

<script>
import Canvas from '../canvas.js';
import ImageFiltersModel from '../image-filters-model.js';
import WebGlContourFilter from '../webgl-contour-filter.js';
import ColorPicker from '../color-picker.js';
import WebGlEdgeFilter from '../webgl-edge-filter.js';
import WebGl from '../webgl.js';

import CyclePropertyList from './cycle-property-list.vue';
import ColorPickerComponent from './color-picker.vue';
import ColorInput from './color-input.vue';


let outlineFilterCanvas;

export default {
    props: {
        isImageOutlineFilterEnabled: {
            type: Boolean,
            required: true,
        },
        isColorPickerLivePreviewEnabled: {
            type: Boolean,
            required: true,
        },
        requestOutlineDisplay: {
            type: Function,
            required: true,
        },
        requestResourcesForOutline: {
            type: Function,
            required: true,
        },
        displayImage: {
            type: Function,
            required: true,
        },
    },
    components: {
        CyclePropertyList,
        'color-picker': ColorPickerComponent,
        ColorInput,
    },
    data(){
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
        isImageOutlineFilterActive(){
            return this.isImageOutlineFilterEnabled && this.selectedImageOutlineTypeId !== 0;
        },
        isImageEdgeFilterActive(){
            return this.isImageOutlineFilterActive && this.selectedImageOutlineTypeId === 1;
        },
        isImageContourFilterActive(){
            return this.isImageOutlineFilterActive && this.selectedImageOutlineTypeId === 2;
        },
        selectedImageOutlineTypeId(){
            return this.imageOutlineTypes[this.selectedImageOutlineType].id;
        },
        isImageOutlineFixedColor(){
            return this.imageOutlineColorModes[this.selectedOutlineColorMode].id === 1;
        },
        areOutlineBlendModesSupported(){
            return this.imageOutlineFixedColorBlendModes.length > 1;
        },
    },
    watch: {
        isImageOutlineFilterActive(newValue, oldValue){
            //clear outline canvas when not active to free up memory
            if(!newValue && outlineFilterCanvas){
                Canvas.clear(outlineFilterCanvas);
            }
        },
        selectedImageOutlineContourRadiusPercent(newValue, oldValue){
            if(newValue !== oldValue){
                this.imageOutlineFilterAction();
                this.displayImage();
            }
        },
        selectedOutlineColorMode(newValue, oldValue){
            if(newValue !== oldValue){
                this.imageOutlineFilterAction();
                this.displayImage();
            }
        },
        fixedOutlineColor(newValue, oldValue){
            if(newValue !== oldValue){
                this.imageOutlineFilterAction();
                this.displayImage();
            }
        },
        selectedOutlineFixedColorBlendMode(newValue, oldValue){
            if(newValue !== oldValue){
                this.imageOutlineFilterAction();
                this.displayImage();
            }
        },
        selectedImageOutlineType(newValue, oldValue){
            if(newValue !== oldValue){
                this.imageOutlineFilterAction();
                this.displayImage();
            }
        },
        selectedImageOutlineStrength(newValue, oldValue){
            if(newValue !== oldValue){
                this.imageOutlineFilterAction();
                this.displayImage();
            }
        },
        selectedImageOutlineEdgeThickness(newValue, oldValue){
            if(newValue !== oldValue){
                this.imageOutlineFilterAction();
                this.displayImage();
            }
        },
        selectedOutlineOpacity(newValue, oldValue){
            if(newValue !== oldValue){
                this.imageOutlineFilterAction();
                this.displayImage();
            }
        },
    },
    methods: {
        getCanvas(){
            return outlineFilterCanvas;
        },
        initializeOutlineFilterCanvas(){
            outlineFilterCanvas = Canvas.create();
            //remove unsupported canvas blend modes
            this.imageOutlineFixedColorBlendModes = this.imageOutlineFixedColorBlendModes.filter((blendMode)=>{
                return Canvas.isBlendModeSupported(outlineFilterCanvas, blendMode.value);
            });
            //reset to default blend mode
            Canvas.resetBlendMode(outlineFilterCanvas);
        },
        imageOutlineFilterAction(){
            if(!this.isImageOutlineFilterActive){
                return;
            }
            if(this.isImageContourFilterActive){
                this.imageContourFilterAction();
            }
            else{
                this.imageEdgeFilterAction();
            }
            if(!outlineFilterCanvas){
                this.initializeOutlineFilterCanvas();
            }

            //merge on top of transformCanvas
            const blendMode = this.areOutlineBlendModesSupported ? this.imageOutlineFixedColorBlendModes[this.selectedOutlineFixedColorBlendMode].value : null;
            const outlineOpacity = this.outlineOpacities[this.selectedOutlineOpacity];
            
            this.requestOutlineDisplay((transformCanvas, transformCanvasWebGl)=>{
                Canvas.copy(transformCanvas, outlineFilterCanvas);
                Canvas.merge(transformCanvasWebGl, outlineFilterCanvas, outlineOpacity, blendMode);
            });
        },
        imageContourFilterAction(){
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
        imageEdgeFilterAction(){
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
        colorPickerValueChanged(colorHex){
            this.fixedOutlineColor = colorHex;
        },
        colorPickerDone(colorHex){
            this.fixedOutlineColor = colorHex;
            this.shouldShowColorPicker = false;
        },
    },
};
</script>