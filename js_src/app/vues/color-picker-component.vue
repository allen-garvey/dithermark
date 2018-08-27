<template>
    <div v-scroll-into-view>
        <div ref="colorPickerContainer" class="color-picker-container">
            <photoshop-picker :value="selectedColor" :should-live-update="shouldLiveUpdate" @input="bubbleEvent('input', $event)" @ok="bubbleEvent('ok', $event)" @cancel="bubbleEvent('cancel', $event)" />
        </div>
        <div class="color-picker-overlay" @click="getAttention"></div>
    </div>
</template>

<script>
import VueColor from 'dithermark-vue-color';
import ScrollIntoViewDirective from './scroll-into-view-directive.js';

export default {
    name: 'color-picker',
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
        'photoshop-picker': VueColor.VueColor.Photoshop,
    },
    directives: {
        'scroll-into-view': ScrollIntoViewDirective,
    },
    methods: {
        bubbleEvent(name, args){
            this.$emit(name, args);
        },
        getAttention(){
            const container = this.$refs.colorPickerContainer;
            container.scrollIntoView({behavior: 'smooth'})
            container.classList.remove('attention-animation');
            //from https://css-tricks.com/restart-css-animation/
            //we need to do this to retrigger the animation
            //we are saving offsetWidth and returning it so 
            //google closure compiler doesn't optimize it out
            const ret = container.offsetWidth;
            container.classList.add('attention-animation');
            return ret;
        },
    },
};
</script>