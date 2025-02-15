<template>
    <div v-scroll-into-view>
        <div ref="colorPickerContainer" :class="$style.colorPickerContainer" ß>
            <photoshop-picker
                :modelValue="selectedColor"
                :should-live-update="shouldLiveUpdate"
                @update:modelValue="bubbleEvent('update:modelValue', $event)"
                @ok="bubbleEvent('ok', $event)"
                @cancel="bubbleEvent('cancel', $event)"
            />
        </div>
        <div :class="$style.colorPickerOverlay" @click="getAttention"></div>
    </div>
</template>

<style lang="scss" module>
@keyframes scaleAnimation {
    0% {
        transform: scale(1, 1);
    }
    40% {
        transform: scale(1.1, 1.1);
    }
    100% {
        transform: scale(1, 1);
    }
}

.colorPickerContainer {
    display: inline-block;
    position: relative;
    z-index: 100;
    background-color: var(--pinned-controls-bg-color);
    box-shadow: -1px 2px 4px rgba(0, 0, 0, 0.3);
    margin: 8px 0 16px;
    border-radius: 2px;
    border: 1px solid var(--border-color);
    &.attentionAnimation {
        animation-name: scaleAnimation;
        animation-duration: 0.7s;
    }
}

//this is so none of the other controls except the color picker are selectable
.colorPickerOverlay {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    opacity: 0.6;
    //z-index must be higher than .faux-color-input
    z-index: 2;
    background-color: var(--pinned-controls-bg-color);
    cursor: not-allowed;
}
</style>

<script>
import PhotoshopPicker from './vue-color/src/components/Photoshop.vue';
import ScrollIntoViewDirective from './directives/scroll-into-view.js';

export default {
    props: {
        selectedColor: {
            type: String,
            required: true,
        },
        shouldLiveUpdate: {
            type: Boolean,
            required: true,
        },
    },
    components: {
        PhotoshopPicker,
    },
    directives: {
        scrollIntoView: ScrollIntoViewDirective,
    },
    methods: {
        bubbleEvent(name, args) {
            this.$emit(name, args);
        },
        getAttention() {
            const container = this.$refs.colorPickerContainer;
            container.scrollIntoView({ behavior: 'smooth' });
            container.classList.remove(this.$style.attentionAnimation);
            //from https://css-tricks.com/restart-css-animation/
            //we need to do this to retrigger the animation
            //we are saving offsetWidth and returning it so
            //google closure compiler doesn't optimize it out
            const ret = container.offsetWidth;
            container.classList.add(this.$style.attentionAnimation);
            return ret;
        },
    },
};
</script>
