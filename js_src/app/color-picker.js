//color picker helper functionality
App.ColorPicker = (function(Pixel, ArrayUtil){
    function parseHex(hex, callback){
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);
        
        callback(r, g, b);
    }
    
    //takes hex in form #ffffff and returns pixel
    function pixelFromColorPicker(hex){
        let ret;
        
        parseHex(hex, (r, g, b)=>{
           ret = Pixel.create(r, g, b); 
        });
        
        return ret;
    }
    
    function prepareForWorker(hexColors, array){
        let i = 0;
        hexColors.forEach((hex)=>{
            parseHex(hex, (r, g, b)=>{
                array[i++] = r;
                array[i++] = g;
                array[i++] = b;
            });
        });
    }
    
    
    //takes array of hex colors in form #ffffff
    //and returns single Float32Array or rgb values (no alpha)
    function colorsToVecArray(hexColors, maxColors){
        let vec = new Float32Array(maxColors * 3);
        let offset = 0;
        
        hexColors.forEach((hex)=>{
            parseHex(hex, (r, g, b)=>{
                vec[offset++]   = r / 255.0;
                vec[offset++] = g / 255.0;
                vec[offset++] = b / 255.0;
            });
        });
        
        
        return vec;
    }

    function randomHexColor(){
        //left pad based on: https://stackoverflow.com/questions/9909038/formatting-hexadecimal-number-in-javascript
        function randomHex(){
            return ('0' + Math.round(Math.random() * 255).toString(16)).substr(-2);
        }
        return `#${randomHex()}${randomHex()}${randomHex()}`;
    }
    
    function randomPalette(numColors){
        return ArrayUtil.create(numColors, randomHexColor);
    }
    
    //based on: https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript?page=1&tab=votes#tab-top
    //note will not work on nested arrays/objects or NaN
    function areColorArraysIdentical(array1, array2){
        return array1.length == array2.length && array1.every((v,i)=> v === array2[i]);
    }
    
    function pixelsToHexArray(pixels, length){
        function numToHex(num){
            let hex = num.toString(16);
            if(hex.length < 2){
                return '0' + hex;
            }
            return hex;
        }
        let ret = new Array(length).fill('#000000');
        for(let i=0,index=0;i<pixels.length;i+=3,index++){
            ret[index] = `#${numToHex(pixels[i])}${numToHex(pixels[i+1])}${numToHex(pixels[i+2])}`;
        }
        
        return ret;
    }
    
    return {
        pixelFromHex: pixelFromColorPicker,
        COLOR_REPLACE_DEFAULT_BLACK_VALUE: '#000000',
        COLOR_REPLACE_DEFAULT_WHITE_VALUE: '#ffffff',
        colorsToVecArray: colorsToVecArray,
        areColorArraysIdentical: areColorArraysIdentical,
        randomPalette: randomPalette,
        prepareForWorker: prepareForWorker,
        pixelsToHexArray: pixelsToHexArray,
    };
    
})(App.Pixel, App.ArrayUtil);