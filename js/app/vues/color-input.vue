<template>
    <div 
        :draggable="draggableAttributeValue" 
        @dragstart="optionalHandler($event, handleColorDragstart)" 
        @dragover="optionalHandler($event, handleColorDragover)" 
        @drop="handleColorDrop($event)" 
        @dragend="optionalHandler($event, handleColorDragend)" 
        :class="{[$style.colorContainer]: true, [$style.dragged]: isBeingDragged, [$style.colorDisabled]: isDisabled, [$style.selected]: isSelected}" 
        :style="{'background-color': colorValue, 'color': textColor}"
    >
        <label :for="colorInputId">{{labelText}}</label>
        <div :class="$style.fauxColorInputContainer">
            <input 
                :id="colorInputId" 
                type="button" 
                @click="inputClicked" 
                :style="{'background-color': colorValue}" 
                :class="{[$style.fauxColorInput]: true, disabled: isDisabled}"
            />
        </div>
    </div>
</template>

<style lang="scss" module>

.colorContainer{
    //so currently selected color is not hidden by .color-picker-overlay
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-basis: 110px;
    margin: 0 13px variables.$colors_container_margin_bottom 0;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    padding: 4px;

    //z-index should be higher than .color-picker-overlay
    &.selected{
        z-index: 3;
    }
    
    &.dragged, &.colorDisabled{
        opacity: 0.4;
    }
    label{
        padding: 0;
    }

    &[draggable="true"]{
        cursor: move;
        .fauxColorInputContainer{
            margin-right: 26px;
        }
    }
    &:focus-within{
        outline: 5px auto -webkit-focus-ring-color;
        outline-offset: -2px;
    }
}

//input[type="button"] that's meant to look and act like color input
.fauxColorInputContainer{
    border: 5px solid white;
    border-radius: 6px;
    display: inline-block;
    &:focus-within{
        outline: 5px auto -webkit-focus-ring-color;
        border-color: variables.$highlight_color;
        outline-offset: -2px;
    }
}

.fauxColorInput{
    position: relative;
    z-index: 1;
    width: 46px;
    height: 24px;
    border: 1px solid black;
    border-radius: 4px;
    cursor: pointer;

    &:before {
        content: " ";
        position: absolute;
        z-index: -1;
        top: 5px;
        left: 5px;
        right: 5px;
        bottom: 5px;
        border-radius: 4px;
        border: 5px solid white;
      }

    &.disabled{
        cursor: not-allowed;
    }
}

</style>

<script>
//color picker component for color dither color list

import ColorPicker from '../color-picker.js';
import {lightness} from '../../shared/pixel-math-lite.js';


export default {
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
            const colorLightness = lightness(ColorPicker.pixelFromHex(this.colorValue));
            if(colorLightness >= 127){
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