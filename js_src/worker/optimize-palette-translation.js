import Popularity from './optimize-palette/popularity.js';
import MedianCut from './optimize-palette/median-cut.js';
import RgbQuant from './optimize-palette/rgb-quant.js';
import Perceptual from './optimize-palette/perceptual.js';
import Octree from './optimize-palette/octree.js';
import KMeans from './optimize-palette/k-means.js';
import Random from './optimize-palette/random.js';
import ColorChannel from './optimize-palette/color-channel.js';
import Uniform from './optimize-palette/uniform.js';
import NeuQuant from './optimize-palette/neu-quant.js';

const algoMap = new Map([
    ['random-palette', { algo: Random.random, options: {} }],
    ['uniform', { algo: Uniform.uniform, options: { isRotated: true } }],
    ['uniform--alt', { algo: Uniform.uniform, options: {} }],
    ['hue-wheel-1', { algo: Perceptual.monochrome, options: {} }],
    ['hue-wheel-2', { algo: Perceptual.monochrome, options: { hueCount: 2 } }],
    ['hue-wheel-3', { algo: Perceptual.monochrome, options: { hueCount: 3 } }],
    ['hue-wheel-4', { algo: Perceptual.monochrome, options: { hueCount: 4 } }],
    ['hue-wheel-5', { algo: Perceptual.monochrome, options: { hueCount: 5 } }],
    ['hue-wheel-6', { algo: Perceptual.monochrome, options: { hueCount: 6 } }],
    ['hue-wheel-7', { algo: Perceptual.monochrome, options: { hueCount: 7 } }],
    ['hue-wheel-8', { algo: Perceptual.monochrome, options: { hueCount: 8 } }],
    ['hue-wheel-k', { algo: Perceptual.monochrome, options: { hueCount: -1 } }],
    [
        'channelsq--balanced',
        {
            algo: ColorChannel.colorChannel,

            options: { greyMix: 4, penaltyFuncId: 2 },
        },
    ],
    [
        'channelsq--narrow',
        {
            algo: ColorChannel.colorChannel,

            options: { greyMix: 16, penaltyFuncId: 0 },
        },
    ],
    [
        'channelsq--vibrant',
        {
            algo: ColorChannel.colorChannel,

            options: { greyMix: 32, penaltyFuncId: 1 },
        },
    ],
    [
        'channelsq--wide',
        {
            algo: ColorChannel.colorChannel,

            options: { greyMix: 1, penaltyFuncId: 2 },
        },
    ],
    [
        'artiquant-3--balanced',
        { algo: Perceptual.medianCut5, options: { hueMix: 2, hueClamp: true } },
    ],
    [
        'artiquant-3--narrow',
        {
            algo: Perceptual.medianCut5,

            options: { hueMix: 2, hueFilterLog: 8 },
        },
    ],
    [
        'artiquant-3--vibrant',
        { algo: Perceptual.medianCut4, options: { hueMix: 2, hueClamp: true } },
    ],
    [
        'artiquant-3--wide',
        {
            algo: Perceptual.medianCut3,

            options: { hueMix: 2, isVibrant: false },
        },
    ],
    [
        'artiquant-2--balanced',
        { algo: Perceptual.medianCut, options: { hueMix: 1.6 } },
    ],
    [
        'artiquant-2--narrow',
        { algo: Perceptual.medianCut, options: { hueMix: 2 } },
    ],
    [
        'artiquant-2--vibrant',
        {
            algo: Perceptual.medianCut,

            options: { hueMix: 0.6, isVibrant: true },
        },
    ],
    [
        'artiquant-2--wide',
        { algo: Perceptual.medianCut, options: { hueMix: 0.6 } },
    ],
    ['artiquant-1--wide', { algo: Perceptual.uniform, options: {} }],
    [
        'artiquant-1--vibrant',
        { algo: Perceptual.uniform, options: { isVibrant: true } },
    ],
    [
        'rgb-quant--wide-luma',
        {
            algo: RgbQuant.rgbQuant,

            options: { colorDist: 'manhattan', method: 2 },
        },
    ],
    [
        'rgb-quant--wide-rgb',
        { algo: RgbQuant.rgbQuant, options: { method: 2 } },
    ],
    [
        'rgb-quant--narrow-luma',
        {
            algo: RgbQuant.rgbQuant,

            options: { colorDist: 'manhattan', method: 1 },
        },
    ],
    [
        'rgb-quant--narrow-rgb',
        { algo: RgbQuant.rgbQuant, options: { method: 1 } },
    ],
    ['neuquant--high', { algo: NeuQuant.neuQuant, options: { sample: 1 } }],
    [
        'neuquant--high-alt',
        { algo: NeuQuant.neuQuant, options: { sample: 1, networkSize: 128 } },
    ],
    ['neuquant--medium', { algo: NeuQuant.neuQuant, options: { sample: 10 } }],
    [
        'neuquant--medium-alt',
        { algo: NeuQuant.neuQuant, options: { sample: 10, networkSize: 128 } },
    ],
    ['neuquant--low', { algo: NeuQuant.neuQuant, options: { sample: 30 } }],
    [
        'neuquant--low-alt',
        { algo: NeuQuant.neuQuant, options: { sample: 30, networkSize: 128 } },
    ],
    ['k-means--rgb', { algo: KMeans.kMeans, options: {} }],
    ['k-means--luma', { algo: KMeans.kMeans, options: { distanceLuma: true } }],
    ['octree--wide', { algo: Octree.octree, options: { sort: 0 } }],
    ['octree--wide-alt', { algo: Octree.octree, options: { sort: 1 } }],
    ['octree--narrow', { algo: Octree.octree, options: { sort: 2 } }],
    ['octree--narrow-alt', { algo: Octree.octree, options: { sort: 3 } }],
    ['median-cut--narrow', { algo: MedianCut.medianCut, options: {} }],
    [
        'median-cut--wide',
        { algo: MedianCut.medianCut, options: { isMedian: true } },
    ],
    ['spatial-popularity--row', { algo: Popularity.popularity, options: {} }],
    [
        'spatial-popularity--row-crushed',
        { algo: Popularity.popularity, options: { isPerceptual: true } },
    ],
    [
        'spatial-popularity--column',
        { algo: Popularity.popularity, options: { isVertical: true } },
    ],
    [
        'spatial-popularity--column-crushed',
        {
            algo: Popularity.popularity,

            options: { isPerceptual: true, isVertical: true },
        },
    ],
    [
        'spatial-popularity--box',
        { algo: Popularity.spatialPopularityBoxed, options: {} },
    ],
    [
        'spatial-popularity--box-crushed',
        {
            algo: Popularity.spatialPopularityBoxed,

            options: { isPerceptual: true },
        },
    ],
    [
        'sorted-popularity--lightness',
        { algo: Popularity.lightnessPopularity, options: {} },
    ],
    [
        'sorted-popularity--lightness-crushed',
        {
            algo: Popularity.lightnessPopularity,

            options: { isPerceptual: true },
        },
    ],
    [
        'sorted-popularity--luma',
        { algo: Popularity.lumaPopularity, options: {} },
    ],
    [
        'sorted-popularity--luma-crushed',
        { algo: Popularity.lumaPopularity, options: { isPerceptual: true } },
    ],
    ['sorted-popularity--hue', { algo: Popularity.huePopularity, options: {} }],
    [
        'sorted-popularity--hue-crushed',
        { algo: Popularity.huePopularity, options: { isPerceptual: true } },
    ],
    [
        'spatial-average--box',
        { algo: Popularity.spatialAverageBoxed, options: {} },
    ],
    [
        'sorted-average--lightness',
        { algo: Popularity.lightnessAverage, options: {} },
    ],
    [
        'sorted-average--lightness-crushed',
        { algo: Popularity.lightnessAverage, options: { isPerceptual: true } },
    ],
    ['sorted-average--hue', { algo: Popularity.hueAverage, options: {} }],
    [
        'sorted-average--hue-crushed',
        { algo: Popularity.hueAverage, options: { isPerceptual: true } },
    ],
]);

export const getColorQuantizationAlgo = (colorQuantizationModel) =>
    algoMap.get(colorQuantizationModel.slug);
