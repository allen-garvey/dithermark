<div class="spread-content">
    <label class="super-label">Editor Theme</label>
    <template v-for="(theme, index) in editorThemes">
        <label>{{theme.name}}
            <input type="radio" v-model="currentEditorThemeIndex" v-bind:value="index" />
        </label>
    </template>
</div>
<div class="spread-content">
    <label>Live preview
        <input type="checkbox" v-model="isLivePreviewEnabled"/>
    </label>
    <label v-if="isWebglSupported">Enable WebGL
        <input type="checkbox" v-model="isWebglEnabled"/>
    </label>
</div>