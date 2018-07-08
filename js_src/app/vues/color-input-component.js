//color picker component for color dither color list
(function(Vue, ColorPicker){
    //copied from PixelMath module, since nothing else in app files uses pixelmath
    function pixelLightness(pixel){
        const max = Math.max(pixel[0], pixel[1], pixel[2]);
        const min = Math.min(pixel[0], pixel[1], pixel[2]);
        return Math.floor((max + min) / 2.0);
    }

    Vue.component('color-input', {
        template: document.getElementById('color-input-component'),
        props: ['colorIndex', 'colorValue', 'idPrefix', 'isSelected', 'handleColorDragstart', 'handleColorDragover', 'handleColorDragend', 'isDisabled', 'draggedIndex', 'label', 'onClick'],
        computed: {
            colorInputId: function(){
                return `${this.idPrefix}__color-input__${this.colorIndex}`;
            },
            //so text is visible on light color backgrounds
            textColor: function(){
                const lightness = pixelLightness(ColorPicker.pixelFromHex(this.colorValue));
                if(lightness >= 127){
                    return '#000';
                }
                return '#fff';
            },
            draggableAttributeValue: function(){
                return this.handleColorDragstart ? 'true' : 'false';
            },
            isBeingDragged: function(){
                return this.draggedIndex !== undefined && this.colorIndex === this.draggedIndex;
            },
            labelText: function(){
                return this.label || this.colorIndex + 1;
            },
        },
        methods: {
            handleColorDrop: function(e){
                e.preventDefault();
            },
            optionalHandler: function(e, handler){
                if(handler){
                    handler(e, this.colorIndex);
                }
            },
            inputClicked: function(){
                if(this.isDisabled){
                    return;
                }
                this.onClick();
            },
        },
    });
    
    
})(window.Vue, App.ColorPicker);