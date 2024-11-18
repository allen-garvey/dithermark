import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

import {
    APP_NAME,
    UNSPLASH_API_PHOTO_ID_QUERY_KEY,
    COLOR_DITHER_MAX_COLORS,
    YLILUOMA_1_ORDERED_MATRIX_MAX_LENGTH,
} from '../constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @param {string} string
 * @param {Object.<string, string>} context
 */
const render = (string, context) => {
    // remove comments, and then empty lines caused by removing comments
    const cleanedString = string
        .replace(/^\s*\/\/.*$/gm, '')
        .replace(/^\s*\r?\n$/gm, '');

    return Object.entries(context).reduce(
        (totalString, [key, value]) =>
            totalString.replace(new RegExp(`<\\?= ${key}; \\?>`, 'g'), value),
        cleanedString
    );
};

/**
 * @param {string} filename
 */
const getTemplate = (filename) =>
    fs.readFile(path.join(__dirname, 'templates', filename), 'utf8');

export const renderUnsplashDownloadApi = () => {
    const templatePromise = getTemplate('unsplash-download.php');
    const unsplashRandomImagesPromise = fs
        .readFile(
            path.join(__dirname, '..', 'public_html', 'api', 'unsplash.json'),
            'utf8'
        )
        .then((s) =>
            JSON.stringify(JSON.parse(s).map((imageData) => imageData.download))
        );

    return Promise.all([templatePromise, unsplashRandomImagesPromise]).then(
        ([template, unsplashRandomImageData]) => {
            return render(template, {
                UNSPLASH_API_PHOTO_ID_QUERY_KEY,
                unsplashRandomImageData,
            });
        }
    );
};

export const renderHome = () => {
    const shaders = [
        // vertex
        {
            id: 'webgl-vertex-shader',
            path: 'vertex/vertex.glsl',
        },
        // filters
        {
            id: 'webgl-fragment-shader-smoothing',
            path: 'fragment/filters/smoothing.glsl',
        },
        {
            id: 'webgl-fragment-canvas-filters',
            path: 'fragment/filters/canvas-filters.glsl',
        },
        {
            id: 'webgl-fragment-shader-bilateral-filter',
            path: 'fragment/filters/bilateral-filter.glsl',
        },
        // filters edge
        {
            id: 'webgl-fragment-edge-filter-base',
            path: 'fragment/filters/edge-filters/edge-filter-base.glsl',
        },
        {
            id: 'webgl-fragment-edge-filter-declaration-background',
            path: 'fragment/filters/edge-filters/edge-filter-background.glsl',
            context: {
                COLOR_DITHER_MAX_COLORS,
            },
        },
        // filters contour
        {
            id: 'webgl-fragment-contour-filter1',
            path: 'fragment/filters/contour-filters/contour-filter1.glsl',
        },
        {
            id: 'webgl-fragment-contour-filter2-base',
            path: 'fragment/filters/contour-filters/contour-filter2-base.glsl',
        },
        {
            id: 'webgl-fragment-contour-filter2-declaration-background',
            path: 'fragment/filters/contour-filters/contour-filter2-background.glsl',
            context: {
                COLOR_DITHER_MAX_COLORS,
            },
        },
        // arithmetic dithers
        {
            id: 'webgl-bitwise-function-template',
            path: 'fragment/dithers/arithmetic-dither/bitwise-function-template.glsl',
        },
        {
            id: 'webgl-arithmetic-dither-fshader-declaration',
            path: 'fragment/dithers/arithmetic-dither/arithmetic-dither-declaration.glsl',
        },
        // shared color functions
        {
            id: 'webgl-hsl-functions',
            path: 'fragment/shared/colors/hsl.glsl',
        },
        {
            id: 'webgl-hsv-functions',
            path: 'fragment/shared/colors/hsv.glsl',
        },
        {
            id: '"webgl-fragment-shader-lightness-function',
            path: 'fragment/shared/colors/lightness.glsl',
        },
        // shared pixel distance functions
        {
            id: 'webgl-hsl2-complementary-distance',
            path: 'fragment/shared/pixel-distance/hsl2-complement-distance.glsl',
        },
        {
            id: 'webgl-hsl2-distance',
            path: 'fragment/shared/pixel-distance/hsl2-distance.glsl',
        },
        {
            id: 'webgl-hue-distance',
            path: 'fragment/shared/pixel-distance/hue-distance.glsl',
        },
        {
            id: 'webgl-hue-lightness-distance',
            path: 'fragment/shared/pixel-distance/hue-lightness-distance.glsl',
        },
        {
            id: 'webgl-hue-saturation-lightness-distance',
            path: 'fragment/shared/pixel-distance/hue-saturation-lightness-distance.glsl',
        },
        {
            id: 'webgl-lightness-distance',
            path: 'fragment/shared/pixel-distance/lightness-distance.glsl',
        },
        {
            id: 'webgl-luma-distance',
            path: 'fragment/shared/pixel-distance/luma-distance.glsl',
        },
        {
            id: 'webgl-rgb-distance',
            path: 'fragment/shared/pixel-distance/rgb-distance.glsl',
        },
        // shared dithers
        {
            id: 'webgl-random-dither-declaration-fshader',
            path: 'fragment/dithers/shared/random-dither-declaration.glsl',
        },
        {
            id: 'webgl-simplex-declaration-fshader',
            path: 'fragment/dithers/shared/simplex-declaration.glsl',
        },
        // color dithers
        {
            id: 'webgl-yliluoma1-color-fshader',
            path: 'fragment/dithers/color/yliluoma1.glsl',
            context: {
                COLOR_DITHER_MAX_COLORS,
                YLILUOMA_1_ORDERED_MATRIX_MAX_LENGTH,
            },
        },
        {
            id: 'webgl-yliluoma2-color-fshader',
            path: 'fragment/dithers/color/yliluoma2.glsl',
            context: {
                COLOR_DITHER_MAX_COLORS,
            },
        },
        {
            id: 'webgl-stark-ordered-color-dither-fshader',
            path: 'fragment/dithers/color/stark-ordered-dither.glsl',
            context: {
                COLOR_DITHER_MAX_COLORS,
            },
        },
    ];

    const shaderPromises = Promise.all(
        shaders.map((shader) =>
            getTemplate(path.join('shaders', shader.path)).then(
                (shaderText) =>
                    `<script type="webgl/shader" id="${shader.id}">${render(
                        shaderText,
                        shader.context || {}
                    )}</script>`
            )
        )
    ).then((shaderTexts) => shaderTexts.join(''));

    return Promise.all([shaderPromises, getTemplate('index.html')]).then(
        ([shaderContent, indexTemplate]) =>
            render(indexTemplate, {
                APP_NAME,
                APP_SUPPORT_SITE_FAQ_PAGE_URL: 'https://www.dithermark.com/faq',
                GITHUB_SOURCE_URL: 'https://github.com/allen-garvey/dithermark',
                shaderContent: shaderContent,
            })
    );
};
