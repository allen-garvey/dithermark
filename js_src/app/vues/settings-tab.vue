<template>
    <div class="controls-tab-container">
        <fieldset>
            <legend>Appearance</legend>
            <div class="spread-content">
                <label>Theme
                    <select :value.number="currentEditorThemeIndex" @input="$emit('update:currentEditorThemeIndex', parseInt($event.target.value))">
                        <template v-for="(theme, index) in editorThemes" :key="index">
                            <option :value="index">{{theme.name}}</option>
                        </template>
                    </select>
                </label>
                <cycle-property-list 
                    model-name="theme" 
                    :model-value="currentEditorThemeIndex" 
                    @update:model-value="newValue => $emit('update:currentEditorThemeIndex', newValue)"
                    :array-length="editorThemes.length" 
                />
            </div>
            <full-screen-mode-control/>
        </fieldset>
        <fieldset>
            <legend>Performance</legend>
            <div class="spread-content" :class="$style.checkboxesContainer">
                <checkbox 
                    tooltip="Immediately transform image when controls change"
                    label="Live update"
                    :model-value="isLivePreviewEnabled" 
                    @update:model-value="newValue => $emit('update:isLivePreviewEnabled', newValue)"
                />
                <checkbox 
                    v-if="isLivePreviewEnabled"
                    tooltip="Update colors immediately when selected in color picker"
                    label="Color picker live update"
                    :model-value="isColorPickerLivePreviewEnabledSetting" 
                    @update:model-value="newValue => $emit('update:isColorPickerLivePreviewEnabledSetting', newValue)"
                />
                <checkbox 
                    tooltip="Automatically shrink large images when opening them"
                    label="Shrink large images"
                    :model-value="automaticallyResizeLargeImages" 
                    @update:model-value="newValue => $emit('update:automaticallyResizeLargeImages', newValue)"
                />
                <checkbox 
                    v-if="isWebglSupported"
                    tooltip="Use WebGL to speed up performance when possible"
                    label="Use WebGL"
                    :model-value="isWebglEnabled" 
                    @update:model-value="newValue => $emit('update:isWebglEnabled', newValue)"
                />
            </div>
        </fieldset>

        <div v-if="!isLivePreviewEnabled" class="hint">
            To update the image output, use the &#8220;Dither&#8221; button
        </div>
        <div v-if="isLivePreviewEnabled && !isColorPickerLivePreviewEnabledSetting" class="hint">
            Colors won&#8217;t update until you press the color picker OK button
        </div>
        <div v-if="!automaticallyResizeLargeImages" class="hint">
            Opening very large images can result in poor performance or browser crashes
        </div>
        <div v-if="isWebglSupported && !isWebglEnabled" class="hint">
            With WebGL is disabled some image filters will not be available, and the Yliluoma 1 and Yliluoma 2 dithers will be very slow
        </div>
    </div>
</template>

<style lang="scss" module>
    .checkboxesContainer {
        gap: 16px;
    }
</style>

<script>
import CyclePropertyList from './cycle-property-list.vue';
import FullScreenModeControl from './full-screen-mode-control.vue';
import Checkbox from './checkbox.vue';

export default {
    props: {
        editorThemes: {
            type: Array,
            required: true,
        },
        isWebglSupported: {
            type: Boolean,
            required: true,
        },
        // v-models
        currentEditorThemeIndex: {
            type: Number,
            required: true,
        },
        isLivePreviewEnabled: {
            type: Boolean,
            required: true,
        },
        isColorPickerLivePreviewEnabledSetting: {
            type: Boolean,
            required: true,
        },
        automaticallyResizeLargeImages: {
            type: Boolean,
            required: true,
        },
        isWebglEnabled: {
            type: Boolean,
            required: true,
        },
    },
    components: {
        CyclePropertyList,
        FullScreenModeControl,
        Checkbox,
    },
};
</script>