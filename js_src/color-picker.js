//color picker helper functionality
App.ColorPicker = (function(Pixel){
    //takes hex in form #ffffff and returns pixel
    function pixelFromColorPicker(hex){
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);
        return Pixel.create(r, g, b);
    }
    
    
    //takes array of hex colors in form #ffffff
    //and returns single Float32Array or rgb values (no alpha)
    function colorsToVecArray(hexColors, maxColors){
        let vec = new Float32Array(maxColors * 3);
        let offset = 0;
        
        hexColors.forEach((hex)=>{
            let r = parseInt(hex.substring(1, 3), 16);
            let g = parseInt(hex.substring(3, 5), 16);
            let b = parseInt(hex.substring(5, 7), 16);
            
            vec[offset++]   = r / 255.0;
            vec[offset++] = g / 255.0;
            vec[offset++] = b / 255.0;
        });
        
        
        return vec;
    }
    
    function createPalettes(){
        return [
            {title: 'Custom', isCustom: true},
            {title: 'Primaries', colors: ['#000000', '#ffffff', '#c40000', '#000075', '#ffff8a', '#6f207a', '#22531a', '#ff8800', '#40321e', '#f8c2f7', '#485ca4', '#87d255']},
            {title: 'Galaxy', colors: ['#0d3677', '#D2ebf0', '#763a70', '#f9d2f4', '#242440', '#cd20cd', '#c5c565', '#b17633', '#554d28', '#2e337a', '#fefde9', '#181823']},
            {title: 'Ketchup', colors: ['#074400', '#fed9ff', '#ca0d0d', '#e1fade', '#7d3190', '#291a21', '#f5f5b6', '#14361f', '#516f31', '#da3f69', '#432446', '#5e111d']},
            {title: 'Rust', colors: ['#060338', '#fadafe', '#bd6a2d', '#e4fafc', '#e2a867', '#203e8a', '#cd3232', '#3f7c62', '#7a3046', '#eae0a8', '#252645', '#fbcfa4']},
            {title: 'Slime', colors: ['#28012e', '#fcfde1', '#eedb51', '#8ab32d', '#852d97', '#271784', '#a93e2e', '#613f4e', '#332b80', '#4d1a1a', '#355a25', '#287177']},
            {title: 'Rose', colors: ['#200d10', '#fff2f2', '#c91837', '#f87263', '#790f47', '#4d2030', '#f1cdb8', '#ec2f13', '#ef3d4a', '#c1311c', '#371340', '#ffe1d5']},
            {title: 'Blue', colors: ['#00042b', '#fffff4', '#2459bd', '#649bf7', '#4d2266', '#2d1838', '#ede7bc', '#2d5b77', '#9e99dd', '#95fdb4', '#3a763c', '#fcd9b1']},
            {title: 'Hunter', colors: ['#151b12', '#f2fff0', '#89a240', '#bced8f', '#645c24', '#31291a', '#d9f0b9', '#bfc24b', '#936628', '#fafbca', '#743916', '#84792d']},
            {title: 'Lava', colors: ['#e8d566', '#bf1c1c', '#df4f4f', '#500c0e', '#dfb34a', '#9b3737', '#2c3f1f', '#ddf2c6', '#292114', '#fdeefd', '#443858', '#ebb8f8']},    
        ];
    }
    
    //based on: https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript?page=1&tab=votes#tab-top
    //note will not work on nested arrays/objects or NaN
    function areColorArraysIdentical(array1, array2){
        return array1.length == array2.length && array1.every((v,i)=> v === array2[i]);
    }
    
    return {
        pixelFromHex: pixelFromColorPicker,
        COLOR_REPLACE_DEFAULT_BLACK_VALUE: '#000000',
        COLOR_REPLACE_DEFAULT_WHITE_VALUE: '#ffffff',
        colorsToVecArray: colorsToVecArray,
        palettes: createPalettes(),
        areColorArraysIdentical: areColorArraysIdentical,
    };
    
})(App.Pixel);