<div class="controls-tab-container">
    <fieldset>
        <legend>Appearance</legend>
        <div class="spread-content">
            <label>Theme
                <select v-model.number="currentEditorThemeIndex">
                    <template v-for="(theme, index) in editorThemes">
                        <option v-bind:value="index">{{theme.name}}</option>
                    </template>
                </select>
            </label>
            <?php IndexView::cyclePropertyList('currentEditorThemeIndex', 'editorThemes', 'theme'); ?>
        </div>
    </fieldset>
    <fieldset>
        <legend>Performance</legend>
        <div class="spread-content">
            <label>Live update
                <input type="checkbox" v-model="isLivePreviewEnabled" title="Immediately transform image when controls change"/>
            </label>
            <label>Shrink large images
                <input type="checkbox" v-model="automaticallyResizeLargeImages" title="Automatically shrink large images when opening them"/>
            </label>
            <label v-if="isWebglSupported">Use WebGL
                <input type="checkbox" v-model="isWebglEnabled" title="Use WebGL to speed up performance when possible"/>
            </label>
        </div>
    </fieldset>
    <div v-show="!isLivePreviewEnabled" class="hint">
        To update the image, press the transform button
    </div>
    <div v-show="!automaticallyResizeLargeImages" class="hint">
        Opening very large images can result in poor performance or browser crashes
    </div>
    <div v-show="isWebglSupported &amp;&amp; !isWebglEnabled" class="hint">
        With WebGL is disabled some image filters will not be available, and the Yliluoma 1 and Yliluoma 2 dithers will be very slow
    </div>
</div>