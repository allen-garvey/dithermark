<div>
    <div class="color-picker-container">
        <photoshop-picker :value="selectedColor" @input="bubbleEvent" @ok="bubbleEvent" @cancel="bubbleEvent" />
    </div>
    <div class="color-picker-overlay"></div>
</div>