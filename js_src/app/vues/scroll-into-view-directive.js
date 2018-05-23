//from https://stackoverflow.com/questions/34941829/setting-focus-of-an-input-element-in-vue-js
//usage: <input v-focus>
(function(Vue){
    Vue.directive('scrollIntoView', {
        inserted: function (el){
            el.scrollIntoView({behavior: 'smooth'});
        }
    });
})(window.Vue);