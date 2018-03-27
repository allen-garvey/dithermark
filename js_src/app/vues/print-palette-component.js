(function(Vue){
    Vue.component('print-palette-button', {
        template: `<button @click="printPalette">Print palette</button>`,
        props: ['colors'],
        methods: {
            printPalette: function(){
                //used to simplify palette creation
                console.log(JSON.stringify(this.colors).replace(/"/g, '\'').replace(/,/g, ', '));
            },
        },
    });

})(window.Vue);