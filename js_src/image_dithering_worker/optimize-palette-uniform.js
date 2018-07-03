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

    function redHues(count){
        const width = 120;
        const multiplier = width / count;
        const ret = new Uint16Array(count);
        for(let i=0;i<count;i++){
            let hue = Math.round(i * multiplier);
            if(hue > 60){
                hue = (hue + 300) % 360
            } 
            ret[i] = hue;
        }
        return ret;
    }

    function greenHues(count){
        const offset = 60;
        const width = 120;
        const limit = offset + width;
        const middle = offset + width / 2;
        const multiplier = width / count;
        const ret = new Uint16Array(count);
        for(let i=0;i<count;i++){
            let hue = Math.round(i * multiplier + middle) % 360;
            if(hue > limit){
                hue = (hue + (360 - offset)) % 360;
            }
            ret[i] = hue;
        }
        return ret;
    }

    function blueHues(count){
        const offset = 180;
        const width = 120;
        const limit = offset + width;
        const middle = offset + width / 2;
        const multiplier = width / count;
        const ret = new Uint16Array(count);
        for(let i=0;i<count;i++){
            let hue = Math.round(i * multiplier + middle) % 360;
            if(hue > limit){
                hue = (hue + (360 - offset)) % 360;
            }
            ret[i] = hue;
        }
        return ret;
    }

    function generateHues(numColors, isRotated=false){
        const redCount = numColors === 3 ? 1 : Math.ceil(numColors / 2);
        const greenCount = numColors === 3 ? 1 : Math.ceil((numColors - redCount) * 2 / 3);
        const blueCount = numColors - redCount - greenCount;

        const reds = redHues(redCount);
        const greens = greenHues(greenCount);
        const blues = blueHues(blueCount);

        const hues = new Uint16Array(numColors);

        blues.forEach((hue, i)=>{
            hues[i] = hue;
        });

        reds.forEach((hue, i)=>{
            hues[i + blues.length] = hue;
        });

        greens.forEach((hue, i)=>{
            hues[i + reds.length + blues.length] = hue;
        });

        // for(let i=0;i<numColors;i++){
        //     huesRet[(i+halfOffset) % numColors] = hues[i];
        // }

        return hues;
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