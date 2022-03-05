<template>
    <div class="hint-container">Open an image to begin</div>
</template>

<style lang="scss" module>

</style>

<script>
import Fs from '../fs.js';

export default {
    props: {
        imageOpened: {
            type: Function,
            required: true,
        },
        openImageError: {
            type: Function,
            required: true,
        },
    },
    computed: {
    },
    methods: {
    }
};
</script>