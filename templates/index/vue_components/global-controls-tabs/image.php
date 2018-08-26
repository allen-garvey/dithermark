<div class="controls-tab-container">
    <div class="spread-content">
        <label>Show source image
            <input type="checkbox" v-model="showOriginalImage"/>
        </label>
    </div>
    <fieldset>
        <legend>Filters <small>(pre dither)</small></legend>
        <div class="spread-content">
            <div class="label-align">
                <label for="pixelate-dropdown">Pixelate</label>
                <select id="pixelate-dropdown" v-model.number="selectedPixelateImageZoom">
                    <option v-for="(pixelateZoom, index) in pixelateImageZooms" :value="index">{{imageFilterSteppedDropdownOption(index)}}</option>
                </select>
            </div>
            <cycle-property-list model-name="pixelation value" v-model="selectedPixelateImageZoom" :array-length="pixelateImageZooms.length" />
        </div>
        <div class="spread-content" v-if="areCanvasFiltersEnabled">
            <div class="label-align">
                <label for="brightness-dropdown">Brightness</label>
                <select id="brightness-dropdown" v-model.number="selectedImageBrightnessIndex">
                    <option v-for="(percentage, index) in canvasFilterValues" :value="index">{{`${percentage}%`}}</option>
                </select>
            </div>
            <cycle-property-list model-name="brightness percentage" v-model="selectedImageBrightnessIndex" :array-length="canvasFilterValues.length" />
        </div>
        <div class="spread-content" v-if="areCanvasFiltersEnabled">
            <div class="label-align">
                <label for="contrast-dropdown">Contrast</label>
                <select id="contrast-dropdown" v-model.number="selectedImageContrastIndex">
                    <option v-for="(percentage, index) in canvasFilterValues" :value="index">{{`${percentage}%`}}</option>
                </select>
            </div>
            <cycle-property-list model-name="contrast percentage" v-model="selectedImageContrastIndex" :array-length="canvasFilterValues.length" />
        </div>
        <div class="spread-content" v-if="areCanvasFiltersEnabled">
            <div class="label-align">
                <label for="saturation-dropdown">Saturation</label>
                <select id="saturation-dropdown" v-model.number="selectedImageSaturationIndex">
                    <option v-for="(percentage, index) in canvasFilterValues" :value="index">{{`${percentage}%`}}</option>
                </select>
            </div>
            <cycle-property-list model-name="saturation percentage" v-model="selectedImageSaturationIndex" :array-length="canvasFilterValues.length" />
        </div>
        <div class="spread-content" v-if="areCanvasFiltersEnabled">
            <label for="hue-rotation-range">Hue rotation</label>
            <input id="hue-rotation-range" type="range" list="hue-rotation-tickmarks" v-model.number="hueRotationValue" step="1" min="0" max="359"/>
            <input type="number" v-model.number="hueRotationValue" step="1" min="0" max="359"/>
            <datalist id="hue-rotation-tickmarks">
                <option v-for="i in 12" :value="(i-1)*30"/>
            </datalist>
        </div>
        <div class="spread-content" v-if="isWebglEnabled">
            <div class="label-align">
                <label for="denoise-before-dropdown">Denoise</label>
                <select id="denoise-before-dropdown" v-model.number="selectedBilateralFilterValueBefore">
                    <option v-for="(value, index) in bilateralFilterValues" :value="index">{{imageFilterSteppedDropdownOption(index)}}</option>
                </select>
            </div>
            <cycle-property-list model-name="bilateral filter amount" v-model="selectedBilateralFilterValueBefore" :array-length="bilateralFilterValues.length" />
        </div>
        <div class="spread-content" v-if="isSmoothingEnabled">
            <div class="label-align">
                <label for="smoothing-before-dropdown">Smooth</label>
                <select id="smoothing-before-dropdown" v-model.number="selectedImageSmoothingRadiusBefore">
                    <option v-for="(smoothingValue, index) in imageSmoothingValues" :value="index">{{imageFilterSteppedDropdownOption(smoothingValue)}}</option>
                </select>
            </div>
            <cycle-property-list model-name="smoothing value" v-model="selectedImageSmoothingRadiusBefore" :array-length="imageSmoothingValues.length" />
        </div>
    </fieldset>
    <fieldset v-if="isWebglEnabled">
        <legend>Filters <small>(post dither)</small></legend>
        <div class="spread-content">
            <div class="label-align">
                <label for="denoise-after-dropdown">Denoise</label>
                <select id="denoise-after-dropdown" v-model.number="selectedBilateralFilterValueAfter">
                    <option v-for="(value, index) in bilateralFilterValues" :value="index">{{imageFilterSteppedDropdownOption(index)}}</option>
                </select>
            </div>
            <cycle-property-list model-name="bilateral filter amount" v-model="selectedBilateralFilterValueAfter" :array-length="bilateralFilterValues.length" />
        </div>
        <div class="spread-content" v-if="isSmoothingEnabled">
            <div class="label-align">
                <label for="smoothing-after-dropdown">Smooth</label>
                <select id="smoothing-after-dropdown" v-model.number="selectedImageSmoothingRadiusAfter">
                    <option v-for="(smoothingValue, index) in imageSmoothingValues" :value="index">{{imageFilterSteppedDropdownOption(smoothingValue)}}</option>
                </select>
            </div>
            <cycle-property-list model-name="smoothing value" v-model="selectedImageSmoothingRadiusAfter" :array-length="imageSmoothingValues.length" />
        </div>
    </fieldset>
    <outline-filters-controls ref="outlineFilterControls" :display-image="zoomImage" :is-image-outline-filter-enabled="isImageOutlineFilterEnabled" :is-color-picker-live-preview-enabled="isColorPickerLivePreviewEnabled" :request-outline-display="onOutlineFilterDisplayRequested" :request-resources-for-outline="onResourcesForOutlineFilterRequested" />
</div>