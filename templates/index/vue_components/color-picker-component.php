<div class="color-container" draggable="true" @dragstart="handleColorDragstart($event, colorIndex)" @dragover="handleColorDragover($event, colorIndex)" @drop="handleColorDrop($event, colorIndex)" @dragend="handleColorDragend" :class="{'dragged': isBeingDragged, 'color-disabled': isDisabled}" :style="{'background-color': colorValue, 'color': textColor}">
    <label v-bind:for="colorPickerId">{{colorIndex+1}}</label>
    <input type="color" v-bind:id="colorPickerId" v-model="colorValue" v-bind:disabled="isDisabled" />
</div>