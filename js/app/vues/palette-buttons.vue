<template>
    <div class="spread-content" :class="$style.paletteButtonsContainer">
        <div>
            <print-palette-button :colors="colors" />
            <button
                class="btn btn-danger btn-sm"
                v-show="currentPalette.isSaved"
                @click="deletePalette"
            >
                Delete
            </button>
        </div>
        <!-- these buttons mutaually exclusive and should never show at the same time- they are XOR (either or none, but not both -->
        <button
            class="btn btn-primary btn-sm"
            v-show="currentPalette.isCustom"
            @click="savePalette"
        >
            Save
        </button>
        <button
            class="btn btn-default btn-sm"
            v-show="currentPalette.isSaved"
            @click="showRenamePalette"
        >
            Rename
        </button>
    </div>
</template>

<style lang="scss" module>
.paletteButtonsContainer {
    //reduce upper margin from color inputs
    margin: 8px 0;
}
</style>

<script>
import PrintPaletteButton from 'print-palette-button'; //resolved in webpack config so not included in production builds

export default {
    props: {
        deletePalette: {
            type: Function,
            required: true,
        },
        savePalette: {
            type: Function,
            required: true,
        },
        showRenamePalette: {
            type: Function,
            required: true,
        },
        colors: {
            type: Array,
            required: true,
        },
        currentPalette: {
            type: Object,
            required: true,
        },
    },
    components: {
        PrintPaletteButton,
    },
};
</script>
