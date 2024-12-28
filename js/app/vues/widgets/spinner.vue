<template>
    <div :class="$style.loadingContainer">
        <div :class="$style.loader"></div>
    </div>
</template>

<style lang="scss" module>
.loadingContainer {
    display: flex;
    justify-content: center;
}

/*
    * Loading icon
    * based on: https://www.w3schools.com/howto/howto_css_loader.asp
    */
.loader {
    border: 4px solid var(--main-text-color);
    border-top: 4px solid var(--hint-text-color);
    border-radius: 50%;
    width: 16px;
    height: 16px;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>

<script>
export default {};
</script>
