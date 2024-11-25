<template>
    <div class="spread-content">
        <label>Color palette
            <select 
                :value="selectedPaletteIndex"
                @change="$emit('update:modelValue', parseInt($event.target.value))"
            >
                <optgroup 
                    label="Scratch" 
                    v-if="palettes.length > 0"
                >
                    <option value="0">{{palettes[0].title}}</option>
                </optgroup>
                <optgroup label="Default palettes">
                    <option 
                        v-for="(palette, index) in palettes.slice(1, defaultPalettesLength)" 
                        :value="index+1" 
                        :key="`default-${palette.title}`"
                    >
                        {{palette.title}}
                    </option>
                </optgroup>
                <optgroup 
                    label="Saved palettes" 
                    v-if="palettes.length - defaultPalettesLength > 0"
                >
                    <option 
                        v-for="(palette, index) in palettes.slice(defaultPalettesLength)" 
                        :value="index+defaultPalettesLength" 
                        :key="`custom-${palette.title}`"
                    >
                        {{palette.title}}
                    </option>
                </optgroup>
            </select>
        </label>
        <cycle-property-list 
            model-name="color palette" 
            :modelValue="selectedPaletteIndex" 
            @update:modelValue="$emit('update:modelValue', $event)"
            :array-length="palettes.length" 
            :array-start-index.number="1" 
        />
    </div>
</template>

<style lang="scss" module>

</style>

<script>
import CyclePropertyList from './cycle-property-list.vue';

export default {
    props: {
        modelValue: {
            type: Number,
            required: true,
        },
        palettes: {
            type: Array,
            required: true,
        },
        defaultPalettesLength: {
            type: Number,
            required: true,
        },
    },
    components: {
        CyclePropertyList
    },
    computed: {
        selectedPaletteIndex(){
            return this.modelValue;
        },
    },
};
</script>