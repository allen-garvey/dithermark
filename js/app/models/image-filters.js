//values used in global settings- Image tab

import ArrayUtil from '../../shared/array-util.js';


//imageDimensions = height * width
//percentage is 0-100
//returns percentage 0-100
function calculatePixelationZoom(imageDimensions, percentage) {
    if (percentage >= 100) {
        return 100;
    }
    //based on 720 x 960 image, since large images won't be pixelized enough
    const baseDimensions = Math.min(691200, imageDimensions) * percentage;
    return Math.ceil(baseDimensions / imageDimensions);
}

function pixelationValues(imageDimensions) {
    return [100, 70, 60, 50, 45, 40, 37, 35, 32, 30, 27, 25, 22, 20, 17, 15, 12, 10, 7, 5, 4, 3].map((zoomPercentage) => {
        return calculatePixelationZoom(imageDimensions, zoomPercentage);
    });
}

function outlineContourRadiusPercentages() {
    const step = 0.25;
    return ArrayUtil.create(48, (i) => {
        return i * step + step;
    }).concat(ArrayUtil.create(36, (i) => {
        return (i + 1) * 0.5 + 12;
    }))
        .concat(ArrayUtil.create(10, (i) => {
            return (i + 1) + 30;
        }));
}

function outlineEdgeStrengths() {
    return [0.2, 0.25, 0.3, 0.35, 0.4, 0.45];
}

function outlineEdgeThicknesses() {
    return ArrayUtil.create(10, (i) => {
        return i + 1;
    });
}

function outlineFilterTypes() {
    return [
        { title: 'None', id: 0 },
        { title: 'Edge', id: 1 },
        { title: 'Contour', id: 2 },
    ];
}

function outlineColorModes() {
    return [
        { title: 'Fixed', id: 1 },
        { title: 'Palette (Hue)', id: 2, distanceFuncPrefix: 'hue' },
        { title: 'Palette (Hue & Lightness)', id: 3, distanceFuncPrefix: 'hue-lightness' },
        { title: 'Palette (HSL)', id: 4, distanceFuncPrefix: 'hsl2' },
        { title: 'Palette (Lightness)', id: 5, distanceFuncPrefix: 'lightness' },
        { title: 'Palette (RGB)', id: 6, distanceFuncPrefix: 'rgb' },
        { title: 'Palette (Luma)', id: 7, distanceFuncPrefix: 'luma' },
        { title: 'Palette (Complement)', id: 8, distanceFuncPrefix: 'hsl2-complementary' },
    ];
}

function outlineOpacities() {
    return [0.03, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 1];
}

//used for blending fixed outline color with dithered output
//values from: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
//all values might not be supported, so have to be tested first
function canvasBlendModes() {
    //from: https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return [
        { title: 'Normal', value: 'source-over' },
        { value: 'overlay' },
        { title: 'Soft light', value: 'soft-light' },
        { title: 'Hard light', value: 'hard-light' },
        { value: 'multiply' },
        { title: 'Burn', value: 'color-burn' },
        { value: 'difference' },
        { value: 'darken' },
        { value: 'exclusion' },
        { title: 'Dodge', value: 'color-dodge' },
        { value: 'screen' },
        { value: 'lighter' },
        { value: 'hue' },
        { value: 'saturation' },
        { value: 'color' },
        { value: 'luminosity' },
    ].map((mode) => {
        mode.title = mode.title || capitalizeFirstLetter(mode.value);
        return mode;
    });
}


/**
 * canvas css filters
 * values are percentage
 * contrast highest supported value for WebGL (used for Edge and Safari) is 300%
 */
const canvasFilterValues = [0, 5, 10, 15, 20, 30, 40, 50, 60, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 150, 160, 170, 180, 190, 200];


export default {
    //pixel values for smoothing filter
    smoothingValues: [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16],
    //-1 means filter disabled
    //higher values are sharper, while lower values are blurrier, so it makes more sense to reverse them
    bilateralFilterValues: [-1, 60, 50, 40, 35, 30, 25, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 7, 5, 4, 3, 0],
    outlineContourRadiusPercentages,
    outlineEdgeStrengths,
    outlineEdgeThicknesses,
    outlineFilterTypes,
    outlineColorModes,
    outlineOpacities,
    canvasBlendModes,
    canvasFilterValues,
    canvasFilterValuesDefaultIndex: canvasFilterValues.indexOf(100),
    pixelationValues,
};