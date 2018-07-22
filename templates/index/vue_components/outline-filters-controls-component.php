<fieldset v-if="isImageOutlineFilterEnabled">
    <legend>Outline</legend>
    <div class="spread-content">
        <div class="label-align">
            <label for="image-outline-filter-type">Type</label>
            <select id="image-outline-filter-type" v-model.number="selectedImageOutlineType">
                <option v-for="(value, index) in imageOutlineTypes" :value="index">{{value.title}}</option>
            </select>
        </div>
        <?php IndexView::cyclePropertyList('selectedImageOutlineType', 'imageOutlineTypes', 'outline type'); ?>
    </div>
    <div class="spread-content" v-if="isImageOutlineFilterActive">
        <div class="label-align">
            <label for="image-outline-filter-color-mode">Color</label>
            <select id="image-outline-filter-color-mode" v-model.number="selectedOutlineColorMode">
                <option v-for="(value, index) in imageOutlineColorModes" :value="index">{{value.title}}</option>
            </select>
        </div>
        <?php IndexView::cyclePropertyList('selectedOutlineColorMode', 'imageOutlineColorModes', 'outline color mode'); ?>
    </div>
    <div class="spread-content" v-if="isImageEdgeFilterActive">
        <div class="label-align">
            <label for="image-edge-filter-thickness">Thickness</label>
            <select id="image-edge-filter-thickness" v-model.number="selectedImageOutlineEdgeThickness">
                <option v-for="(value, index) in imageOutlineEdgeThicknesses" :value="index">{{value}}</option>
            </select>
        </div>
        <?php IndexView::cyclePropertyList('selectedImageOutlineEdgeThickness', 'imageOutlineEdgeThicknesses', 'edge thickness'); ?>
    </div>
    <div class="spread-content" v-if="isImageEdgeFilterActive">
        <div class="label-align">
            <label for="image-edge-filter-strength">Threshold</label>
            <select id="image-edge-filter-strength" v-model.number="selectedImageOutlineStrength">
                <option v-for="(value, index) in imageOutlineEdgeStrengths" :value="index">{{value}}</option>
            </select>
        </div>
        <?php IndexView::cyclePropertyList('selectedImageOutlineStrength', 'imageOutlineEdgeStrengths', 'edge strength'); ?>
    </div>
    <div class="spread-content" v-if="isImageContourFilterActive">
        <div class="label-align">
            <label for="image-contour-filter-radius">Radius</label>
            <select id="image-contour-filter-radius" v-model.number="selectedImageOutlineContourRadiusPercent">
                <option v-for="(value, index) in imageOutlineContourRadiusPercentages" :value="index">{{value}}</option>
            </select>
        </div>
        <?php IndexView::cyclePropertyList('selectedImageOutlineContourRadiusPercent', 'imageOutlineContourRadiusPercentages', 'outline radius'); ?>
    </div>
    <div class="spread-content" v-if="isImageOutlineFilterActive &amp;&amp; isImageOutlineFixedColor &amp;&amp; areOutlineBlendModesSupported">
        <div class="label-align">
            <label for="image-outline-filter-blend-mode">Blend mode</label>
            <select id="image-outline-filter-blend-mode" v-model.number="selectedOutlineFixedColorBlendMode">
                <option v-for="(mode, index) in imageOutlineFixedColorBlendModes" :value="index">{{mode.title}}</option>
            </select>
        </div>
        <?php IndexView::cyclePropertyList('selectedOutlineFixedColorBlendMode', 'imageOutlineFixedColorBlendModes', 'blend mode'); ?>
    </div>
    <div class="spread-content" v-if="isImageOutlineFilterActive">
        <div class="label-align">
            <label for="image-outline-filter-opacity">Opacity</label>
            <select id="image-outline-filter-opacity" v-model.number="selectedOutlineOpacity">
                <option v-for="(value, index) in outlineOpacities" :value="index">{{Math.round(value * 100)}}%</option>
            </select>
        </div>
        <?php IndexView::cyclePropertyList('selectedOutlineOpacity', 'outlineOpacities', 'outline opacity'); ?>
    </div>
    <div v-if="isImageOutlineFilterActive &amp;&amp; isImageOutlineFixedColor">
        <color-picker v-if="shouldShowColorPicker" :should-live-update="isColorPickerLivePreviewEnabled" :selected-color="fixedOutlineColor" @input="colorPickerValueChanged" @ok="colorPickerDone" @cancel="colorPickerDone" />
        <div class="spread-content image-outline-color-input">
            <color-input label="Color" id-prefix="outline-color" :is-selected="shouldShowColorPicker" :on-click="()=>{shouldShowColorPicker = true;}" :color-value="fixedOutlineColor" />
        </div>
    </div>
</fieldset>