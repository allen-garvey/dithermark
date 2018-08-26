export default {
    name: 'print-palette-button',
    template: document.getElementById('print-palette-button-component'),
    props: ['colors'],
    methods: {
        printPalette(){
            //used to simplify palette creation
            const paletteString = JSON.stringify(this.colors).replace(/"/g, '\'').replace(/,/g, ', ');
            console.log(paletteString);
            
            //copy palette to clipboard
            //will only work on chrome when served over https or localhost
            //note this happens asynchronously
            if(navigator.clipboard && navigator.clipboard.writeText){
                navigator.clipboard.writeText(paletteString);
            }
            //copy using older clipboard api
            //from: https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
            else{
                const textarea = this.$refs.copyTextarea;
                textarea.value = paletteString;
                textarea.select();
                document.execCommand('copy');
            }
        },
    },
};