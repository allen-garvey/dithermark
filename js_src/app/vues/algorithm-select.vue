<template>
    <div class="spread-content">
        <label>Algorithm
            <select 
                :value="selectedDitherAlgorithmIndex"
                @change="$emit('update:modelValue', parseInt($event.target.value))"
            >
                <optgroup 
                    v-for="ditherGroup in ditherGroups" 
                    :label="ditherGroup.title" 
                    :key="ditherGroup.title"
                >
                    <option 
                        v-for="ditherAlgorithm in ditherGroup.items" 
                        :value="ditherAlgorithm.index" 
                        :key="ditherAlgorithm.slug"
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
            :array-length="algorithmCount" 
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
        ditherGroups: {
            type: Array,
            required: true,
        },
        algorithmCount: {
            type: Number,
            required: true,
        },
    },
    components: {
        CyclePropertyList,
    },
    computed: {
        selectedDitherAlgorithmIndex(){
            return this.modelValue;
        },
    },
};
</script>