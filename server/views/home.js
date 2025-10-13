import path from 'path';
import { render, getTemplate } from './view-helpers.js';

import { APP_NAME, COLOR_DITHER_MAX_COLORS } from '../../constants.js';

export const renderHome = ({ isProduction = false }) => {
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
            id: 'webgl-fragment-shader-lightness-function',
            path: 'fragment/shared/colors/lightness.glsl',
        },
        {
            id: 'webgl-lab-functions',
            path: 'fragment/shared/colors/lab.glsl',
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
        {
            id: 'webgl-oklab-distance',
            path: 'fragment/shared/pixel-distance/oklab-distance.glsl',
        },
        {
            id: 'webgl-oklab-taxi-distance',
            path: 'fragment/shared/pixel-distance/oklab-taxi-distance.glsl',
        },
        {
            id: 'webgl-cie-lab-distance',
            path: 'fragment/shared/pixel-distance/cie-lab-distance.glsl',
        },
        {
            id: 'webgl-cie-lab-taxi-distance',
            path: 'fragment/shared/pixel-distance/cie-lab-taxi-distance.glsl',
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
        // bw dithers
        {
            id: 'webgl-adaptive-threshold-fshader-body',
            path: 'fragment/dithers/bw/adaptive-threshold-body.glsl',
        },
        {
            id: 'webgl-adaptive-threshold-fshader-declaration',
            path: 'fragment/dithers/bw/adaptive-threshold-declaration.glsl',
        },
        {
            id: 'webgl-arithmetic-dither-fshader-body',
            path: 'fragment/dithers/bw/arithmetic-dither-body.glsl',
        },
        {
            id: 'webgl-fragment-shader-template',
            path: 'fragment/dithers/bw/bw-dither-base.glsl',
        },
        {
            id: 'webgl-color-replace-fshader-body',
            path: 'fragment/dithers/bw/color-replace-body.glsl',
        },
        {
            id: 'webgl-ordered-dither-fshader-body',
            path: 'fragment/dithers/bw/ordered-dither-body.glsl',
        },
        {
            id: 'webgl-ordered-dither-fshader-declaration',
            path: 'fragment/dithers/bw/ordered-dither-declaration.glsl',
        },
        {
            id: 'webgl-random-threshold-fshader-body',
            path: 'fragment/dithers/bw/random-threshold-body.glsl',
        },
        {
            id: 'webgl-simplex-threshold-fshader-body',
            path: 'fragment/dithers/bw/simplex-threshold-body.glsl',
        },
        {
            id: 'webgl-threshold-fshader-body',
            path: 'fragment/dithers/bw/threshold-body.glsl',
        },
        // color dither base
        {
            id: 'webgl-arithmetic-dither-color-body',
            path: 'fragment/dithers/color/base/arithmetic-color-dither-body.glsl',
        },
        {
            id: 'webgl-color-dither-base-fshader',
            path: 'fragment/dithers/color/base/color-dither-base.glsl',
            context: {
                COLOR_DITHER_MAX_COLORS,
            },
        },
        {
            id: 'webgl-hue-lightness-ordered-dither-color-declaration-fshader',
            path: 'fragment/dithers/color/base/hue-lightness-ordered-color-dither-declaration.glsl',
        },
        {
            id: 'webgl-hue-lightness-ordered-dither-color-postscript-fshader',
            path: 'fragment/dithers/color/base/hue-lightness-ordered-color-dither-postscript.glsl',
        },
        {
            id: 'webgl-ordered-dither-color-body-fshader',
            path: 'fragment/dithers/color/base/ordered-color-dither-body.glsl',
        },
        {
            id: 'webgl-ordered-dither-color-declaration-fshader',
            path: 'fragment/dithers/color/base/ordered-color-dither-declaration.glsl',
        },
        {
            id: 'webgl-random-dither-color-body-fshader',
            path: 'fragment/dithers/color/base/random-color-dither-body.glsl',
        },
        {
            id: 'webgl-simplex-dither-color-body-fshader',
            path: 'fragment/dithers/color/base/simplex-color-dither-body.glsl',
        },
        // color dithers
        {
            id: 'webgl-yliluoma1-color-fshader',
            path: 'fragment/dithers/color/yliluoma1.glsl',
            context: {
                COLOR_DITHER_MAX_COLORS,
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

    if (!isProduction) {
        //texture combine used in bw dither to combine the outputs of 3 separate dithers into 1 result image
        // while interesting, not as cool as hoped, and ui/ux is not completely clear if you don't know what it does, so it is not included in the release
        shaders.push({
            id: 'webgl-combine-dither-fshader-body',
            path: 'fragment/dithers/bw/texture-combine/texture-combine-body.glsl',
        });
        shaders.push({
            id: 'webgl-combine-dither-fshader-declaration',
            path: 'fragment/dithers/bw/texture-combine/texture-combine-declaration.glsl',
        });
    }

    const shaderPromises = Promise.all(
        shaders.map(shader =>
            getTemplate(path.join('shaders', shader.path)).then(
                shaderText =>
                    `<script type="webgl/shader" id="${shader.id}">${render(
                        shaderText,
                        shader.context || {}
                    )}</script>`
            )
        )
    ).then(shaderTexts => shaderTexts.join(''));

    return Promise.all([shaderPromises, getTemplate('index.html')]).then(
        ([shaderContent, indexTemplate]) =>
            render(indexTemplate, {
                APP_NAME,
                APP_SUPPORT_SITE_FAQ_PAGE_URL: 'https://www.dithermark.com/faq',
                GITHUB_SOURCE_URL: 'https://github.com/allen-garvey/dithermark',
                URL_ROOT: '',
                IS_DEV: !isProduction,
                shaderContent,
            })
    );
};
