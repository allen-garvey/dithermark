import { YLILUOMA_1_ORDERED_MATRIX_MAX_DIMENSIONS } from '../../../constants.js';

const getOrderedDitherPatterns = () => [
    { title: 'Bayer 2×2', pattern: 'bayer', dimensions: 2 },
    { title: 'Bayer 4×4', pattern: 'bayer', dimensions: 4 },
    { title: 'Bayer 8×8', pattern: 'bayer', dimensions: 8 },
    { title: 'Bayer 16×16', pattern: 'bayer', dimensions: 16 },
    { title: 'Hatch Horizontal', pattern: 'hatchHorizontal', dimensions: 4 },
    { title: 'Hatch Vertical', pattern: 'hatchVertical', dimensions: 4 },
    { title: 'Hatch Right', pattern: 'hatchRight', dimensions: 4 },
    { title: 'Hatch Left', pattern: 'hatchLeft', dimensions: 4 },
    {
        title: 'Cross Hatch Horizontal',
        pattern: 'crossHatchHorizontal',
        dimensions: 4,
    },
    {
        title: 'Cross Hatch Vertical',
        pattern: 'crossHatchVertical',
        dimensions: 4,
    },
    { title: 'Cross Hatch Right', pattern: 'crossHatchRight', dimensions: 4 },
    { title: 'Cross Hatch Left', pattern: 'crossHatchLeft', dimensions: 4 },
    {
        title: 'Zigzag Horizontal 4×4',
        pattern: 'zigzagHorizontal',
        dimensions: 4,
    },
    { title: 'Zigzag Vertical 4×4', pattern: 'zigzagVertical', dimensions: 4 },
    {
        title: 'Zigzag Horizontal 8×8',
        pattern: 'zigzagHorizontal',
        dimensions: 8,
    },
    { title: 'Zigzag Vertical 8×8', pattern: 'zigzagVertical', dimensions: 8 },
    {
        title: 'Zigzag Horizontal 16×16',
        pattern: 'zigzagHorizontal',
        dimensions: 16,
    },
    {
        title: 'Zigzag Vertical 16×16',
        pattern: 'zigzagVertical',
        dimensions: 16,
    },
    { title: 'Checkerboard', pattern: 'checkerboard', dimensions: 2 },
    { title: 'Cluster', pattern: 'cluster', dimensions: 4 },
    { title: 'Fishnet', pattern: 'fishnet', dimensions: 8 },
    { title: 'Dot 4×4', pattern: 'dot', dimensions: 4 },
    { title: 'Dot 8×8', pattern: 'dot', dimensions: 8 },
    { title: 'Halftone', pattern: 'halftone', dimensions: 8 },
    { title: 'Square 2×2', pattern: 'square', dimensions: 2 },
    { title: 'Square 4×4', pattern: 'square', dimensions: 4 },
    { title: 'Square 8×8', pattern: 'square', dimensions: 8 },
    { title: 'Square 16×16', pattern: 'square', dimensions: 16 },
];

const getBwOrderedModels = () =>
    getOrderedDitherPatterns().map((model) => {
        const { title, ...orderedOpts } = model;
        const slug = `ordered--${orderedOpts.pattern}-${orderedOpts.dimensions}`;

        return {
            title,
            items: [
                {
                    title,
                    slug,
                    orderedOpts,
                },
                {
                    title: `${title} (R)`,
                    slug: `${slug}--r`,
                    orderedOpts: {
                        ...orderedOpts,
                        isRandom: true,
                    },
                },
            ],
        };
    });

