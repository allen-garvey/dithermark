<template>
    <div :class="$style.ditherButtonContainer">
        <button 
            class="btn btn-success btn-sm" 
            @click="onClick()"
        >
            Dither
        </button>
    </div>
</template>

<style lang="scss" module>

.ditherButtonContainer{
    text-align: right;

    //styles for desktop
    @include pinned_controls_mq{
        text-align: left;
    }
}

</style>

<script>
export default {
    props: {
        onClick: {
            type: Function,
            required: true,
        }
    },
};
</script>