<template>
    <div class="controls-tab-container">
        <fieldset>
            <legend>Appearance</legend>
            <div class="spread-content">
                <label class="label">
                    <span>Theme</span>
                    <select
                        :value.number="currentEditorThemeIndex"
                        @input="
                            $emit(
                                'update:currentEditorThemeIndex',
                                parseInt($event.target.value)
                            )
                        "
                    >
                        <template
                            v-for="(theme, index) in editorThemes"
                            :key="index"
                        >
                            <option :value="index">{{ theme.name }}</option>
                        </template>
                    </select>
                </label>
                <cycle-property-list
                    model-name="theme"
                    :model-value="currentEditorThemeIndex"
                    @update:model-value="
                        newValue =>
                            $emit('update:currentEditorThemeIndex', newValue)
                    "
                    :array-length="editorThemes.length"
                />
            </div>
            <full-screen-mode-control />
        </fieldset>
        <fieldset>
            <legend>Performance</legend>
            <div class="spread-content" :class="$style.checkboxesContainer">
                <checkbox
                    tooltip="Immediately transform image when controls change"
                    label="Live update"
                    :model-value="isLivePreviewEnabled"
                    @update:model-value="
                        newValue =>
                            $emit('update:isLivePreviewEnabled', newValue)
                    "
                />
                <checkbox
                    v-if="isLivePreviewEnabled"
                    tooltip="Update colors immediately when selected in color picker"
                    label="Color picker live update"
                    :model-value="isColorPickerLivePreviewEnabledSetting"
                    @update:model-value="
                        newValue =>
                            $emit(
                                'update:isColorPickerLivePreviewEnabledSetting',
                                newValue
                            )
                    "
                />
                <checkbox
                    tooltip="Automatically shrink large images when opening them"
                    label="Shrink large images"
                    :model-value="automaticallyResizeLargeImages"
                    @update:model-value="
                        newValue =>
                            $emit(
                                'update:automaticallyResizeLargeImages',
                                newValue
                            )
                    "
                />
                <checkbox
                    tooltip="Reduce the number of processes to save memory"
                    label="Use single web worker"
                    v-model="shouldLimitNumberOfWebworkers"
                />
                <checkbox
                    v-if="isWebglSupported"
                    tooltip="Use WebGL to speed up performance when possible"
                    label="Use WebGL"
                    :model-value="isWebglEnabled"
                    @update:model-value="
                        newValue => $emit('update:isWebglEnabled', newValue)
                    "
                />
                <checkbox
                    v-if="isDev"
                    tooltip="Use FFmpeg directly on your computer"
                    label="Use FFmpeg Server"
                    :model-value="useFfmpegServer"
                    @update:model-value="
                        newValue => $emit('update:useFfmpegServer', newValue)
                    "
                />
            </div>
        </fieldset>

        <div :class="$style.hint" v-for="hint in hints" :key="hint">
            {{ hint }}
        </div>
    </div>
</template>

<style lang="scss" module>
.checkboxesContainer {
    gap: 16px;
}
.hint {
    font-size: 0.8rem;
}
</style>

<script>
import CyclePropertyList from './cycle-property-list.vue';
import FullScreenModeControl from './full-screen-mode-control.vue';
import Checkbox from './checkbox.vue';
import {
    getShouldLimitNumberOfWebworkersSetting,
    setLimitNumberOfWebworkersSetting,
} from '../user-settings';

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
        isDev: {
            type: Boolean,
            required: true,
        },
        // v-models
        useFfmpegServer: {
            type: Boolean,
            required: true,
        },
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
    created() {
        this.shouldLimitNumberOfWebworkers =
            getShouldLimitNumberOfWebworkersSetting();
        this.shouldLimitNumberOfWebworkersOriginalValue =
            this.shouldLimitNumberOfWebworkers;
    },
    data() {
        return {
            shouldLimitNumberOfWebworkers: true,
            shouldLimitNumberOfWebworkersOriginalValue: true,
        };
    },
    computed: {
        hints() {
            const hints = [];

            if (!this.isLivePreviewEnabled) {
                hints.push(
                    'To update the image output, use the “Dither” button.'
                );
            } else if (!this.isColorPickerLivePreviewEnabledSetting) {
                hints.push(
                    'Colors won’t update until you press the color picker OK button.'
                );
            }

            if (!this.automaticallyResizeLargeImages) {
                hints.push(
                    'Opening very large images can result in poor performance or browser crashes.'
                );
            }

            if (
                this.shouldLimitNumberOfWebworkersOriginalValue !==
                this.shouldLimitNumberOfWebworkers
            ) {
                hints.push(
                    'Refresh the page to update the number of web workers'
                );
            }

            if (this.isWebglSupported && !this.isWebglEnabled) {
                hints.push(
                    'With WebGL is disabled some image filters will not be available, and the Yliluoma 1, Yliluoma 2 and adaptive threshold dithers will be very slow.'
                );
            }

            return hints;
        },
    },
    watch: {
        shouldLimitNumberOfWebworkers() {
            setLimitNumberOfWebworkersSetting(
                this.shouldLimitNumberOfWebworkers
            );
        },
    },
};
</script>
