<template>
    <label :title="tooltip"
        ><span :class="[$style.labelText, labelTextClass]">{{ label }}</span>
        <input
            type="checkbox"
            :value="modelValue"
            @input="$emit('update:modelValue', !modelValue)"
            :title="tooltip"
            :checked="modelValue"
        />
    </label>
</template>

<style lang="scss" module>
.labelText {
    margin-right: 0.25em;
}
</style>

<script>
export default {
    props: {
        label: {
            type: String,
            required: true,
        },
        labelTextClass: {
            type: String,
            default: '',
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
