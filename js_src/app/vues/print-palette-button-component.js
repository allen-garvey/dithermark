(function(Vue){
    Vue.component('print-palette-button', {
        template: document.getElementById('print-palette-button-component'),
        props: ['colors'],
        methods: {
            printPalette: function(){
                //used to simplify palette creation
                const paletteString = JSON.stringify(this.colors).replace(/"/g, '\'').replace(/,/g, ', ');
                console.log(paletteString);

                //copies palette to clipboard
                //will only work on chrome when served over https or localhost
                //note this happens asynchronously
                if(navigator.clipboard && navigator.clipboard.writeText){
                    navigator.clipboard.writeText(paletteString);
                }
            },
        },
    });

})(window.Vue);