const getColorOrderedModels = () =>
    getOrderedDitherPatterns().map((model) => {
        const { title, ...orderedOpts } = model;
        const dimensions = orderedOpts.dimensions;
        const slug = `ordered--${orderedOpts.pattern}-${dimensions}`;

        const items = [
            {
                title,
                slug,
                orderedOpts,
            },
            {
                title: `${title} (R)`,
                slug: `${slug}--r`,
                orderedOpts: {
                    ...orderedOpts,
                    isRandom: true,
                },
            },
            {
                title: `Stark ${title}`,
                slug: `${slug}--stark`,
                orderedOpts: {
                    ...orderedOpts,
                    type: 'stark',
                },
            },
            {
                title: `Hue-Lightness ${title}`,
                slug: `${slug}--hl`,
                orderedOpts: {
                    ...orderedOpts,
                    type: 'hue-lightness',
                },
            },
            {
                title: `Hue-Lightness ${title} (R)`,
                slug: `${slug}--hl-r`,
                orderedOpts: {
                    ...orderedOpts,
                    type: 'hue-lightness',
                    isRandom: true,
                },
            },
        ];

        if (dimensions <= YLILUOMA_1_ORDERED_MATRIX_MAX_DIMENSIONS) {
            items.push({
                title: `Yliluoma 1 ${title}`,
                slug: `${slug}--y1`,
                orderedOpts: {
                    ...orderedOpts,
                    type: 'yliluoma-1',
                },
            });
        }

        items.push({
            title: `Yliluoma 2 ${title}`,
            slug: `${slug}--y2`,
            orderedOpts: {
                ...orderedOpts,
                type: 'yliluoma-2',
            },
        });

        return {
            title,
            items,
        };
    });

const getArithmeticModel = () => ({
    title: 'Arithmetic',
    items: [
        { title: 'XOR (High)', slug: 'xor--high' },
        { title: 'XOR (Medium)', slug: 'xor--medium' },
        { title: 'XOR (Low)', slug: 'xor--low' },
        { title: 'ADD (High)', slug: 'add--high' },
        { title: 'ADD (Medium)', slug: 'add--medium' },
        { title: 'ADD (Low)', slug: 'add--low' },
    ],
});

const getDiffusionModel = () => ({
    title: 'Diffusion',
    items: [
        { title: 'Floyd-Steinberg', slug: 'floyd-steinberg' },
        { title: 'Javis-Judice-Ninke', slug: 'javis-judice-ninke' },
        { title: 'Stucki', slug: 'stucki' },
        { title: 'Burkes', slug: 'burkes' },
        { title: 'Sierra 3', slug: 'sierra-3' },
        { title: 'Sierra 2', slug: 'sierra-2' },
        { title: 'Sierra 1', slug: 'sierra-1' },
    ],
});

const getDiffusionReducedBleedModel = () => ({
    title: 'Diffusion (Reduced Bleed)',
    items: [
        { title: 'Atkinson', slug: 'atkinson' },
        { title: 'Reduced Atkinson', slug: 'reduced-atkinson' },
    ],
});

export const getBwDitherModel = () =>
    [
        {
            title: 'Threshold',
            items: [
                { title: 'Threshold', slug: 'threshold' },
                { title: 'Adaptive Threshold', slug: 'adaptive-threshold' },
            ],
        },
        {
            title: 'Random',
            items: [
                { title: 'Random', slug: 'random' },
                { title: 'Simplex', slug: 'simplex' },
            ],
        },
        getArithmeticModel(),
        getDiffusionModel(),
        getDiffusionReducedBleedModel(),
    ].concat(getBwOrderedModels());

export const getColorDitherModel = () =>
    [
        {
            title: 'Threshold',
            items: [{ title: 'Closest Color', slug: 'closest-color' }],
        },
        {
            title: 'Random',
            items: [{ title: 'Random', slug: 'random' }],
        },
        getArithmeticModel(),
        getDiffusionModel(),
        getDiffusionReducedBleedModel(),
    ].concat(getColorOrderedModels());

const flattenModel = (model) => model.flatMap((group) => group.items);

export const getColorAlgorithms = () => flattenModel(getColorDitherModel());
export const getBwAlgorithms = () => flattenModel(getBwDitherModel());
