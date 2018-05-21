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
    <div class="spread-content" v-if="areCanvasFiltersSupported">
        <label>Contrast
            <select v-model.number="selectedImageContrastIndex">
                <option v-for="(percentage, index) in contrastFilterValues" v-bind:value="index">{{`${percentage}%`}}</option>
            </select>
        </label>
        <?php IndexView::cyclePropertyList('selectedImageContrastIndex', 'contrastFilterValues', 'contrast amount'); ?>
    </div>
    <div class="spread-content" v-if="areCanvasFiltersSupported">
        <label>Saturation
            <select v-model.number="selectedImageSaturationIndex">
            <option v-for="(percentage, index) in imageFilterValues" v-bind:value="index">{{`${percentage}%`}}</option>
            </select>
        </label>
        <?php IndexView::cyclePropertyList('selectedImageSaturationIndex', 'imageFilterValues', 'saturation amount'); ?>
    </div>
    <div class="spread-content" v-if="isWebglSupported">
        <label>Bilateral filter
            <select v-model.number="selectedBilateralFilterValue">
            <option v-for="(value, index) in bilateralFilterValues" v-bind:value="index">{{value < 0 ? 'None' : value}}</option>
            </select>
        </label>
        <?php IndexView::cyclePropertyList('selectedBilateralFilterValue', 'bilateralFilterValues', 'bilateral filter amount'); ?>
    </div>
    <div class="spread-content" v-if="isWebglSupported">
        <label>Smoothing (before dithering)
            <select v-model.number="selectedImageSmoothingRadiusBefore">
                <option v-for="(smoothingValue, index) in imageSmoothingValues" v-bind:value="index">{{smoothingValue}}</option>
            </select>
        </label>
        <?php IndexView::cyclePropertyList('selectedImageSmoothingRadiusBefore', 'imageSmoothingValues', 'smoothing value'); ?>
    </div>
    <div class="spread-content" v-if="isWebglSupported">
        <label>Smoothing (after dithering)
            <select v-model.number="selectedImageSmoothingRadiusAfter">
                <option v-for="(smoothingValue, index) in imageSmoothingValues" v-bind:value="index">{{smoothingValue}}</option>
            </select>
        </label>
        <?php IndexView::cyclePropertyList('selectedImageSmoothingRadiusAfter', 'imageSmoothingValues', 'smoothing value'); ?>
    </div>
</fieldset>