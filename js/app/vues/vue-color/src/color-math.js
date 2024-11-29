// stripped down version of tinycolor2

/*
Copyright (c), Brian Grinstead, http://briangrinstead.com

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


function createColor(input){
    let hex, rgb, hsv;
    if(typeof input === 'string'){
        hex = input;
        rgb = hexStringToRgb(hex);
    }
    else if('hex' in input){
        hex = input.hex;
        rgb = hexStringToRgb(hex);
    }
    else if('v' in input){
        hsv = input;
        rgb = hsvToRgb(input.h, input.s, input.v);
    }
    //rgb input
    else{
        rgb = input;
    }
    hsv = hsv || rgbToHsv(rgb.r, rgb.g, rgb.b);
    hex = hex || rgbToHex(rgb.r, rgb.g, rgb.b);

    return {
        rgb,
        hsv,
        hex,
    };
}

/**
 * HSV stuff
 */

// Converts an HSV color value to RGB.
// *Assumes:* h is contained in [0, 360] and s and v are contained in [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
function hsvToRgb(h, s, v) {

    h = h / 360 * 6;
    s /= 100
    v /= 100

    const i = Math.floor(h);
    const f = h - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    const mod = i % 6;
    const r = [v, q, p, p, t, v][mod];
    const g = [t, v, v, q, p, p][mod];
    const b = [p, p, t, v, v, q][mod];

    return { r: r * 255, g: g * 255, b: b * 255 };
}


// Converts an RGB color value to HSV
// *Assumes:* r, g, and b are contained in the set [0, 255]
// *Returns:* { h, s, v }
//h in [0, 360]
//s,v in [0,100]
function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if(max === min) {
        h = 0; // achromatic
    }
    else {
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { 
        h: h * 360, 
        s: s * 100, 
        v: v * 100,
    };
}

/**
 * Hex string stuff
 */

function isHexStringValid(hexString){
    return !!hexStringToRgb(hexString);
}

// Parse a base-16 hex value into a base-10 integer
function parseIntFromHex(val) {
    return parseInt(val, 16);
}

const matchers = {
    hex3: /^#?([0-9a-f]{1})([0-9a-f]{1})([0-9a-f]{1})$/,
    hex6: /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/,
    hex4: /^#?([0-9a-f]{1})([0-9a-f]{1})([0-9a-f]{1})([0-9a-f]{1})$/,
    hex8: /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/
};


function hexStringToRgb(hexString) {
    hexString = hexString.replace(/^\s+|\s+$/, '').toLowerCase();

    // Try to match string input using regular expressions.
    let match;
    if ((match = matchers.hex8.exec(hexString))) {
        return {
            r: parseIntFromHex(match[1]),
            g: parseIntFromHex(match[2]),
            b: parseIntFromHex(match[3]),
        };
    }
    if ((match = matchers.hex6.exec(hexString))) {
        return {
            r: parseIntFromHex(match[1]),
            g: parseIntFromHex(match[2]),
            b: parseIntFromHex(match[3]),
        };
    }
    if ((match = matchers.hex4.exec(hexString))) {
        return {
            r: parseIntFromHex(match[1] + '' + match[1]),
            g: parseIntFromHex(match[2] + '' + match[2]),
            b: parseIntFromHex(match[3] + '' + match[3]),
        };
    }
    if ((match = matchers.hex3.exec(hexString))) {
        return {
            r: parseIntFromHex(match[1] + '' + match[1]),
            g: parseIntFromHex(match[2] + '' + match[2]),
            b: parseIntFromHex(match[3] + '' + match[3]),
        };
    }

    return false;
}

// Converts an RGB color to hex
// Assumes r, g, and b are contained in the set [0, 255]
// Returns a 3 or 6 character hex
function rgbToHex(r, g, b, allow3Char=false) {

    const hex = [
        pad2(Math.round(r).toString(16)),
        pad2(Math.round(g).toString(16)),
        pad2(Math.round(b).toString(16))
    ];

    // Return a 3 character hex if possible
    if (allow3Char && hex[0].charAt(0) === hex[0].charAt(1) && hex[1].charAt(0) === hex[1].charAt(1) && hex[2].charAt(0) ===hex[2].charAt(1)) {
        return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
    }

    return hex.join('');
}

// Force a hex value to have 2 characters
function pad2(c) {
    return c.length == 1 ? '0' + c : '' + c;
}


export default {
    createColor,
    isHexStringValid,
};