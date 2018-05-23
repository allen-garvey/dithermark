<div v-scroll-into-view>
    <div class="color-picker-container">
        <photoshop-picker :value="selectedColor" @input="bubbleEvent('input', $event)" @ok="bubbleEvent('ok', $event)" @cancel="bubbleEvent('cancel', $event)" />
    </div>
    <div class="color-picker-overlay"></div>
</div>