import PixelMath from '../shared/pixel-math.js';
import ColorDitherModes from '../shared/color-dither-modes.js';


function identity(item) {
    return item;
}

//hsl values have to be between 0.0-1.0 for 
//comparing distances to work correctly
function pixelToHsl(pixel) {
    const ret = new Uint16Array(3);
    ret[0] = PixelMath.hue(pixel);
    ret[1] = PixelMath.saturation(pixel);
    ret[2] = PixelMath.lightness(pixel);
    return ret;
}

function distance1d(value1, value2) {
    return Math.abs(value1 - value2);
}

function distanceHue(item1, item2) {
    const hueDist = PixelMath.hueDistance(item1[0], item2[0]) / 360;

    if (item1[1] < 7) {
        const fraction = item1[1] / 7;
        const lightnesstDist = Math.abs(item1[2] - item2[2]) / 255;
        return 4 * fraction * hueDist * hueDist + (1 - fraction) * lightnesstDist * lightnesstDist;
    }

    return hueDist * hueDist;
}

function distanceHueLightness(item1, item2) {
    const hueDist = PixelMath.hueDistance(item1[0], item2[0]) / 360;
    const lightnessDist = (item1[2] - item2[2]) / 255;

    if (item1[1] < 30) {
        const fraction = item1[1] / 30;
        return 2 * fraction * hueDist * hueDist + (1 - fraction) * lightnessDist * lightnessDist;
    }

    return 32 * hueDist * hueDist + lightnessDist * lightnessDist;
}

function distanceHslWeighted(item1, item2) {
    const hueDist = PixelMath.hueDistance(item1[0], item2[0]) / 360;
    const satDist = Math.abs(item1[1] - item2[1]) / 100;
    const lighnesstDist = Math.abs(item1[2] - item2[2]) / 255;

    return hueDist * hueDist * 8 + satDist * satDist + lighnesstDist * lighnesstDist * 32;
}


function distance3d(item1, item2) {
    const dist1 = item1[0] - item2[0];
    const dist2 = item1[1] - item2[1];
    const dist3 = item1[2] - item2[2];

    return dist1 * dist1 + dist2 * dist2 + dist3 * dist3;
}

//rgb with correction for luma based on: http://www.tannerhelland.com/3643/grayscale-image-algorithm-vb6/
function distanceLuma(item1, item2) {
    const distR = item1[0] - item2[0];
    const distG = item1[1] - item2[1];
    const distB = item1[2] - item2[2];
    return distR * distR * 0.299 + distG * distG * 0.587 + distB * distB * 0.114;
}


/**
 * Functions for error prop dither
*/

function incrementHueValue(hue, incrementValue) {
    return Math.abs(Math.round(hue + incrementValue) % 360);
}

function incrementHsl(hslValues, incrementValues) {
    return [
        incrementHueValue(hslValues[0], incrementValues[0]),
        PixelMath.clamp(hslValues[1] + incrementValues[1], 100),
        PixelMath.clamp(hslValues[2] + incrementValues[2]),
    ];
}

function incrementLightness(lightnessValue, incrementValues) {
    return PixelMath.clamp(lightnessValue + incrementValues[0]);
}

function incrementRgb(rgbValue, incrementValues) {
    return [
        PixelMath.clamp(rgbValue[0] + incrementValues[0]),
        PixelMath.clamp(rgbValue[1] + incrementValues[1]),
        PixelMath.clamp(rgbValue[2] + incrementValues[2]),
    ];
}

function getHueError(expectedValue, actualValue) {
    let distance = PixelMath.hueDistance(expectedValue, actualValue);

    const diff = (actualValue + distance) % 360;

    if (diff !== expectedValue) {
        distance = distance * -1;
    }
    return distance;
}

function errorAmountHsl(expectedValue, actualValue, buffer) {
    buffer[0] = getHueError(expectedValue[0], actualValue[0]);
    buffer[1] = Math.round(expectedValue[1] - actualValue[1]) % 100;
    buffer[2] = expectedValue[2] - actualValue[2];
    return buffer;
}

function errorAmountHue(expectedValue, actualValue, buffer) {
    buffer[0] = getHueError(expectedValue[0], actualValue[0]);
    buffer[1] = 0;
    buffer[2] = 0;
    return buffer;
}

function errorAmountHl(expectedValue, actualValue, buffer) {
    buffer[0] = getHueError(expectedValue[0], actualValue[0]);
    buffer[1] = 0;
    buffer[2] = expectedValue[2] - actualValue[2];
    return buffer;
}

function errorAmount1d(expectedValue, actualValue, buffer) {
    buffer[0] = expectedValue - actualValue;
    return buffer;
}

function errorAmount3d(expectedValues, actualValues, buffer) {
    buffer[0] = expectedValues[0] - actualValues[0];
    buffer[1] = expectedValues[1] - actualValues[1];
    buffer[2] = expectedValues[2] - actualValues[2];
    return buffer;
}


const exports = {};
exports[ColorDitherModes.get('LIGHTNESS').id] = {
    pixelValue: PixelMath.lightness,
    distance: distance1d,
    dimensions: 1,
    incrementValue: incrementLightness,
    errorAmount: errorAmount1d,
};
exports[ColorDitherModes.get('HUE').id] = {
    pixelValue: pixelToHsl,
    distance: distanceHue,
    dimensions: 3, //need 3 dimensions because we are using hsl function
    incrementValue: incrementHsl,
    errorAmount: errorAmountHue,
};
exports[ColorDitherModes.get('HUE_LIGHTNESS').id] = {
    pixelValue: pixelToHsl,
    distance: distanceHueLightness,
    dimensions: 3, //need 3 dimensions because we are using hsl function
    incrementValue: incrementHsl,
    errorAmount: errorAmountHl,
};
exports[ColorDitherModes.get('HSL_WEIGHTED').id] = {
    pixelValue: pixelToHsl,
    distance: distanceHslWeighted,
    dimensions: 3,
    incrementValue: incrementHsl,
    errorAmount: errorAmountHsl,
};
exports[ColorDitherModes.get('RGB').id] = {
    pixelValue: identity,
    distance: distance3d,
    dimensions: 3,
    incrementValue: incrementRgb,
    errorAmount: errorAmount3d,
};

exports[ColorDitherModes.get('LUMA').id] = {
    pixelValue: identity,
    distance: distanceLuma,
    dimensions: 3,
    incrementValue: incrementRgb,
    errorAmount: errorAmount3d,
};

export default exports;