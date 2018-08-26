//color picker component for color dither color list

import ColorPicker from '../color-picker.js';
import PixelMath from '../../shared/pixel-math.js';


export default {
    name: 'color-input',
    template: document.getElementById('color-input-component'),
    props: ['colorIndex', 'colorValue', 'idPrefix', 'isSelected', 'handleColorDragstart', 'handleColorDragover', 'handleColorDragend', 'isDisabled', 'draggedIndex', 'label', 'onClick'],
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