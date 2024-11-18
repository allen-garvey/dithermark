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
    ['random-palette', { algo: Random.random }],
    ['uniform', { algo: Uniform.uniform, isRotated: true }],
    ['uniform--alt', { algo: Uniform.uniform }],
    ['hue-wheel-1', { algo: Perceptual.monochrome }],
    ['hue-wheel-2', { algo: Perceptual.monochrome, hueCount: 2 }],
    ['hue-wheel-3', { algo: Perceptual.monochrome, hueCount: 3 }],
    ['hue-wheel-4', { algo: Perceptual.monochrome, hueCount: 4 }],
    ['hue-wheel-5', { algo: Perceptual.monochrome, hueCount: 5 }],
    ['hue-wheel-6', { algo: Perceptual.monochrome, hueCount: 6 }],
    ['hue-wheel-7', { algo: Perceptual.monochrome, hueCount: 7 }],
    ['hue-wheel-8', { algo: Perceptual.monochrome, hueCount: 8 }],
    ['hue-wheel-k', { algo: Perceptual.monochrome, hueCount: -1 }],
    [
        'channelsq--balanced',
        { algo: ColorChannel.colorChannel, greyMix: 4, penaltyFuncId: 2 },
    ],
    [
        'channelsq--narrow',
        { algo: ColorChannel.colorChannel, greyMix: 16, penaltyFuncId: 0 },
    ],
    [
        'channelsq--vibrant',
        { algo: ColorChannel.colorChannel, greyMix: 32, penaltyFuncId: 1 },
    ],
    [
        'channelsq--wide',
        { algo: ColorChannel.colorChannel, greyMix: 1, penaltyFuncId: 2 },
    ],
    [
        'artiquant-3--balanced',
        { algo: Perceptual.medianCut5, hueMix: 2, hueClamp: true },
    ],
    [
        'artiquant-3--narrow',
        { algo: Perceptual.medianCut5, hueMix: 2, hueFilterLog: 8 },
    ],
    [
        'artiquant-3--vibrant',
        { algo: Perceptual.medianCut4, hueMix: 2, hueClamp: true },
    ],
    [
        'artiquant-3--wide',
        { algo: Perceptual.medianCut3, hueMix: 2, isVibrant: false },
    ],
    ['artiquant-2--balanced', { algo: Perceptual.medianCut, hueMix: 1.6 }],
    ['artiquant-2--narrow', { algo: Perceptual.medianCut, hueMix: 2 }],
    [
        'artiquant-2--vibrant',
        { algo: Perceptual.medianCut, hueMix: 0.6, isVibrant: true },
    ],
    ['artiquant-2--wide', { algo: Perceptual.medianCut, hueMix: 0.6 }],
    ['artiquant-1--wide', { algo: Perceptual.uniform }],
    ['artiquant-1--vibrant', { algo: Perceptual.uniform, isVibrant: true }],
    [
        'rgb-quant--wide-luma',
        { algo: RgbQuant.rgbQuant, colorDist: 'manhattan', method: 2 },
    ],
    ['rgb-quant--wide-rgb', { algo: RgbQuant.rgbQuant, method: 2 }],
    [
        'rgb-quant--narrow-luma',
        { algo: RgbQuant.rgbQuant, colorDist: 'manhattan', method: 1 },
    ],
    ['rgb-quant--narrow-rgb', { algo: RgbQuant.rgbQuant, method: 1 }],
    ['neuquant--high', { algo: NeuQuant.neuQuant, sample: 1 }],
    [
        'neuquant--high-alt',
        { algo: NeuQuant.neuQuant, sample: 1, networkSize: 128 },
    ],
    ['neuquant--medium', { algo: NeuQuant.neuQuant, sample: 10 }],
    [
        'neuquant--medium-alt',
        { algo: NeuQuant.neuQuant, sample: 10, networkSize: 128 },
    ],
    ['neuquant--low', { algo: NeuQuant.neuQuant, sample: 30 }],
    [
        'neuquant--low-alt',
        { algo: NeuQuant.neuQuant, sample: 30, networkSize: 128 },
    ],
    ['k-means--rgb', { algo: KMeans.kMeans }],
    ['k-means--luma', { algo: KMeans.kMeans, distanceLuma: true }],
    ['octree--wide', { algo: Octree.octree, sort: 0 }],
    ['octree--wide-alt', { algo: Octree.octree, sort: 1 }],
    ['octree--narrow', { algo: Octree.octree, sort: 2 }],
    ['octree--narrow-alt', { algo: Octree.octree, sort: 3 }],
    ['median-cut--narrow', { algo: MedianCut.medianCut }],
    ['median-cut--wide', { algo: MedianCut.medianCut, isMedian: true }],
    ['spatial-popularity--row', { algo: Popularity.popularity }],
    [
        'spatial-popularity--row-crushed',
        { algo: Popularity.popularity, isPerceptual: true },
    ],
    [
        'spatial-popularity--column',
        { algo: Popularity.popularity, isVertical: true },
    ],
    [
        'spatial-popularity--column-crushed',
        { algo: Popularity.popularity, isPerceptual: true, isVertical: true },
    ],
    ['spatial-popularity--box', { algo: Popularity.spatialPopularityBoxed }],
    [
        'spatial-popularity--box-crushed',
        { algo: Popularity.spatialPopularityBoxed, isPerceptual: true },
    ],
    ['sorted-popularity--lightness', { algo: Popularity.lightnessPopularity }],
    [
        'sorted-popularity--lightness-crushed',
        { algo: Popularity.lightnessPopularity, isPerceptual: true },
    ],
    ['sorted-popularity--luma', { algo: Popularity.lumaPopularity }],
    [
        'sorted-popularity--luma-crushed',
        { algo: Popularity.lumaPopularity, isPerceptual: true },
    ],
    ['sorted-popularity--hue', { algo: Popularity.huePopularity }],
    [
        'sorted-popularity--hue-crushed',
        { algo: Popularity.huePopularity, isPerceptual: true },
    ],
    ['spatial-average--box', { algo: Popularity.spatialAverageBoxed }],
    ['sorted-average--lightness', { algo: Popularity.lightnessAverage }],
    [
        'sorted-average--lightness-crushed',
        { algo: Popularity.lightnessAverage, isPerceptual: true },
    ],
    ['sorted-average--hue', { algo: Popularity.hueAverage }],
    [
        'sorted-average--hue-crushed',
        { algo: Popularity.hueAverage, isPerceptual: true },
    ],
]);

export const getColorQuantizationAlgo = (colorQuantizationModel) =>
    algoMap.get(colorQuantizationModel.slug);
