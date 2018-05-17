<div class="spread-content">
    <label>Show source image
        <input type="checkbox" v-model="showOriginalImage"/>
    </label>
</div>
<fieldset>
    <legend>Filters</legend>
    <div class="spread-content">
        <label>Pixelate
            <select v-model.number="selectedPixelateImageZoom">
                <option v-for="(pixelateZoom, index) in pixelateImageZooms" v-bind:value="index">{{pixelateZoom.title}}</option>
            </select>
        </label>
        <?php IndexView::cyclePropertyList('selectedPixelateImageZoom', 'pixelateImageZooms', 'pixelation value'); ?>
    </div>
    <div class="spread-content">
        <label>Increase contrast
            <input type="checkbox" v-model="increaseImageContrast"/>
        </label>
        <label>Increase saturation
            <input type="checkbox" v-model="increaseImageSaturation"/>
        </label>
    </div>
    <?php if(ENABLE_IMAGE_SMOOTHING): ?>
        <div class="spread-content">
            <label>Smoothing (before dithering)
                <select v-model.number="selectedImageSmoothingRadiusBefore">
                    <option v-for="(smoothingValue, index) in imageSmoothingValues" v-bind:value="index">{{smoothingValue}}</option>
                </select>
            </label>
            <?php IndexView::cyclePropertyList('selectedImageSmoothingRadiusBefore', 'imageSmoothingValues', 'smoothing value'); ?>
        </div>
        <div class="spread-content">
            <label>Smoothing (after dithering)
                <select v-model.number="selectedImageSmoothingRadiusAfter">
                    <option v-for="(smoothingValue, index) in imageSmoothingValues" v-bind:value="index">{{smoothingValue}}</option>
                </select>
            </label>
            <?php IndexView::cyclePropertyList('selectedImageSmoothingRadiusAfter', 'imageSmoothingValues', 'smoothing value'); ?>
        </div>
    <?php endif; ?>
</fieldset>