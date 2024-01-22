<template>
    <div :class="$style.container">
        <div>Processing image {{ currentFileName }}</div>
        <div>{{ currentImageIndex }}/{{ batchImageCount }}</div>
    </div>
</template>

<style lang="scss" module>
    .container {
        position: absolute;
        z-index: 100;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: var(--main-bg-color);
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        font-size: 1.25rem;
    }
</style>

<script>
export default {
    props: {
        currentFileName: {
            type: String,
            required: true,
        },
        batchImageCount: {
            type: Number,
            required: true,
        },
        batchImagesLeft: {
            type: Number,
            required: true,
        },
    },
    computed: {
        currentImageIndex(){
            return this.batchImageCount - this.batchImagesLeft + 1;
        },
    },
};
</script>