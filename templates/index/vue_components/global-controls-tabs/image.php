<div class="spread-content">
    <label>Show source image
        <input type="checkbox" v-model="showOriginalImage"/>
    </label>
</div>
<div class="spread-content">
    <label>Pixelate image
        <select v-model.number="selectedPixelateImageZoom">
            <option v-for="(pixelateZoom, index) in pixelateImageZooms" v-bind:value="index">{{pixelateZoom.title}}</option>
        </select>
    </label>
    <?php IndexView::cyclePropertyList('selectedPixelateImageZoom', 'pixelateImageZooms', 'pixelation value'); ?>
</div>