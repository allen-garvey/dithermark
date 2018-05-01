/**
 * Script used to assist generating 'Uniform' color palettes
 */
(function(){
    //uniform color 1 hues
    // let hues = [270, 180, 120, 30, 0, 210, 60, 150, 300, 90, 240, 330];
    //uniform color 2 hues
    let hues = [285, 165, 225, 315, 195, 15, 45, 135, 255, 75, 345, 105];
    let lightnesses = [32, 58, 70, 86, 104, 122, 140, 158, 176, 194, 212, 230];
    // let saturations = [10, 24, 38, 52, 66, 80, 87, 73, 59, 45, 31, 17];
    // let saturations = [6, 18, 30, 42, 54, 66, 72, 60, 48, 36, 24, 12];
    let saturations = [6, 13, 34, 41, 62, 69, 83, 76, 55, 48, 27, 20];

    function zip(hues, saturations, lightnesses){
        let ret = new Uint16Array(hues.length * 3);
        for(let i=0;i<hues.length;i++){
            const offset = i*3;
            ret[offset] = hues[i];
            ret[offset+1] = saturations[i];
            ret[offset+2] = lightnesses[i];
        }
        return ret;
    }

    var Pixel = {
        R_INDEX: 0,
        G_INDEX: 1,
        B_INDEX: 2,
        create: ()=>{
            return new Uint8Array(4);
        }
    };

    function hslArrayToRgb(hslArray){
        let pixel = Pixel.create(0, 0, 0);
        let rgbArray = new Uint8Array(hslArray.length);
        
        for(let i=0;i<hslArray.length;i+=3){
            let hsl = hslArray.subarray(i, i+3);
            pixel = hslToPixel(hsl, pixel);
            
            rgbArray[i] = pixel[0];
            rgbArray[i+1] = pixel[1];
            rgbArray[i+2] = pixel[2];
        }
        
        return rgbArray;
    }
    
    /**
     * based on https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
     * converts a hue in range 0-360, saturation in range 0-100 and lightness in range 0-255 to an rgb Pixel
     *
     */
    function hslToPixel(hsl, pixel=null){
        if(!pixel){
            pixel = Pixel.create(0, 0, 0);
        }
        let hue = hsl[0];
        let saturation = hsl[1];
        let lightness = hsl[2];
        
        if(saturation === 0){
            pixel[0] = lightness;
            pixel[1] = lightness;
            pixel[2] = lightness;
            return pixel;
        }
        
        hue /= 360;
        let s = saturation / 100;
        let l = lightness / 255;
    
        let hue2rgb = function hue2rgb(p, q, t){
            if(t < 0){
                t += 1;   
            }
            else if(t > 1){
                t -= 1;   
            }
            if(t < 1/6){ 
                return p + (q - p) * 6 * t;
            }
            else if(t < 1/2){
                return q;
            }
            else if(t < 2/3){
                return p + (q - p) * (2/3 - t) * 6;
            }
            return p;
        };
    
        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        let r = hue2rgb(p, q, hue + 1/3);
        let g = hue2rgb(p, q, hue);
        let b = hue2rgb(p, q, hue - 1/3);
        
        pixel[Pixel.R_INDEX] = Math.round(r * 255);
        pixel[Pixel.G_INDEX] = Math.round(g * 255);
        pixel[Pixel.B_INDEX] = Math.round(b * 255);
        
        return pixel;
    }

    function pixelsToHexArray(pixels, length){
        function numToHex(num){
            let hex = num.toString(16);
            if(hex.length < 2){
                return '0' + hex;
            }
            return hex;
        }
        let ret = new Array(length);
        ret.fill('#000000');
        for(let i=0,index=0;i<pixels.length;i+=3,index++){
            ret[index] = `#${numToHex(pixels[i])}${numToHex(pixels[i+1])}${numToHex(pixels[i+2])}`;
        }
        
        return ret;
    }
    // console.log(hslArrayToRgb(zip(hues, saturations, lightnesses)));
    const hexColors = JSON.stringify(pixelsToHexArray(hslArrayToRgb(zip(hues, saturations, lightnesses)), hues.length)).replace(/"/g, '\''); 
    console.log(hexColors);
    //requires chrome 66
    // navigator.clipboard.writeText(hexColors);

})();

/*
//hues generation
var h = [];
for(let i=0;i<360;i+=30){
    h.push(i);
}
console.log(h);


//lightnesses generation
var l = [];
for(let i=0;i<12;i++){
    l.push(i * 18 + 32);
}
console.log(l);


//saturation generation
var s = [];
for(let i=0;i<12;i++){
    s.push(i * 7 + 6);
}
console.log(s);
*/