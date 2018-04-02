<div class="dither-controls-container controls-panel">
    <div class="spread-content">
        <label>Algorithm
            <select v-model="selectedDitherAlgorithmIndex">
                    <optgroup v-for="ditherGroup in ditherGroups" v-bind:label="ditherGroup.title">
                        <option v-for="(ditherAlgorithm, index) in ditherAlgorithms.slice(ditherGroup.start, ditherGroup.start + ditherGroup.length)" v-bind:value="ditherGroup.start + index">{{ ditherAlgorithm.title }}</option>
                    </optgroup>
            </select>
        </label>
        <div>
            <button class="shuffle-color-palette-button" title="Previous algorithm" @click="cyclePropertyList('selectedDitherAlgorithmIndex', -1, ditherAlgorithms.length)"><</button>
            <button class="shuffle-color-palette-button" title="Next algorithm" @click="cyclePropertyList('selectedDitherAlgorithmIndex', 1, ditherAlgorithms.length)">></button>
        </div>
    </div>
    <div>
        <button v-on:click="ditherImageWithSelectedAlgorithm" v-show="!isLivePreviewEnabled">Transform</button>
    </div>
    <div class="histogram-super-container">
        <div class="histogram-container" style="width: <?= HISTOGRAM_COLOR_WIDTH.'px'; ?>; height: <?= HISTOGRAM_HEIGHT.'px'; ?>;">
            <canvas ref="histogramCanvas" width="<?= HISTOGRAM_COLOR_WIDTH; ?>" height="<?= HISTOGRAM_HEIGHT; ?>" title="Hue histogram"></canvas>
        </div>
    </div>
    <div class="spread-content">
        <label>Color comparison
            <select v-model="selectedColorDitherModeIndex">
                <template v-for="(colorDitherMode, index) in colorDitherModes">
                    <option v-bind:value="index">{{colorDitherMode.title}}</option>
                </template>
            </select>
        </label>
        <div>
            <button class="shuffle-color-palette-button" title="Previous color mode" @click="cyclePropertyList('selectedColorDitherModeIndex', -1, colorDitherModes.length)"><</button>
            <button class="shuffle-color-palette-button" title="Next color mode" @click="cyclePropertyList('selectedColorDitherModeIndex', 1, colorDitherModes.length)">></button>
        </div>
    </div>
    <div class="spread-content">
        <label>Color palette
            <select v-model="selectedPaletteIndex">
                <option v-for="(palette, index) in palettes" v-bind:value="index">{{palette.title}}</option>
            </select>
        </label>
        <div>
        <button class="shuffle-color-palette-button" title="Previous color palette" @click="cyclePropertyList('selectedPaletteIndex', -1, palettes.length, 1)"><</button>
        <button class="shuffle-color-palette-button" title="Next color palette" @click="cyclePropertyList('selectedPaletteIndex', 1, palettes.length, 1)">></button>
        </div>
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
    <div class="color-replace-super-container">
        <div class="color-replace-title-container">
            <h5 class="color-replace-title">Colors</h5>
        </div>
        <div class="colors-list-container" @dragover="handleColorDragover">
            <template v-for="(color, i) in colors">
                <div class="color-container" draggable="true" @dragstart="handleColorDragstart($event, i)" @dragover="handleColorDragover($event, i)" @drop="handleColorDrop($event, i)" @dragend="handleColorDragend" v-bind:class="{'dragged-over': shouldShowDragoverStyle(i), 'dragged': isBeingDragged(i), 'color-disabled': i >= numColors}">
                    <label v-bind:for="idForColorPicker(i)">{{i+1}}</label>
                    <input type="color" v-bind:id="idForColorPicker(i)" v-model="colorsShadow[i]" v-bind:disabled="i >= numColors" />
                </div>
            </template>
        </div>
    </div>
    <div>
        <button @click="randomizePalette">Randomize palette</button>
        <?php if(ENABLE_PRINT_COLOR_PALETTE_BUTTON): ?>
            <print-palette-button :colors="colors" />
        <?php endif; ?>
    </div>
    <fieldset>
        <legend>Optimize palette</legend>
        <div class="spread-content">
            <label>Algorithm
                <select v-model="selectedColorQuantizationModeIndex">
                    <template v-for="(colorQuantizationMode, index) in colorQuantizationModes">
                        <option v-bind:value="index">{{colorQuantizationMode.title}}</option>
                    </template>
                </select>
            </label>
            <div>
                <button class="shuffle-color-palette-button" title="Previous optimize palette algorithm" @click="cyclePropertyList('selectedColorQuantizationModeIndex', -1, colorQuantizationModes.length)"><</button>
                <button class="shuffle-color-palette-button" title="Next optimize palette algorithm" @click="cyclePropertyList('selectedColorQuantizationModeIndex', 1, colorQuantizationModes.length)">></button>
            </div>
            <button @click="optimizePalette" title="Optimize palette">Optimize</button>
        </div>
    </fieldset>
</div>   