<div class="color-container" :draggable="draggableAttributeValue" @dragstart="optionalHandler($event, handleColorDragstart)" @dragover="optionalHandler($event, handleColorDragover)" @drop="handleColorDrop($event)" @dragend="optionalHandler($event, handleColorDragend)" :class="{'dragged': isBeingDragged, 'color-disabled': isDisabled}" :style="{'background-color': colorValue, 'color': textColor}">
    <label :for="colorInputId">{{labelText}}</label>
    <div class="faux-color-input-container">
        <input :id="colorInputId" type="button" class="faux-color-input" @click="inputClicked" :style="{'background-color': colorValue}" :class="{disabled: isDisabled}"/>
    </div>
</div>