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
        <label>Live preview
            <input type="checkbox" v-model="isLivePreviewEnabled" title="Immediately transform image when controls change"/>
        </label>
        <label v-if="isWebglSupported">Use WebGL
            <input type="checkbox" v-model="isWebglEnabled" title="Use WebGL to speed up performance when possible"/>
        </label>
    </div>
</fieldset>