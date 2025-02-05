<template>
    <div>
        <label class="label">
            <span>Color count</span>
            <input
                type="range"
                :value="numColors"
                @input="updateNumColors($event.target.value)"
                :min="numColorsMin"
                :max="numColorsMax"
                step="1"
                list="color_dither_num_colors_tickmarks"
            />
            <datalist id="color_dither_num_colors_tickmarks">
                <option
                    v-for="n in numColorsMax - numColorsMin + 1"
                    :key="n + numColorsMin - 1"
                    :value="n + numColorsMin - 1"
                ></option>
            </datalist>
            <input
                type="number"
                :value="numColors"
                @input="updateNumColors($event.target.value)"
                :min="numColorsMin"
                :max="numColorsMax"
                step="1"
            />
        </label>
    </div>
</template>

<style lang="scss" module></style>

<script>
import { COLOR_DITHER_MAX_COLORS } from '../../../constants.js';

export default {
    props: {
        modelValue: {
            type: Number,
            required: true,
        },
    },
    computed: {
        numColorsMin() {
            return 2;
        },
        numColorsMax() {
            return COLOR_DITHER_MAX_COLORS;
        },
        numColors() {
            return this.modelValue;
        },
    },
    methods: {
        updateNumColors(newValue) {
            const oldValue = this.numColors;
            let value = parseInt(newValue, 10);

            if (isNaN(value)) {
                return;
            }
            if (value < this.numColorsMin) {
                value = this.numColorsMin;
            } else if (value > this.numColorsMax) {
                value = this.numColorsMax;
            }
            if (value === oldValue) {
                return;
            }
            this.$emit('update:modelValue', value);
        },
    },
};
</script>
