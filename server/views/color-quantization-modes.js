const colorQuantizationModesModel = [
    'Random',
    {
        title: 'Random palette',
        algorithmName: 'Random.random',
        shouldResultsBeCached: false,
    },
    'Uniform',
    {
        title: 'Uniform',
        algorithmName: 'Uniform.uniform',
        options: {
            isRotated: true,
        },
    },
    {
        title: 'Uniform (alt)',
        algorithmName: 'Uniform.uniform',
    },
    'Color Wheel',
    {
        title: 'Hue wheel 1',
        algorithmName: 'Perceptual.monochrome',
    },
    {
        title: 'Hue wheel 2',
        algorithmName: 'Perceptual.monochrome',
        options: {
            hueCount: 2,
        },
    },
    {
        title: 'Hue wheel 3',
        algorithmName: 'Perceptual.monochrome',
        options: {
            hueCount: 3,
        },
    },
    {
        title: 'Hue wheel 4',
        algorithmName: 'Perceptual.monochrome',
        options: {
            hueCount: 4,
        },
    },
    {
        title: 'Hue wheel 5',
        algorithmName: 'Perceptual.monochrome',
        options: {
            hueCount: 5,
        },
    },
    {
        title: 'Hue wheel 6',
        algorithmName: 'Perceptual.monochrome',
        options: {
            hueCount: 6,
        },
    },
    {
        title: 'Hue wheel 7',
        algorithmName: 'Perceptual.monochrome',
        options: {
            hueCount: 7,
        },
    },
    {
        title: 'Hue wheel 8',
        algorithmName: 'Perceptual.monochrome',
        options: {
            hueCount: 8,
        },
    },
    {
        title: 'Hue wheel k',
        algorithmName: 'Perceptual.monochrome',
        options: {
            hueCount: -1,
        },
    },
    'ChannelsQ',
    {
        title: 'ChannelsQ (Balanced)',
        algorithmName: 'ColorChannel.colorChannel',
        options: {
            greyMix: 4,
            penaltyFuncId: 2,
        },
    },
    {
        title: 'ChannelsQ (Narrow)',
        algorithmName: 'ColorChannel.colorChannel',
        options: {
            greyMix: 16,
            penaltyFuncId: 0,
        },
    },
    {
        title: 'ChannelsQ (Vibrant)',
        algorithmName: 'ColorChannel.colorChannel',
        options: {
            greyMix: 32,
            penaltyFuncId: 1,
        },
    },
    {
        title: 'ChannelsQ (Wide)',
        algorithmName: 'ColorChannel.colorChannel',
        options: {
            greyMix: 1,
            penaltyFuncId: 2,
        },
    },
    'Artiquant 3',
    {
        title: 'Artiquant 3 (Balanced)',
        algorithmName: 'Perceptual.medianCut5',
        options: {
            hueMix: 2,
            hueClamp: true,
        },
    },
    {
        title: 'Artiquant 3 (Narrow)',
        algorithmName: 'Perceptual.medianCut5',
        options: {
            hueMix: 2,
            hueFilterLog: 8,
        },
    },
    {
        title: 'Artiquant 3 (Vibrant)',
        algorithmName: 'Perceptual.medianCut4',
        options: {
            hueMix: 2,
            hueClamp: true,
        },
    },
    {
        title: 'Artiquant 3 (Wide)',
        algorithmName: 'Perceptual.medianCut3',
        options: {
            hueMix: 2,
            isVibrant: false,
        },
    },
    'Artiquant 2',
    {
        title: 'Artiquant 2 (Balanced)',
        algorithmName: 'Perceptual.medianCut',
        options: {
            hueMix: 1.6,
        },
    },
    {
        title: 'Artiquant 2 (Narrow)',
        algorithmName: 'Perceptual.medianCut',
        options: {
            hueMix: 2,
        },
    },
    {
        title: 'Artiquant 2 (Vibrant)',
        algorithmName: 'Perceptual.medianCut',
        options: {
            hueMix: 0.6,
            isVibrant: true,
        },
    },
    {
        title: 'Artiquant 2 (Wide)',
        algorithmName: 'Perceptual.medianCut',
        options: {
            hueMix: 0.6,
        },
    },
    'Artiquant 1',
    {
        title: 'Artiquant 1 (Wide)',
        algorithmName: 'Perceptual.uniform',
    },
    {
        title: 'Artiquant 1 (Vibrant)',
        algorithmName: 'Perceptual.uniform',
        options: {
            isVibrant: true,
        },
    },
    'RGB Quant',
    {
        title: 'RGB Quant (Wide, Luma)',
        algorithmName: 'RgbQuant.rgbQuant',
        options: {
            colorDist: 'manhattan',
            method: 2,
        },
    },
    {
        title: 'RGB Quant (Wide, RGB)',
        algorithmName: 'RgbQuant.rgbQuant',
        options: {
            method: 2,
        },
    },
    {
        title: 'RGB Quant (Narrow, Luma)',
        algorithmName: 'RgbQuant.rgbQuant',
        options: {
            colorDist: 'manhattan',
            method: 1,
        },
    },
    {
        title: 'RGB Quant (Narrow, RGB)',
        algorithmName: 'RgbQuant.rgbQuant',
        options: {
            method: 1,
        },
    },
    'NeuQuant',
    {
        title: 'NeuQuant (High)',
        algorithmName: 'NeuQuant.neuQuant',
        options: {
            sample: 1,
        },
    },
    {
        title: 'NeuQuant (High alt)',
        algorithmName: 'NeuQuant.neuQuant',
        options: {
            sample: 1,
            networkSize: 128,
        },
    },
    {
        title: 'NeuQuant (Medium)',
        algorithmName: 'NeuQuant.neuQuant',
        options: {
            sample: 10,
        },
    },
    {
        title: 'NeuQuant (Medium alt)',
        algorithmName: 'NeuQuant.neuQuant',
        options: {
            sample: 10,
            networkSize: 128,
        },
    },
    {
        title: 'NeuQuant (Low)',
        algorithmName: 'NeuQuant.neuQuant',
        options: {
            sample: 30,
        },
    },
    {
        title: 'NeuQuant (Low alt)',
        algorithmName: 'NeuQuant.neuQuant',
        options: {
            sample: 30,
            networkSize: 128,
        },
    },
    'K Means',
    {
        title: 'K Means (RGB)',
        algorithmName: 'KMeans.kMeans',
    },
    {
        title: 'K Means (Luma)',
        algorithmName: 'KMeans.kMeans',
        options: {
            distanceLuma: true,
        },
    },
    'Octree',
    {
        title: 'Octree (Wide)',
        algorithmName: 'Octree.octree',
        options: {
            sort: 0,
        },
    },
    {
        title: 'Octree (Wide alt)',
        algorithmName: 'Octree.octree',
        options: {
            sort: 1,
        },
    },
    {
        title: 'Octree (Narrow)',
        algorithmName: 'Octree.octree',
        options: {
            sort: 2,
        },
    },
    {
        title: 'Octree (Narrow alt)',
        algorithmName: 'Octree.octree',
        options: {
            sort: 3,
        },
    },
    'Median Cut',
    {
        title: 'Median Cut (Narrow)',
        algorithmName: 'MedianCut.medianCut',
    },
    {
        title: 'Median Cut (Wide)',
        algorithmName: 'MedianCut.medianCut',
        options: {
            isMedian: true,
        },
    },
    'Spatial Popularity',
    {
        title: 'Spatial Popularity (Row)',
        algorithmName: 'Popularity.popularity',
    },
    {
        title: 'Spatial Popularity (Row, Crushed)',
        algorithmName: 'Popularity.popularity',
        options: {
            isPerceptual: true,
        },
    },
    {
        title: 'Spatial Popularity (Column)',
        algorithmName: 'Popularity.popularity',
        options: {
            isVertical: true,
        },
    },
    {
        title: 'Spatial Popularity (Column, Crushed)',
        algorithmName: 'Popularity.popularity',
        options: {
            isPerceptual: true,
            isVertical: true,
        },
    },
    {
        title: 'Spatial Popularity (Box)',
        algorithmName: 'Popularity.spatialPopularityBoxed',
    },
    {
        title: 'Spatial Popularity (Box, Crushed)',
        algorithmName: 'Popularity.spatialPopularityBoxed',
        options: {
            isPerceptual: true,
        },
    },
    'Sorted Popularity',
    {
        title: 'Sorted Popularity (Lightness)',
        algorithmName: 'Popularity.lightnessPopularity',
    },
    {
        title: 'Sorted Popularity (Lightness, Crushed)',
        algorithmName: 'Popularity.lightnessPopularity',
        options: {
            isPerceptual: true,
        },
    },
    {
        title: 'Sorted Popularity (Luma)',
        algorithmName: 'Popularity.lumaPopularity',
    },
    {
        title: 'Sorted Popularity (Luma, Crushed)',
        algorithmName: 'Popularity.lumaPopularity',
        options: {
            isPerceptual: true,
        },
    },
    {
        title: 'Sorted Popularity (Hue)',
        algorithmName: 'Popularity.huePopularity',
    },
    {
        title: 'Sorted Popularity (Hue, Crushed)',
        algorithmName: 'Popularity.huePopularity',
        options: {
            isPerceptual: true,
        },
    },
    'Spatial Average',
    {
        title: 'Spatial Average (Box)',
        algorithmName: 'Popularity.spatialAverageBoxed',
    },
    'Sorted Average',
    {
        title: 'Sorted Average (Lightness)',
        algorithmName: 'Popularity.lightnessAverage',
    },
    {
        title: 'Sorted Average (Lightness, Crushed)',
        algorithmName: 'Popularity.lightnessAverage',
        options: {
            isPerceptual: true,
        },
    },
    {
        title: 'Sorted Average (Hue)',
        algorithmName: 'Popularity.hueAverage',
    },
    {
        title: 'Sorted Average (Hue, Crushed)',
        algorithmName: 'Popularity.hueAverage',
        options: {
            isPerceptual: true,
        },
    },
].map((item) => {
    if (typeof item === 'string') {
        return item;
    }

    return {
        options: {},
        shouldResultsBeCached: true,
        ...item,
    };
});
