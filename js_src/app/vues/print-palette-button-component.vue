<template>
<!-- //inline styles only, since we are only including this component in debug builds -->
<div style="display:inline-block;">
    <button class="btn btn-default btn-sm" @click="printPalette" title="Print current color palette to console">Print</button>
    <!-- //can't have textarea display: none, or copying won't work -->
    <textarea ref="copyTextarea" style="position: absolute;right: 100000px;"></textarea>
</div>
</template>

<script>
export default {
    name: 'print-palette-button',
    props: {
        colors: {
            type: Array,
            required: true,
        },
    },
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
</script>