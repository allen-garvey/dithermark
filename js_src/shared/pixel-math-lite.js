/*
 * Separate pixelmath module for color input component, since otherwise tree shaking doesn't work correctly 
 */


export function lightness(pixel){
    const max = Math.max(pixel[0], pixel[1], pixel[2]);
    const min = Math.min(pixel[0], pixel[1], pixel[2]);
    return Math.floor((max + min) / 2.0);
}