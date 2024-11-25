<template>
    <label :title="tooltip">{{ label }}
        <input 
            type="checkbox" 
            :value="modelValue" 
            @input="$emit('update:modelValue', !modelValue)" 
            :title="tooltip"
            :checked="modelValue"
        />
    </label>
</template>

<script>
export default {
    props: {
        label: {
            type: String,
            required: true,
        },
        tooltip: {
            type: String,
            required: true,
        },
        modelValue: {
            type: Boolean,
            required: true,
        },
    },
};
</script>