import VueColor from 'dithermark-vue-color';
import ScrollIntoViewDirective from './scroll-into-view-directive.js';

export default {
    name: 'color-picker',
    template: document.getElementById('color-picker-component'),
    props: ['selectedColor', 'shouldLiveUpdate'],
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