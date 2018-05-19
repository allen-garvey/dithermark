<div class="dither-controls-container controls-panel">
    <div class="histogram-container" style="width: <?= HISTOGRAM_BW_WIDTH.'px'; ?>; height: <?= HISTOGRAM_HEIGHT.'px'; ?>;">
        <canvas ref="histogramCanvasIndicator" class="histogram-canvas-indicator" width="<?= HISTOGRAM_BW_WIDTH; ?>" height="<?= HISTOGRAM_HEIGHT; ?>" title="Lightness histogram"></canvas>
        <canvas ref="histogramCanvas" class="histogram-canvas" width="<?= HISTOGRAM_BW_WIDTH; ?>" height="<?= HISTOGRAM_HEIGHT; ?>" title="Lightness histogram"></canvas>
    </div>
    <div class="transform-button-container">
        <button class="btn btn-success btn-sm" v-on:click="ditherImageWithSelectedAlgorithm" v-show="!isLivePreviewEnabled">Transform</button>
    </div>
    <div class="spread-content">
        <label>Algorithm
            <select v-model="selectedDitherAlgorithmIndex">
                <optgroup v-for="ditherGroup in ditherGroups" v-bind:label="ditherGroup.title">
                    <option v-for="(ditherAlgorithm, index) in ditherAlgorithms.slice(ditherGroup.start, ditherGroup.start + ditherGroup.length)" v-bind:value="ditherGroup.start + index">{{ ditherAlgorithm.title }}</option>
                </optgroup>
            </select>
        </label>
        <?php IndexView::cyclePropertyList('selectedDitherAlgorithmIndex', 'ditherAlgorithms', 'algorithm'); ?>
    </div>
    <div class="spread-content threshold-container">
        <label>
            Threshold
            <input type="range" v-bind:min="thresholdMin" v-bind:max="thresholdMax" v-model.number="threshold"/>
            <input type="number" v-bind:min="thresholdMin" v-bind:max="thresholdMax" v-model.number="threshold"/>
        </label>
    </div>
    <fieldset>
        <legend>Color substitution</legend>
        <div v-if="shouldShowColorPicker">
            <photoshop-picker :value="colorPickerSelectedColor" @input="colorPickerValueChanged" @ok="colorPickerOk" @cancel="colorPickerCanceled" />
        </div>
        <div class="bw-color-replace-container">
            <color-input label="Black" id-prefix="bw" :on-click="createColorInputClicked(0)" :is-disabled="false" :color-value="colorReplaceColors[0]" color-index="0" dragged-index="-1" />
            <color-input label="White" id-prefix="bw" :on-click="createColorInputClicked(1)" :is-disabled="false" :color-value="colorReplaceColors[1]" color-index="1" dragged-index="-1" />
            <button class="btn btn-default btn-sm" @click="resetColorReplace" v-show="areColorReplaceColorsChangedFromDefaults" title="Reset colors to black and white">Reset</button>
        </div>
    </fieldset>
    <?php if(ENABLE_TEXTURE_COMBINE): ?>
        <texture-combine ref="textureCombineComponent" :loaded-image="loadedImage" :request-canvases="requestCanvases" :request-display-transformed-image="requestDisplayTransformedImage" :color-replace-black-pixel="colorReplaceBlackPixel" :color-replace-white-pixel="colorReplaceWhitePixel"/>
    <?php endif; ?>
</div>