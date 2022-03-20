<template>
    <div class="spread-content">
        <label>Algorithm
            <select 
                :value="selectedDitherAlgorithmIndex"
                @change="$emit('update:modelValue', parseInt($event.target.value))"
            >
                <optgroup 
                    v-for="(ditherGroup, outerIndex) in ditherGroups" 
                    :label="ditherGroup.title" 
                    :key="ditherGroup.title"
                >
                    <option 
                        v-for="(ditherAlgorithm, index) in ditherAlgorithms.slice(ditherGroup.start, ditherGroup.start + ditherGroup.length)" 
                        :value="ditherGroup.start + index" 
                        :key="`${ditherGroup.title}-${ditherAlgorithm.title}`"
                    >
                        {{ ditherAlgorithm.title }}
                    </option>
                </optgroup>
            </select>
        </label>
        <cycle-property-list 
            model-name="algorithm" 
            :modelValue="selectedDitherAlgorithmIndex"
            @update:modelValue="$emit('update:modelValue', $event)"
            :array-length="ditherAlgorithms.length" 
        />
    </div>
</template>

<style lang="scss" module>

</style>

<script>
import AlgorithmModel from '../../generated_output/app/algorithm-model.js';

import CyclePropertyList from './cycle-property-list.vue';

export default {
    props: {
        modelValue: {
            type: Number,
            required: true,
        },
        ditherAlgorithms: {
            type: Array,
            required: true,
        },
    },
    components: {
        CyclePropertyList,
    },
    computed: {
        ditherGroups(){
            return AlgorithmModel.bwDitherGroups;
        },
        selectedDitherAlgorithmIndex(){
            return this.modelValue;
        },
    },
};
</script>