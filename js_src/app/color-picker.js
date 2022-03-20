//color picker helper functionality

import Pixel from '../shared/pixel.js';


function parseHex(hex, callback){
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    
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
    const vec = new Float32Array(maxColors * 3);
    let offset = 0;
    
    hexColors.forEach((hex)=>{
        parseHex(hex, (r, g, b)=>{
            vec[offset++]   = r / 255;
            vec[offset++] = g / 255;
            vec[offset++] = b / 255;
        });
    });
    
    
    return vec;
}

//based on: https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript?page=1&tab=votes#tab-top
//note will not work on nested arrays/objects or NaN
function areColorArraysIdentical(array1, array2){
    return array1.length == array2.length && array1.every((v,i)=> v === array2[i]);
}

function pixelsToHexArray(pixels){
    function numToHex(num){
        const hex = num.toString(16);
        if(hex.length < 2){
            return '0' + hex;
        }
        return hex;
    }
    const pixelsLength = pixels.length;
    const ret = new Array(pixelsLength / 3);
    
    for(let i=0,index=0;i<pixelsLength;i+=3,index++){
        ret[index] = `#${numToHex(pixels[i])}${numToHex(pixels[i+1])}${numToHex(pixels[i+2])}`;
    }
    
    return ret;
}

export function defaultBwColors(){
    const DEFAULT_BLACK_VALUE = '#000000';
    const DEFAULT_WHITE_VALUE = '#ffffff';

    return [DEFAULT_BLACK_VALUE, DEFAULT_WHITE_VALUE];
}

export default {
    defaultBwColors,
    pixelFromHex: pixelFromColorPicker,
    colorsToVecArray,
    areColorArraysIdentical,
    prepareForWorker,
    pixelsToHexArray,
};