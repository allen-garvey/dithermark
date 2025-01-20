<template>
    <div :class="$style.container">
        <h4>Image Selector</h4>
        <p>{{ currentFilename }}</p>
        <div :class="$style.controlsContainer">
            <input
                type="range"
                min="1"
                :max="fileCount"
                step="1"
                :value="fileIndex + 1"
                :class="$style.range"
                @change="updateFileIndex($event.target.value)"
                list="batch-image-selector-datalist"
            />
            <datalist id="batch-image-selector-datalist">
                <option v-for="i in fileCount" :value="i + 1" :key="i"></option>
            </datalist>
            <input
                type="number"
                min="1"
                :max="fileCount"
                step="1"
                :value="fileIndex + 1"
                @input="updateFileIndex($event.target.value)"
            />
        </div>
    </div>
</template>

<style lang="scss" module>
.container {
}

.controlsContainer {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em;
}

.range {
    flex-grow: 1;
    flex-basis: auto;
}
</style>

<script>
export default {
    props: {
        currentFilename: {
            type: String,
            required: true,
        },
        fileIndex: {
            type: Number,
            required: true,
        },
        fileCount: {
            type: Number,
            required: true,
        },
    },
    emits: ['update:fileIndex'],
    data() {
        return {};
    },
    computed: {},
    watch: {},
    methods: {
        updateFileIndex(value) {
            let numberValue = parseInt(value);
            if (isNaN(numberValue)) {
                numberValue = 1;
            }
            numberValue = Math.min(Math.max(1, numberValue), this.fileCount);

            // subtract 1 since display is 1 based, but index is 0 based
            this.$emit('update:fileIndex', numberValue - 1);
        },
    },
};
</script>
