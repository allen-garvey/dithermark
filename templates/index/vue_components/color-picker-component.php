<div class="color-container" :draggable="draggableAttributeValue" @dragstart="optionalHandler($event, handleColorDragstart)" @dragover="optionalHandler($event, handleColorDragover)" @drop="handleColorDrop($event)" @dragend="optionalHandler($event, handleColorDragend)" :class="{'dragged': isBeingDragged, 'color-disabled': isDisabled}" :style="{'background-color': colorValue, 'color': textColor}">
    <label v-bind:for="colorPickerId">{{labelText}}</label>
    <input type="color" v-bind:id="colorPickerId" v-model="colorValue" v-bind:disabled="isDisabled" />
</div>