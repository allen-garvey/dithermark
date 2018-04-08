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
        <div>
            <button class="shuffle-color-palette-button" title="Previous theme" @click="cyclePropertyList('currentEditorThemeIndex', -1, editorThemes.length)"><</button>
            <button class="shuffle-color-palette-button" title="Next theme" @click="cyclePropertyList('currentEditorThemeIndex', 1, editorThemes.length)">></button>
        </div>
    </div>
</fieldset>
<fieldset>
    <legend>Performance</legend>
    <div class="spread-content">
        <label>Live preview
            <input type="checkbox" v-model="isLivePreviewEnabled"/>
        </label>
        <label v-if="isWebglSupported">Enable WebGL
            <input type="checkbox" v-model="isWebglEnabled"/>
        </label>
    </div>
</fieldset>