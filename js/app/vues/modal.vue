<template>
    <div @keyup.esc="cancelAction" :class="$style.modal">
        <div :class="$style.overlay" @click="cancelAction"></div>
        <div :class="$style.contents">
            <h4 :class="$style.title">{{ title }}</h4>
            <slot></slot>
            <div :class="$style.buttonsContainer">
                <button 
                    class="btn btn-default" 
                    :tabindex="tabIndexOffset+1" 
                    @click="cancelAction"
                >
                    Cancel
                </button>
                <button 
                    class="btn btn-primary" 
                    :tabindex="tabIndexOffset+2" 
                    @click="okAction" 
                    :disabled="isOkButtonDisabled"
                >
                    {{okButtonText}}
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" module>
.overlay, .modal{
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
}

.overlay{
    background-color: black;
    opacity: 0.7;
    z-index: 999;
}

.modal{
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
}

.contents{
    position: relative;
    z-index: 1000;
    background-color: var(--main-bg-color);
    border: 1px solid var(--border-color);
    box-sizing: border-box;
    max-height: 100vh;
    max-width: 100vw;
    padding: 1em 3.5em 3em;
    border-radius: 4px;
}

.title {
    font-size: 0.8rem;
    font-weight: normal;
    margin-bottom: 3rem;
    text-align: center;
}

.buttonsContainer{
    margin-top: 1.5em;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1em;
}

.input {
    margin-left: 0.5rem;
    width: 20em;
    max-width: 100%;
}
</style>

<script>
export default {
    props: {
        title: {
            type: String,
            required: true,
        },
        cancelAction: {
            type: Function,
            required: true,
        },
        okAction: {
            type: Function,
            required: true,
        },
        okButtonText: {
            type: String,
            required: true,
        },
        isOkButtonDisabled: {
            type: Boolean,
            required: true,
        },
        tabIndexOffset: {
            type: Number,
            default: 0,
        },
    },
};
</script>