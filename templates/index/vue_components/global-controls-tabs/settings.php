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
        <full-screen-mode-control/>
    </fieldset>
    <fieldset>
        <legend>Performance</legend>
        <div class="spread-content">
            <label>Live update
                <input type="checkbox" v-model="isLivePreviewEnabled" title="Immediately transform image when controls change"/>
            </label>
            <label v-if="isLivePreviewEnabled">Color picker live update
                <input type="checkbox" v-model="isColorPickerLivePreviewEnabledSetting" title="Update colors immediately when selected in color picker"/>
            </label>
            <label>Shrink large images
                <input type="checkbox" v-model="automaticallyResizeLargeImages" title="Automatically shrink large images when opening them"/>
            </label>
            <label v-if="isWebglSupported">Use WebGL
                <input type="checkbox" v-model="isWebglEnabled" title="Use WebGL to speed up performance when possible"/>
            </label>
        </div>
    </fieldset>
    <div v-if="!isLivePreviewEnabled" class="hint">
        To update the image output, use the &#8220;Dither&#8221; button
    </div>
    <div v-if="isLivePreviewEnabled &amp;&amp; !isColorPickerLivePreviewEnabledSetting" class="hint">
        Colors won&#8217;t update until you press the color picker OK button
    </div>
    <div v-if="!automaticallyResizeLargeImages" class="hint">
        Opening very large images can result in poor performance or browser crashes
    </div>
    <div v-if="isWebglSupported &amp;&amp; !isWebglEnabled" class="hint">
        With WebGL is disabled some image filters will not be available, and the Yliluoma 1 and Yliluoma 2 dithers will be very slow
    </div>
</div>