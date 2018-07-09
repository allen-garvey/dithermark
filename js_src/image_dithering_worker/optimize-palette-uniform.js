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

    //picks red hues from 300-70
    function redHues(count, isRotated=false){
        const width = 130;
        const start = 300;
        const end = 70;
        const multiplier = width / count;
        const offset = isRotated ? multiplier / 2 : 0;
        const ret = new Uint16Array(count);
        for(let i=0;i<count;i++){
            let hue = Math.round(i * multiplier + offset);
            if(hue > end){
                hue = (hue + start) % 360
            } 
            ret[i] = hue;
        }
        //make sure red (0) is in middle so it is most saturated
        if(count > 2){
            const half = Math.floor(count / 2) - 1;
            const temp = ret[half];
            ret[half] = ret[0];
            ret[0] = temp;
        }

        return ret;
    }

    //picks green hues from 70-200
    function greenHues(count, isRotated=false){
        const start = 70;
        const width = 130;
        const limit = start + width;
        const middle = start + width / 2;
        const multiplier = width / count;
        const offset = isRotated ? multiplier / 2 : 0;
        const ret = new Uint16Array(count);
        for(let i=0;i<count;i++){
            let hue = Math.round(i * multiplier + middle + offset) % 360;
            if(hue > limit){
                hue = (hue + (360 - start)) % 360;
            }
            ret[i] = hue;
        }
        return ret;
    }

    //picks blue hues from 200-300
    function blueHues(count, isRotated=false){
        const start = 200;
        const width = 100;
        const limit = start + width;
        const middle = start + width / 2;
        const multiplier = width / count;
        const offset = isRotated ? multiplier / 2 : 0;
        const ret = new Uint16Array(count);
        for(let i=0;i<count;i++){
            let hue = Math.round(i * multiplier + middle + offset) % 360;
            if(hue > limit){
                hue = (hue + (360 - start)) % 360;
            }
            ret[i] = hue;
        }
        return ret;
    }

    function calculateHueCounts(numColors, isRotated=false){
        if(isRotated){
            const greenCount = numColors <= 3 ? 1 : Math.round(2 * numColors / 5);
            const redCount = numColors <= 3 ? 1 : Math.floor((numColors - greenCount) * 5 / 8);
            const blueCount = numColors - redCount - greenCount;
            
            return {
                redCount,
                greenCount,
                blueCount
            };
        }

        const redCount = numColors === 3 ? 1 : Math.ceil(numColors / 2);
        const greenCount = numColors === 3 ? 1 : Math.floor((numColors - redCount) * 2 / 3);
        const blueCount = numColors - redCount - greenCount;
        
        return {
            redCount,
            greenCount,
            blueCount
        };
    }

    //make red hue the center hue, since it will be most vibrant
    function centerRedHue(hues){
        function distanceToRed(hue){
            return Math.min(hue, 360 - hue);
        }

        const length = hues.length;

        let mostRedIndex = 0;
        let leastDistanceToRed = Infinity;

        hues.forEach((hue, i)=>{
            const currentDistanceToRed = distanceToRed(hue);
            if(currentDistanceToRed < leastDistanceToRed){
                leastDistanceToRed = currentDistanceToRed;
                mostRedIndex = i;
            }
        });
        const ret = new Uint16Array(length);
        const halfIndex = Math.max(Math.floor(hues.length / 2) - 1, 0);
        let offset = mostRedIndex - halfIndex;
        if(offset < 0){
            offset = length + offset;
        }
        for(let i=0;i<length;i++){
            ret[i] = hues[(i+offset) % length];
        }


        return ret;
    }


    function generateHues(numColors, isRotated=false){
        const {redCount, greenCount, blueCount} = calculateHueCounts(numColors, isRotated);

        const reds = redHues(redCount, isRotated);
        const greens = greenHues(greenCount, isRotated);
        const blues = blueHues(blueCount, isRotated);

        let hues = new Uint16Array(numColors);

        let redIndex = 0;
        let greenIndex = 0;
        let blueIndex = 0;
        if(isRotated){
            //shuffle hues, so we get sequence g,b,r
            for(let i=0,colorIndex=0;i<numColors;i++){
                if(colorIndex === 1 && blueIndex < blues.length){
                    hues[i] = blues[blueIndex++];
                }
                else if(colorIndex === 2 && redIndex < reds.length){
                    hues[i] = reds[redIndex++];
                }
                else{
                    hues[i] = greens[greenIndex++];
                }
                colorIndex = (colorIndex + 1) % 3;
            }

            // hues = centerRedHue(hues);
        }
        else{
            //shuffle hues, so we get sequence b,r,g
            for(let i=0,colorIndex=0;i<numColors;i++){
                if(colorIndex === 0 && blueIndex < blues.length){
                    hues[i] = blues[blueIndex++];
                }
                else if(colorIndex === 1 && greenIndex < greens.length){
                    hues[i] = greens[greenIndex++];
                }
                else{
                    hues[i] = reds[redIndex++];
                }
                colorIndex = (colorIndex + 1) % 3;
            }
            hues = centerRedHue(hues);
        }

        return hues;
    }


    function uniformColorQuantization(_pixels, numColors, colorQuantization, _imageWidth, _imageHeight){
        const hues = generateHues(numColors, colorQuantization.isRotated);
        const saturations = generateSaturations(numColors);
        const lightnesses = generateLightnesses(numColors);

        const hsl = Perceptual.zipHsl(hues, saturations, lightnesses, numColors);
        return PixelMath.hslArrayToRgb(hsl);
    }
    
    return {
       uniform: uniformColorQuantization,
    };
})(App.ArrayUtil, App.PixelMath, App.OptimizePalettePerceptual);