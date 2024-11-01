<template>
    <fieldset>
        <legend>Color substitution</legend>
        <color-picker 
            v-if="shouldShowColorPicker" 
            :should-live-update="isColorPickerLivePreviewEnabled" 
            :selected-color="colorPickerSelectedColor" 
            @update:modelValue="colorPickerValueChanged" 
            @ok="colorPickerOk" 
            @cancel="colorPickerCanceled" 
        />
        <div :class="$style.colorReplaceContainer">
            <color-input 
                label="Black" 
                id-prefix="bw" 
                :is-selected="shouldShowColorPicker && colorPickerColorIndex===0" 
                :on-click="() => colorInputClicked(0)" 
                :color-value="colorReplaceColors[0]" 
                color-index.number="0" 
            />
            <color-input 
                label="White" 
                id-prefix="bw" 
                :is-selected="shouldShowColorPicker && colorPickerColorIndex===1" 
                :on-click="() => colorInputClicked(1)" 
                :color-value="colorReplaceColors[1]" 
                color-index.number="1" 
            />
            <button 
                class="btn btn-default btn-sm" 
                @click="resetColorReplace" 
                v-show="areColorReplaceColorsChangedFromDefaults" 
                title="Reset colors to black and white"
            >
                Reset
            </button>
        </div>
    </fieldset>
</template>

<style lang="scss" module>
    .colorReplaceContainer{
        display: flex;
        flex-wrap: wrap;
        .btn{
            flex-basis: 25%;
            margin-bottom: variables.$colors_container_margin_bottom;
        }
    }
</style>

<script>
import ColorPicker from '../color-picker.js';

import ColorPickerComponent from './color-picker.vue';
import ColorInput from './color-input.vue';

export default {
    props: {
        modelValue: {
            type: Array,
            required: true,
        },
        isColorPickerLivePreviewEnabled: {
            type: Boolean,
            required: true,
        },
    },
    components: {
        ColorPicker: ColorPickerComponent,
        ColorInput
    },
    data(){
        return {
            shouldShowColorPicker: false,
            colorPickerColorIndex: 0,
            hasColorPickerChangedTheColor: false,
        };
    },
    computed: {
        colorReplaceColors(){
            return this.modelValue;
        },
        colorPickerSelectedColor(){
            return this.colorReplaceColors[this.colorPickerColorIndex];
        },
        areColorReplaceColorsChangedFromDefaults(){
            return !ColorPicker.areColorArraysIdentical(ColorPicker.defaultBwColors(), this.colorReplaceColors);
        },
    },
    methods: {
        colorInputClicked(colorReplaceIndex){
            if(this.shouldShowColorPicker){
                return;
            }
            this.colorPickerColorIndex = colorReplaceIndex;
            this.hasColorPickerChangedTheColor = false,
            this.shouldShowColorPicker = true;
        },
        colorPickerValueChanged(colorHex){
            this.hasColorPickerChangedTheColor = true,
            this.updateColor(this.colorPickerColorIndex, colorHex);
        },
        colorPickerOk(selectedColorHex){
            //this will be true when color picker live update is disabled and the color has been changed
            if(this.colorReplaceColors[this.colorPickerColorIndex] !== selectedColorHex){
                this.updateColor(this.colorPickerColorIndex, selectedColorHex);
            }
            this.shouldShowColorPicker = false;
        },
        colorPickerCanceled(previousColorHex){
            if(this.hasColorPickerChangedTheColor){
                this.updateColor(this.colorPickerColorIndex, previousColorHex);
            }
            this.shouldShowColorPicker = false;
        },
        updateColor(index, colorHex){
            const colorsCopy = this.colorReplaceColors.slice();
            colorsCopy[index] = colorHex;
            this.$emit('update:modelValue', colorsCopy);
        },
        resetColorReplace(){
            this.$emit('update:modelValue', ColorPicker.defaultBwColors());
        },
    }
};
</script>