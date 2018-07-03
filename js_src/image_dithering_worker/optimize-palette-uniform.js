/**
 * Uniform palette color quantization
 */
App.OptimizePaletteUniform = (function(ArrayUtil, PixelMath, Perceptual){
    function generateSaturations(numColors){
        //since index starts at 0
        const greatestColorIndex = numColors - 1;
        const greyOffset = Math.max(Math.round(6 - numColors / 4), 0);
        const multiplier = (100 - greyOffset * 2) / greatestColorIndex;
        return ArrayUtil.create(numColors, (i)=>{
            return Math.min(Math.round(i * multiplier) + greyOffset, 100);
        }, Uint8Array);
    }

    function generateLightnesses(numColors){
        //since index starts at 0
        const greatestColorIndex = numColors - 1;
        const blackOffset = Math.max(Math.round(32 - numColors / 4), 0);
        const range = 255 - blackOffset - Math.max(blackOffset - greatestColorIndex, 0);
        const multiplier = range / greatestColorIndex;
        return ArrayUtil.create(numColors, (i)=>{
            return Math.min(Math.round(i * multiplier) + blackOffset, 255);
        }, Uint8Array);
    }

    function generateHues(numColors, isRotated=false){
        //don't need greatest color index, since hues wrap around
        const multiplier = 360 / numColors;
        const offset = isRotated ? multiplier / 2 : 0;

        const hues = ArrayUtil.create(numColors, (i)=>{
            return Math.round(i * multiplier + offset) % 360;
        }, Uint16Array);

        const halfLimit = Math.ceil(numColors / 2);
        const halfOffset = Math.floor(numColors / 2);
        for(let i=1;i<halfLimit;i+=2){
            const temp = hues[i+halfOffset];
            hues[i+halfOffset] = hues[i];
            hues[i] = temp;
        }

        //rotate hues so that red is in the middle, and is the most saturated
        const huesRet = new Uint16Array(numColors);
        for(let i=0;i<numColors;i++){
            huesRet[(i+halfOffset) % numColors] = hues[i];
        }

        return huesRet;
    }


    function uniformColorQuantization(_pixels, numColors, colorQuantization, _imageWidth, _imageHeight){
        const hues = generateHues(numColors, colorQuantization.isRotated);
        console.log('hues');
        console.log(hues);
        const saturations = generateSaturations(numColors);
        console.log('saturations');
        console.log(saturations);
        const lightnesses = generateLightnesses(numColors);
        console.log('lightness');
        console.log(lightnesses);

        const hsl = Perceptual.zipHsl(hues, saturations, lightnesses, numColors);
        console.log('hsl');
        console.log(hsl);
        return PixelMath.hslArrayToRgb(hsl);
    }
    
    return {
       uniform: uniformColorQuantization,
    };
})(App.ArrayUtil, App.PixelMath, App.OptimizePalettePerceptual);