//from https://stackoverflow.com/questions/34941829/setting-focus-of-an-input-element-in-vue-js
//usage: <input v-scroll-into-view>

export default {
    mounted(el) {
        el.scrollIntoView({ behavior: 'smooth' });
    },
};
