<div class="controls-tab-container">
    <div class="spread-content">
        <label>Show source image
            <input type="checkbox" v-model="showOriginalImage"/>
        </label>
    </div>
    <fieldset>
        <legend>Filters <small>(pre dither)</small></legend>
        <div class="spread-content">
            <label>Pixelate
                <select v-model.number="selectedPixelateImageZoom">
                    <option v-for="(pixelateZoom, index) in pixelateImageZooms" v-bind:value="index">{{pixelateZoom.title}}</option>
                </select>
            </label>
            <?php IndexView::cyclePropertyList('selectedPixelateImageZoom', 'pixelateImageZooms', 'pixelation value'); ?>
        </div>
        <div class="spread-content" v-if="areCanvasFiltersEnabled">
            <label>Contrast
                <select v-model.number="selectedImageContrastIndex">
                    <option v-for="(percentage, index) in contrastFilterValues" v-bind:value="index">{{`${percentage}%`}}</option>
                </select>
            </label>
            <?php IndexView::cyclePropertyList('selectedImageContrastIndex', 'contrastFilterValues', 'contrast amount'); ?>
        </div>
        <div class="spread-content" v-if="areCanvasFiltersEnabled">
            <label>Saturation
                <select v-model.number="selectedImageSaturationIndex">
                <option v-for="(percentage, index) in imageFilterValues" v-bind:value="index">{{`${percentage}%`}}</option>
                </select>
            </label>
            <?php IndexView::cyclePropertyList('selectedImageSaturationIndex', 'imageFilterValues', 'saturation amount'); ?>
        </div>
        <div class="spread-content" v-if="areCanvasFiltersEnabled">
            <label for="hue-rotation-range">Hue rotation</label><input id="hue-rotation-range" type="range" list="hue-rotation-tickmarks" v-model.number="hueRotationValue" step="1" min="0" max="359"/>
            <input type="number" v-model.number="hueRotationValue" step="1" min="0" max="359"/>
            <datalist id="hue-rotation-tickmarks">
                <option v-for="i in 12" :value="(i-1)*30"/>
            </datalist>
        </div>
        <div class="spread-content" v-if="isWebglEnabled">
            <label>Denoise
                <select v-model.number="selectedBilateralFilterValue">
                <option v-for="(value, index) in bilateralFilterValues" v-bind:value="index">{{value < 0 ? 'None' : index}}</option>
                </select>
            </label>
            <?php IndexView::cyclePropertyList('selectedBilateralFilterValue', 'bilateralFilterValues', 'bilateral filter amount'); ?>
        </div>
        <div class="spread-content" v-if="isSmoothingEnabled">
            <label>Smoothing
                <select v-model.number="selectedImageSmoothingRadiusBefore">
                    <option v-for="(smoothingValue, index) in imageSmoothingValues" v-bind:value="index">{{smoothingValue === 0 ? 'None' : smoothingValue}}</option>
                </select>
            </label>
            <?php IndexView::cyclePropertyList('selectedImageSmoothingRadiusBefore', 'imageSmoothingValues', 'smoothing value'); ?>
        </div>
    </fieldset>
    <fieldset v-if="isWebglEnabled">
        <legend>Filters <small>(post dither)</small></legend>
        <div class="spread-content">
            <label>Denoise
                <select v-model.number="selectedBilateralFilterValueAfter">
                <option v-for="(value, index) in bilateralFilterValues" v-bind:value="index">{{value < 0 ? 'None' : index}}</option>
                </select>
            </label>
            <?php IndexView::cyclePropertyList('selectedBilateralFilterValueAfter', 'bilateralFilterValues', 'bilateral filter amount'); ?>
        </div>
        <div class="spread-content" v-if="isSmoothingEnabled">
            <label>Smoothing
                <select v-model.number="selectedImageSmoothingRadiusAfter">
                    <option v-for="(smoothingValue, index) in imageSmoothingValues" v-bind:value="index">{{smoothingValue === 0 ? 'None' : smoothingValue}}</option>
                </select>
            </label>
            <?php IndexView::cyclePropertyList('selectedImageSmoothingRadiusAfter', 'imageSmoothingValues', 'smoothing value'); ?>
        </div>
    </fieldset>
</div>