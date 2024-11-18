export const colorQuantizationModesModel = [
    {
        title: 'Random',
        items: [
            {
                title: 'Random palette',
                slug: 'random-palette',
                disableCache: true,
            },
        ],
    },

    {
        title: 'Uniform',
        items: [
            { title: 'Uniform', slug: 'uniform' },
            { title: 'Uniform (alt)', slug: 'uniform--alt' },
        ],
    },

    {
        title: 'Color Wheel',
        items: [
            { title: 'Hue wheel 1', slug: 'hue-wheel-1' },
            { title: 'Hue wheel 2', slug: 'hue-wheel-2' },
            { title: 'Hue wheel 3', slug: 'hue-wheel-3' },
            { title: 'Hue wheel 4', slug: 'hue-wheel-4' },
            { title: 'Hue wheel 5', slug: 'hue-wheel-5' },
            { title: 'Hue wheel 6', slug: 'hue-wheel-6' },
            { title: 'Hue wheel 7', slug: 'hue-wheel-7' },
            { title: 'Hue wheel 8', slug: 'hue-wheel-8' },
            { title: 'Hue wheel k', slug: 'hue-wheel-k' },
        ],
    },

    {
        title: 'ChannelsQ',
        items: [
            { title: 'ChannelsQ (Balanced)', slug: 'channelsq--balanced' },
            { title: 'ChannelsQ (Narrow)', slug: 'channelsq--narrow' },
            { title: 'ChannelsQ (Vibrant)', slug: 'channelsq--vibrant' },
            { title: 'ChannelsQ (Wide)', slug: 'channelsq--wide' },
        ],
    },

    {
        title: 'Artiquant 3',
        items: [
            { title: 'Artiquant 3 (Balanced)', slug: 'artiquant-3--balanced' },
            { title: 'Artiquant 3 (Narrow)', slug: 'artiquant-3--narrow' },
            { title: 'Artiquant 3 (Vibrant)', slug: 'artiquant-3--vibrant' },
            { title: 'Artiquant 3 (Wide)', slug: 'artiquant-3--wide' },
        ],
    },

    {
        title: 'Artiquant 2',
        items: [
            { title: 'Artiquant 2 (Balanced)', slug: 'artiquant-2--balanced' },
            { title: 'Artiquant 2 (Narrow)', slug: 'artiquant-2--narrow' },
            { title: 'Artiquant 2 (Vibrant)', slug: 'artiquant-2--vibrant' },
            { title: 'Artiquant 2 (Wide)', slug: 'artiquant-2--wide' },
        ],
    },

    {
        title: 'Artiquant 1',
        items: [
            { title: 'Artiquant 1 (Wide)', slug: 'artiquant-1--wide' },
            { title: 'Artiquant 1 (Vibrant)', slug: 'artiquant-1--vibrant' },
        ],
    },

    {
        title: 'RGB Quant',
        items: [
            { title: 'RGB Quant (Wide, Luma)', slug: 'rgb-quant--wide-luma' },
            { title: 'RGB Quant (Wide, RGB)', slug: 'rgb-quant--wide-rgb' },
            {
                title: 'RGB Quant (Narrow, Luma)',
                slug: 'rgb-quant--narrow-luma',
            },
            { title: 'RGB Quant (Narrow, RGB)', slug: 'rgb-quant--narrow-rgb' },
        ],
    },

    {
        title: 'NeuQuant',
        items: [
            { title: 'NeuQuant (High)', slug: 'neuquant--high' },
            { title: 'NeuQuant (High alt)', slug: 'neuquant--high-alt' },
            { title: 'NeuQuant (Medium)', slug: 'neuquant--medium' },
            { title: 'NeuQuant (Medium alt)', slug: 'neuquant--medium-alt' },
            { title: 'NeuQuant (Low)', slug: 'neuquant--low' },
            { title: 'NeuQuant (Low alt)', slug: 'neuquant--low-alt' },
        ],
    },

    {
        title: 'K Means',
        items: [
            { title: 'K Means (RGB)', slug: 'k-means--rgb' },
            { title: 'K Means (Luma)', slug: 'k-means--luma' },
        ],
    },

    {
        title: 'Octree',
        items: [
            { title: 'Octree (Wide)', slug: 'octree--wide' },
            { title: 'Octree (Wide alt)', slug: 'octree--wide-alt' },
            { title: 'Octree (Narrow)', slug: 'octree--narrow' },
            { title: 'Octree (Narrow alt)', slug: 'octree--narrow-alt' },
        ],
    },

    {
        title: 'Median Cut',
        items: [
            { title: 'Median Cut (Narrow)', slug: 'median-cut--narrow' },
            { title: 'Median Cut (Wide)', slug: 'median-cut--wide' },
        ],
    },

    {
        title: 'Spatial Popularity',
        items: [
            {
                title: 'Spatial Popularity (Row)',
                slug: 'spatial-popularity--row',
            },
            {
                title: 'Spatial Popularity (Row, Crushed)',
                slug: 'spatial-popularity--row-crushed',
            },
            {
                title: 'Spatial Popularity (Column)',
                slug: 'spatial-popularity--column',
            },
            {
                title: 'Spatial Popularity (Column, Crushed)',
                slug: 'spatial-popularity--column-crushed',
            },
            {
                title: 'Spatial Popularity (Box)',
                slug: 'spatial-popularity--box',
            },
            {
                title: 'Spatial Popularity (Box, Crushed)',
                slug: 'spatial-popularity--box-crushed',
            },
        ],
    },

    {
        title: 'Sorted Popularity',
        items: [
            {
                title: 'Sorted Popularity (Lightness)',
                slug: 'sorted-popularity--lightness',
            },
            {
                title: 'Sorted Popularity (Lightness, Crushed)',
                slug: 'sorted-popularity--lightness-crushed',
            },
            {
                title: 'Sorted Popularity (Luma)',
                slug: 'sorted-popularity--luma',
            },
            {
                title: 'Sorted Popularity (Luma, Crushed)',
                slug: 'sorted-popularity--luma-crushed',
            },
            {
                title: 'Sorted Popularity (Hue)',
                slug: 'sorted-popularity--hue',
            },
            {
                title: 'Sorted Popularity (Hue, Crushed)',
                slug: 'sorted-popularity--hue-crushed',
            },
        ],
    },

    {
        title: 'Spatial Average',
        items: [
            { title: 'Spatial Average (Box)', slug: 'spatial-average--box' },
        ],
    },

    {
        title: 'Sorted Average',
        items: [
            {
                title: 'Sorted Average (Lightness)',
                slug: 'sorted-average--lightness',
            },
            {
                title: 'Sorted Average (Lightness, Crushed)',
                slug: 'sorted-average--lightness-crushed',
            },
            { title: 'Sorted Average (Hue)', slug: 'sorted-average--hue' },
            {
                title: 'Sorted Average (Hue, Crushed)',
                slug: 'sorted-average--hue-crushed',
            },
        ],
    },
];

export const getColorQuantizationModes = () =>
    colorQuantizationModesModel.flatMap((group) => group.items);
