<div class="dither-controls-container controls-panel">
    <div class="histogram-container" style="width: <?= HISTOGRAM_BW_WIDTH.'px'; ?>; height: <?= HISTOGRAM_HEIGHT.'px'; ?>;">
        <canvas ref="histogramCanvasIndicator" class="histogram-canvas-indicator" width="<?= HISTOGRAM_BW_WIDTH; ?>" height="<?= HISTOGRAM_HEIGHT; ?>" title="Lightness histogram"></canvas>
        <canvas ref="histogramCanvas" class="histogram-canvas" width="<?= HISTOGRAM_BW_WIDTH; ?>" height="<?= HISTOGRAM_HEIGHT; ?>" title="Lightness histogram"></canvas>
    </div>
    <div class="transform-button-container">
        <button class="btn btn-success btn-sm" @click="ditherImageWithSelectedAlgorithm" v-show="!isLivePreviewEnabled">Dither</button>
    </div>
    <div class="spread-content">
        <label>Algorithm
            <select v-model="selectedDitherAlgorithmIndex">
                <optgroup v-for="ditherGroup in ditherGroups" :label="ditherGroup.title">
                    <option v-for="(ditherAlgorithm, index) in ditherAlgorithms.slice(ditherGroup.start, ditherGroup.start + ditherGroup.length)" :value="ditherGroup.start + index">{{ ditherAlgorithm.title }}</option>
                </optgroup>
            </select>
        </label>
        <?php IndexView::cyclePropertyList('selectedDitherAlgorithmIndex', 'ditherAlgorithms', 'algorithm'); ?>
    </div>
    <div class="spread-content threshold-container">
        <label>
            Threshold
            <input type="range" :min="thresholdMin" :max="thresholdMax" v-model.number="threshold" list="threshold-tickmarks"/>
            <input type="number" :min="thresholdMin" :max="thresholdMax" v-model.number="threshold"/>
            <datalist id="threshold-tickmarks">
                <option value="0"/>
                <option value="63"/>
                <option value="127"/>
                <option value="191"/>
                <option value="255"/>
            </datalist>
        </label>
    </div>
    <fieldset>
        <legend>Color substitution</legend>
        <color-picker v-if="shouldShowColorPicker" :should-live-update="isColorPickerLivePreviewEnabled" :selected-color="colorPickerSelectedColor" @input="colorPickerValueChanged" @ok="colorPickerOk" @cancel="colorPickerCanceled" />
        <div class="bw-color-replace-container">
            <color-input label="Black" id-prefix="bw" :is-selected="shouldShowColorPicker &amp;&amp; colorPickerColorIndex===0" :on-click="createColorInputClicked(0)" :is-disabled="false" :color-value="colorReplaceColors[0]" color-index="0" />
            <color-input label="White" id-prefix="bw" :is-selected="shouldShowColorPicker &amp;&amp; colorPickerColorIndex===1" :on-click="createColorInputClicked(1)" :is-disabled="false" :color-value="colorReplaceColors[1]" color-index="1" />
            <button class="btn btn-default btn-sm" @click="resetColorReplace" v-show="areColorReplaceColorsChangedFromDefaults" title="Reset colors to black and white">Reset</button>
        </div>
    </fieldset>
    <?php if(ENABLE_TEXTURE_COMBINE): ?>
        <texture-combine ref="textureCombineComponent" :loaded-image="loadedImage" :request-canvases="requestCanvases" :request-display-transformed-image="requestDisplayTransformedImage" :color-replace-black-pixel="colorReplaceBlackPixel" :color-replace-white-pixel="colorReplaceWhitePixel"/>
    <?php endif; ?>
</div>