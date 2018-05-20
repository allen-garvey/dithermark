//from https://stackoverflow.com/questions/34941829/setting-focus-of-an-input-element-in-vue-js
//usage: <input v-focus>
(function(Vue){
    Vue.directive('focus', {
        inserted: function (el) {
            el.focus()
        }
    });
})(window.Vue);