<template>
    <div class="color-container" :draggable="draggableAttributeValue" @dragstart="optionalHandler($event, handleColorDragstart)" @dragover="optionalHandler($event, handleColorDragover)" @drop="handleColorDrop($event)" @dragend="optionalHandler($event, handleColorDragend)" :class="{'dragged': isBeingDragged, 'color-disabled': isDisabled, 'selected': isSelected}" :style="{'background-color': colorValue, 'color': textColor}">
        <label :for="colorInputId">{{labelText}}</label>
        <div class="faux-color-input-container">
            <input :id="colorInputId" type="button" class="faux-color-input" @click="inputClicked" :style="{'background-color': colorValue}" :class="{disabled: isDisabled}"/>
        </div>
    </div>
</template>

<script>
//color picker component for color dither color list

import ColorPicker from '../color-picker.js';
import PixelMath from '../../shared/pixel-math.js';
import { Script } from 'vm';


export default {
    name: 'color-input',
    props: {
        colorIndex: {
            type: Number,
        }, 
        colorValue: {
            type: String,
            required: true,
        }, 
        idPrefix: {
            type: String,
            required: true,
        }, 
        isSelected: {
            type: Boolean,
            required: true,
        }, 
        handleColorDragstart: {
            type: Function,
        },
        handleColorDragover: {
            type: Function,
        },
        handleColorDragend:{
            type: Function,
        },
        isDisabled: {
            type: Boolean,
            default: false,
        },
        draggedIndex: {
            type: Number,
        },
        label: {
            type: String,
        },
        onClick: {
            type: Function,
            required: true,
        }
    },
    computed: {
        colorInputId(){
            return `${this.idPrefix}__color-input__${this.colorIndex}`;
        },
        //so text is visible on light color backgrounds
        textColor(){
            const lightness = PixelMath.lightness(ColorPicker.pixelFromHex(this.colorValue));
            if(lightness >= 127){
                return '#000';
            }
            return '#fff';
        },
        draggableAttributeValue(){
            return this.handleColorDragstart ? 'true' : 'false';
        },
        isBeingDragged(){
            return this.draggedIndex !== undefined && this.colorIndex === this.draggedIndex;
        },
        labelText(){
            return this.label || this.colorIndex + 1;
        },
    },
    methods: {
        handleColorDrop(e){
            e.preventDefault();
        },
        optionalHandler(e, handler){
            if(handler){
                handler(e, this.colorIndex);
            }
        },
        inputClicked(){
            if(this.isDisabled){
                return;
            }
            this.onClick();
        },
    },
};
</script>