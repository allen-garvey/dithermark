//from https://stackoverflow.com/questions/34941829/setting-focus-of-an-input-element-in-vue-js
//usage: <input v-focus>

export default{
    name: 'focus',
    mounted(el){
        el.focus();
    }
};
