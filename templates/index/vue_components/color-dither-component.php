<div class="dither-controls-container controls-panel">
    <div class="histogram-container" style="width: <?= HISTOGRAM_COLOR_WIDTH.'px'; ?>; height: <?= HISTOGRAM_HEIGHT.'px'; ?>;">
        <canvas ref="histogramCanvas" width="<?= HISTOGRAM_COLOR_WIDTH; ?>" height="<?= HISTOGRAM_HEIGHT; ?>" title="Hue histogram"></canvas>
    </div>
    <div class="transform-button-container">
        <button class="btn btn-success btn-sm"  v-on:click="ditherImageWithSelectedAlgorithm" v-show="!isLivePreviewEnabled">Transform</button>
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
    <div class="spread-content">
        <label>Color comparison
            <select v-model="selectedColorDitherModeIndex">
                <template v-for="(colorDitherMode, index) in colorDitherModes">
                    <option v-bind:value="index">{{colorDitherMode.title}}</option>
                </template>
            </select>
        </label>
        <?php IndexView::cyclePropertyList('selectedColorDitherModeIndex', 'colorDitherModes', 'color mode'); ?>
    </div>
    <div class="spread-content">
        <label>Color palette
            <select v-model="selectedPaletteIndex">
                <option v-for="(palette, index) in palettes" v-bind:value="index">{{palette.title}}</option>
            </select>
        </label>
        <?php IndexView::cyclePropertyList('selectedPaletteIndex', 'palettes', 'color palette', 1); ?>
    </div>
    <div class="color-dither-number-of-colors-container">
        <label for="color_dither_num_colors_input">Color count</label>
            <input type="range" v-model.number="numColors" v-bind:min="numColorsMin" v-bind:max="numColorsMax" step="1" list="color_dither_num_colors_tickmarks" id="color_dither_num_colors_input" />
        <datalist id="color_dither_num_colors_tickmarks">
            <template v-for="n in (numColorsMax - numColorsMin + 1)">
                <option v-bind:value="n + numColorsMin - 1"></option>
            </template>
        </datalist>
        <input type="number" v-model.number="numColors" v-bind:min="numColorsMin" v-bind:max="numColorsMax" step="1" />
    </div>
    <fieldset>
        <legend>Color palette</legend>
        <div v-if="shouldShowColorPicker">
            <div class="color-picker-container">
                <photoshop-picker :value="colorPickerSelectedColor" @input="colorPickerValueChanged" @ok="shouldShowColorPicker = false" @cancel="colorPickerCanceled" />
            </div>
            <div class="color-picker-overlay"></div>
        </div>
        <div class="colors-list-container" @dragover="handleColorDragover">
            <template v-for="(color, i) in colors">
                <color-input id-prefix="color" :on-click="createColorInputClicked(i)" :is-selected="shouldShowColorPicker &amp;&amp; colorPickerColorIndex===i" :color-index="i" :color-value="colorsShadow[i]" :is-disabled="i >= numColors" :dragged-index="draggedIndex" :handle-color-dragstart="handleColorDragstart" :handle-color-dragover="handleColorDragover" :handle-color-dragend="handleColorDragend" />
            </template>
        </div>
        <div class="spread-content palette-buttons-container">
            <div>
                <button class="btn btn-default btn-sm" @click="randomizePalette" title="Set color palette to random colors">Randomize</button>
                <?php if(ENABLE_PRINT_COLOR_PALETTE_BUTTON): ?>
                    <print-palette-button :colors="colors" />
                <?php endif; ?>
                <button class="btn btn-default btn-sm" v-show="currentPalette.isSaved" @click="showRenamePalette">Rename</button>
            </div>
            <?php //these buttons mutaually exclusive and should never show at the same time- they are XOR (either or none, but not both) ?>
            <button class="btn btn-primary btn-sm" v-show="currentPalette.isCustom" @click="savePalette">Save</button>
            <button class="btn btn-danger btn-sm" v-show="currentPalette.isSaved" @click="deletePalette">Delete</button>
        </div>
    </fieldset>
    <fieldset>
        <legend>Optimize palette</legend>
        <div class="spread-content">
            <label>Algorithm
                <select v-model="selectedColorQuantizationModeIndex">
                    <optgroup v-for="colorQuantizationGroup in colorQuantizationGroups" v-bind:label="colorQuantizationGroup.title">
                        <option v-for="(colorQuantizationMode, index) in colorQuantizationModes.slice(colorQuantizationGroup.start, colorQuantizationGroup.start + colorQuantizationGroup.length)" v-bind:value="colorQuantizationGroup.start + index">{{ colorQuantizationMode }}</option>
                    </optgroup>
                </select>
            </label>
            <?php IndexView::cyclePropertyList('selectedColorQuantizationModeIndex', 'colorQuantizationModes', 'optimize palette algorithm'); ?>
            <div class="optimize-palette-pending">{{selectedColorQuantizationPendingMessage}}</div>
            <button class="btn btn-primary btn-sm" @click="optimizePalette" v-bind:disabled="isSelectedColorQuantizationPending" title="Optimize palette">Optimize</button>
        </div>
    </fieldset>
</div>   