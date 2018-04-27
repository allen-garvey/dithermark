<div class="dither-controls-container controls-panel">
    <div class="histogram-container" style="width: <?= HISTOGRAM_BW_WIDTH.'px'; ?>; height: <?= HISTOGRAM_HEIGHT.'px'; ?>;">
        <canvas ref="histogramCanvasIndicator" class="histogram-canvas-indicator" width="<?= HISTOGRAM_BW_WIDTH; ?>" height="<?= HISTOGRAM_HEIGHT; ?>" title="Lightness histogram"></canvas>
        <canvas ref="histogramCanvas" class="histogram-canvas" width="<?= HISTOGRAM_BW_WIDTH; ?>" height="<?= HISTOGRAM_HEIGHT; ?>" title="Lightness histogram"></canvas>
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
    <div>
        <label>
            Threshold
            <input type="range" v-bind:min="thresholdMin" v-bind:max="thresholdMax" v-model.number="threshold"/>
            <input type="number" v-bind:min="thresholdMin" v-bind:max="thresholdMax" v-model.number="threshold"/>
        </label>
    </div>
    <div>
        <button class="btn btn-success btn-sm" v-on:click="ditherImageWithSelectedAlgorithm" v-show="!isLivePreviewEnabled">Transform</button>
    </div>
    <fieldset>
        <legend>Color substitution</legend>
        <label>Black<input type="color" v-model="colorReplaceColors[0]" /></label>
        <label>White<input type="color" v-model="colorReplaceColors[1]" /></label>
        <button class="btn btn-default btn-sm" v-on:click="resetColorReplace" v-show="areColorReplaceColorsChangedFromDefaults" title="Reset colors to black and white">Reset</button>
    </fieldset>
    <div>
        <button class="btn btn-default btn-sm" v-on:click="saveTexture">Save texture</button>
        <button class="btn btn-default btn-sm" v-show="savedTextures.length >= 3" v-on:click="combineDitherTextures">Combine textures</button>
    </div>
</div>